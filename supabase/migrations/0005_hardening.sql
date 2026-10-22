-- Extra validation: rate-limit public booking creates by phone number.
create or replace function public.create_public_booking(
  p_service_ids uuid[],
  p_staff_id uuid,
  p_starts_at timestamptz,
  p_client_name text,
  p_client_phone text,
  p_client_email text,
  p_notes text,
  p_consent boolean,
  p_policy_agreed boolean,
  p_source public.booking_source default 'online'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_staff_id uuid;
  v_duration int := 0;
  v_price numeric := 0;
  v_deposit numeric := 0;
  v_requires boolean := false;
  v_ends timestamptz;
  v_client_id uuid;
  v_booking_id uuid;
  v_ref text;
  v_token text;
  v_hold interval;
  v_settings jsonb;
  v_status public.booking_status;
  v_svc record;
  v_reminder int;
  v_phone text;
begin
  if coalesce(p_consent, false) is not true or coalesce(p_policy_agreed, false) is not true then
    raise exception 'Consent and cancellation policy agreement are required';
  end if;
  if p_client_name is null or length(trim(p_client_name)) < 2 then
    raise exception 'Please enter your name';
  end if;
  v_phone := regexp_replace(coalesce(p_client_phone, ''), '\s', '', 'g');
  if length(v_phone) < 9 then
    raise exception 'Please enter a valid phone number';
  end if;
  if p_service_ids is null or array_length(p_service_ids, 1) is null then
    raise exception 'Choose at least one service';
  end if;

  if not public.consume_rate_limit('book:' || v_phone, 5, 600) then
    raise exception 'Please wait a few minutes before booking again';
  end if;

  select data into v_settings from public.business_settings where id = 1;
  v_hold := make_interval(hours => coalesce((v_settings->>'deposit_hold_hours')::int, 24));
  v_reminder := coalesce((v_settings->>'reminder_hours')::int, 24);

  if p_staff_id is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_staff_id::text, 0));
    v_staff_id := p_staff_id;
  end if;

  for v_svc in
    select * from public.services
    where id = any (p_service_ids) and is_visible = true
  loop
    v_duration := v_duration + v_svc.duration_minutes;
    v_price := v_price + v_svc.price_ghs;
    if v_svc.requires_deposit then
      v_requires := true;
      if v_svc.deposit_kind = 'percent' then
        v_deposit := v_deposit + round(v_svc.price_ghs * v_svc.deposit_value / 100.0, 2);
      else
        v_deposit := v_deposit + v_svc.deposit_value;
      end if;
    end if;
  end loop;

  if v_duration = 0 then
    raise exception 'Services not found';
  end if;

  v_ends := p_starts_at + make_interval(mins => v_duration);

  if v_staff_id is null then
    select s.staff_id into v_staff_id
    from public.get_available_slots(p_service_ids, null, (p_starts_at at time zone 'Africa/Accra')::date) s
    where s.starts_at = p_starts_at
    order by s.staff_name
    limit 1;

    if v_staff_id is null then
      raise exception 'That time is no longer available';
    end if;
    perform pg_advisory_xact_lock(hashtextextended(v_staff_id::text, 0));
  end if;

  if not public.slot_is_valid(v_staff_id, p_starts_at, v_ends, null) then
    raise exception 'That time is no longer available';
  end if;

  if (
    select count(*) from public.staff_services
    where staff_id = v_staff_id and service_id = any (p_service_ids)
  ) <> array_length(p_service_ids, 1) then
    raise exception 'This team member does not offer one of the selected services';
  end if;

  insert into public.clients (full_name, phone, email, consent_at)
  values (trim(p_client_name), v_phone, nullif(trim(p_client_email), ''), now())
  on conflict (phone) do update
    set full_name = excluded.full_name,
        email = coalesce(excluded.email, public.clients.email),
        consent_at = coalesce(public.clients.consent_at, excluded.consent_at)
  returning id into v_client_id;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_ref := 'ML-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
  v_status := case when v_requires then 'pending_deposit'::public.booking_status else 'confirmed'::public.booking_status end;

  insert into public.bookings (
    reference, client_id, staff_id, starts_at, ends_at, status, source, notes,
    total_price, deposit_required, deposit_amount, deposit_received,
    deposit_hold_until, manage_token_hash, created_by
  ) values (
    v_ref, v_client_id, v_staff_id, p_starts_at, v_ends, v_status, p_source, nullif(p_notes, ''),
    v_price, v_requires, v_deposit, false,
    case when v_requires then now() + v_hold else null end,
    public.hash_manage_token(v_token),
    auth.uid()
  )
  returning id into v_booking_id;

  insert into public.booking_services (booking_id, service_id, name_snapshot, duration_minutes, price_ghs)
  select v_booking_id, s.id, s.name, s.duration_minutes, s.price_ghs
  from public.services s
  where s.id = any (p_service_ids);

  insert into public.notification_jobs (booking_id, channel, kind, payload, scheduled_for, status)
  values (
    v_booking_id, 'email', 'confirmation',
    jsonb_build_object('manage_token', v_token),
    now(), 'queued'
  );

  if v_status = 'confirmed' then
    insert into public.notification_jobs (booking_id, channel, kind, payload, scheduled_for)
    values (
      v_booking_id, 'email', 'reminder',
      jsonb_build_object('manage_token', v_token),
      p_starts_at - make_interval(hours => v_reminder)
    );
  end if;

  perform public.log_activity('booking.created', 'booking', v_booking_id::text,
    jsonb_build_object('reference', v_ref, 'status', v_status));

  return jsonb_build_object(
    'id', v_booking_id,
    'reference', v_ref,
    'status', v_status,
    'starts_at', p_starts_at,
    'ends_at', v_ends,
    'staff_id', v_staff_id,
    'total_price', v_price,
    'deposit_required', v_requires,
    'deposit_amount', v_deposit,
    'deposit_hold_until', case when v_requires then now() + v_hold else null end,
    'manage_token', v_token,
    'mobile_money', case when v_requires then v_settings->'mobile_money' else null end,
    'payment_note', 'Payment is made in person at the salon. No online payment in this version.'
  );
end;
$$;
