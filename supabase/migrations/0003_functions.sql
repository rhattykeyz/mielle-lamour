-- Server-side booking, availability, cancel/reschedule, deposits.
-- These are the only path anonymous users have into booking data.

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  v_count int;
begin
  insert into public.rate_limits (key, window_start, hit_count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
  do update set hit_count = public.rate_limits.hit_count + 1
  returning hit_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, int, int) from public, anon, authenticated;

create or replace function public.get_public_settings()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d jsonb;
begin
  select data into d from public.business_settings where id = 1;
  if d is null then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'business_name', d->>'business_name',
    'tagline', d->>'tagline',
    'address', d->>'address',
    'area', d->>'area',
    'city', d->>'city',
    'map_embed_url', d->>'map_embed_url',
    'phone', d->>'phone',
    'whatsapp', d->>'whatsapp',
    'email', d->>'email',
    'instagram', d->>'instagram',
    'tiktok', d->>'tiktok',
    'opening_hours', d->'opening_hours',
    'opening_hours_note', d->>'opening_hours_note',
    'cancellation_policy', d->>'cancellation_policy',
    'privacy_notice', d->>'privacy_notice',
    'logo_url', d->>'logo_url',
    'currency', coalesce(d->>'currency', 'GHS'),
    'timezone', coalesce(d->>'timezone', 'Africa/Accra')
  );
end;
$$;

grant execute on function public.get_public_settings() to anon, authenticated;

create or replace function public.log_activity(
  p_action text,
  p_entity text,
  p_entity_id text,
  p_meta jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_log (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), p_action, p_entity, p_entity_id, coalesce(p_meta, '{}'::jsonb));
end;
$$;

create or replace function public.settings_int(p_path text[], p_default int)
returns int
language sql
stable
as $$
  select coalesce((select (data #>> p_path)::int from public.business_settings where id = 1), p_default);
$$;

create or replace function public.slot_is_valid(
  p_staff_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_ignore_booking uuid default null
) returns boolean
language plpgsql
stable
as $$
declare
  v_settings jsonb;
  v_min_notice int;
  v_max_days int;
  v_buffer int;
  v_weekday int;
  v_start time;
  v_end time;
  v_off boolean;
  v_busy int;
begin
  select data into v_settings from public.business_settings where id = 1;
  v_min_notice := coalesce((v_settings->>'min_notice_minutes')::int, 120);
  v_max_days := coalesce((v_settings->>'max_advance_days')::int, 60);
  v_buffer := coalesce((v_settings->>'buffer_minutes')::int, 15);

  if p_starts_at < now() + make_interval(mins => v_min_notice) then
    return false;
  end if;
  if p_starts_at > now() + make_interval(days => v_max_days) then
    return false;
  end if;

  if exists (
    select 1 from public.closures c
    where (p_starts_at at time zone 'Africa/Accra')::date between c.starts_on and c.ends_on
  ) then
    return false;
  end if;

  if exists (
    select 1 from public.staff_time_off t
    where t.staff_id = p_staff_id
      and (p_starts_at at time zone 'Africa/Accra')::date between t.starts_on and t.ends_on
  ) then
    return false;
  end if;

  v_weekday := extract(dow from (p_starts_at at time zone 'Africa/Accra'));
  select start_time, end_time, is_off
    into v_start, v_end, v_off
  from public.staff_working_hours
  where staff_id = p_staff_id and weekday = v_weekday;

  if not found or v_off then
    return false;
  end if;

  if (p_starts_at at time zone 'Africa/Accra')::time < v_start then
    return false;
  end if;
  if (p_ends_at at time zone 'Africa/Accra')::time > v_end then
    return false;
  end if;

  select count(*) into v_busy
  from public.bookings b
  where b.staff_id = p_staff_id
    and b.status in ('pending_deposit', 'confirmed', 'completed')
    and (p_ignore_booking is null or b.id <> p_ignore_booking)
    and tstzrange(b.starts_at, b.ends_at + make_interval(mins => v_buffer), '[)') &&
        tstzrange(p_starts_at, p_ends_at + make_interval(mins => v_buffer), '[)');

  return v_busy = 0;
end;
$$;

create or replace function public.get_available_slots(
  p_service_ids uuid[],
  p_staff_id uuid,
  p_date date
)
returns table (
  staff_id uuid,
  staff_name text,
  starts_at timestamptz,
  ends_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration int;
  v_staff record;
  v_cursor timestamptz;
  v_end timestamptz;
  v_day_start timestamptz;
  v_day_end timestamptz;
  v_hours record;
begin
  if p_service_ids is null or array_length(p_service_ids, 1) is null then
    raise exception 'Choose at least one service';
  end if;

  select coalesce(sum(s.duration_minutes), 0) into v_duration
  from public.services s
  where s.id = any (p_service_ids) and s.is_visible = true;

  if v_duration <= 0 then
    raise exception 'Services not found';
  end if;

  for v_staff in
    select st.id, st.full_name
    from public.staff st
    where st.is_active = true
      and (p_staff_id is null or st.id = p_staff_id)
      and (
        select count(*) from public.staff_services ss
        where ss.staff_id = st.id and ss.service_id = any (p_service_ids)
      ) = array_length(p_service_ids, 1)
  loop
    select * into v_hours
    from public.staff_working_hours h
    where h.staff_id = v_staff.id
      and h.weekday = extract(dow from p_date);

    if not found or v_hours.is_off then
      continue;
    end if;

    v_day_start := (p_date::timestamp + v_hours.start_time) at time zone 'Africa/Accra';
    v_day_end := (p_date::timestamp + v_hours.end_time) at time zone 'Africa/Accra';
    v_cursor := v_day_start;

    while v_cursor + make_interval(mins => v_duration) <= v_day_end loop
      v_end := v_cursor + make_interval(mins => v_duration);
      if public.slot_is_valid(v_staff.id, v_cursor, v_end, null) then
        staff_id := v_staff.id;
        staff_name := v_staff.full_name;
        starts_at := v_cursor;
        ends_at := v_end;
        return next;
      end if;
      v_cursor := v_cursor + interval '15 minutes';
    end loop;
  end loop;
end;
$$;

grant execute on function public.get_available_slots(uuid[], uuid, date) to anon, authenticated;

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
begin
  if coalesce(p_consent, false) is not true or coalesce(p_policy_agreed, false) is not true then
    raise exception 'Consent and cancellation policy agreement are required';
  end if;
  if p_client_name is null or length(trim(p_client_name)) < 2 then
    raise exception 'Please enter your name';
  end if;
  if p_client_phone is null or length(regexp_replace(p_client_phone, '\s', '', 'g')) < 9 then
    raise exception 'Please enter a valid phone number';
  end if;
  if p_service_ids is null or array_length(p_service_ids, 1) is null then
    raise exception 'Choose at least one service';
  end if;

  select data into v_settings from public.business_settings where id = 1;
  v_hold := make_interval(hours => coalesce((v_settings->>'deposit_hold_hours')::int, 24));
  v_reminder := coalesce((v_settings->>'reminder_hours')::int, 24);

  -- Lock per potential staff to serialise concurrent booking attempts
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

  -- Confirm the staff member actually offers every selected service
  if (
    select count(*) from public.staff_services
    where staff_id = v_staff_id and service_id = any (p_service_ids)
  ) <> array_length(p_service_ids, 1) then
    raise exception 'This team member does not offer one of the selected services';
  end if;

  insert into public.clients (full_name, phone, email, consent_at)
  values (
    trim(p_client_name),
    regexp_replace(p_client_phone, '\s', '', 'g'),
    nullif(trim(p_client_email), ''),
    now()
  )
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

grant execute on function public.create_public_booking(uuid[], uuid, timestamptz, text, text, text, text, boolean, boolean, public.booking_source) to anon, authenticated;

create or replace function public.get_booking_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := public.hash_manage_token(p_token);
  r record;
begin
  select b.*, c.full_name, c.phone, c.email, st.full_name as staff_name
  into r
  from public.bookings b
  join public.clients c on c.id = b.client_id
  join public.staff st on st.id = b.staff_id
  where b.manage_token_hash = v_hash;

  if not found then
    raise exception 'Booking not found';
  end if;

  return jsonb_build_object(
    'id', r.id,
    'reference', r.reference,
    'status', r.status,
    'starts_at', r.starts_at,
    'ends_at', r.ends_at,
    'staff_name', r.staff_name,
    'client_name', r.full_name,
    'phone', r.phone,
    'email', r.email,
    'notes', r.notes,
    'total_price', r.total_price,
    'deposit_required', r.deposit_required,
    'deposit_amount', r.deposit_amount,
    'deposit_received', r.deposit_received,
    'deposit_hold_until', r.deposit_hold_until,
    'services', (
      select jsonb_agg(jsonb_build_object(
        'name', bs.name_snapshot,
        'duration_minutes', bs.duration_minutes,
        'price_ghs', bs.price_ghs
      ))
      from public.booking_services bs where bs.booking_id = r.id
    )
  );
end;
$$;

grant execute on function public.get_booking_by_token(text) to anon, authenticated;

create or replace function public.cancel_booking_by_token(p_token text, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := public.hash_manage_token(p_token);
  v_settings jsonb;
  v_window int;
  r public.bookings;
begin
  select data into v_settings from public.business_settings where id = 1;
  v_window := coalesce((v_settings->>'cancellation_hours')::int, 24);

  select * into r from public.bookings where manage_token_hash = v_hash;
  if not found then
    raise exception 'Booking not found';
  end if;
  if r.status in ('cancelled', 'completed', 'no_show') then
    raise exception 'This booking can no longer be changed';
  end if;
  if r.starts_at < now() + make_interval(hours => v_window) then
    raise exception 'INSIDE_WINDOW';
  end if;

  update public.bookings
  set status = 'cancelled', cancelled_at = now(), cancel_reason = coalesce(p_reason, 'Client cancelled online')
  where id = r.id;

  insert into public.notification_jobs (booking_id, channel, kind, payload, scheduled_for, status)
  values (r.id, 'email', 'cancelled', '{}'::jsonb, now(), 'queued');

  perform public.log_activity('booking.cancelled', 'booking', r.id::text, jsonb_build_object('via', 'token'));

  return jsonb_build_object('ok', true, 'reference', r.reference);
end;
$$;

grant execute on function public.cancel_booking_by_token(text, text) to anon, authenticated;

create or replace function public.reschedule_booking_by_token(
  p_token text,
  p_starts_at timestamptz,
  p_staff_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := public.hash_manage_token(p_token);
  v_settings jsonb;
  v_window int;
  r public.bookings;
  v_staff uuid;
  v_duration int;
  v_ends timestamptz;
  v_services uuid[];
begin
  select data into v_settings from public.business_settings where id = 1;
  v_window := coalesce((v_settings->>'cancellation_hours')::int, 24);

  select * into r from public.bookings where manage_token_hash = v_hash;
  if not found then
    raise exception 'Booking not found';
  end if;
  if r.status not in ('confirmed', 'pending_deposit') then
    raise exception 'This booking can no longer be changed';
  end if;
  if r.starts_at < now() + make_interval(hours => v_window) then
    raise exception 'INSIDE_WINDOW';
  end if;

  select array_agg(service_id), coalesce(sum(duration_minutes), 0)
    into v_services, v_duration
  from public.booking_services where booking_id = r.id;

  v_staff := coalesce(p_staff_id, r.staff_id);
  perform pg_advisory_xact_lock(hashtextextended(v_staff::text, 0));
  v_ends := p_starts_at + make_interval(mins => v_duration);

  if not public.slot_is_valid(v_staff, p_starts_at, v_ends, r.id) then
    raise exception 'That time is no longer available';
  end if;

  update public.bookings
  set starts_at = p_starts_at, ends_at = v_ends, staff_id = v_staff
  where id = r.id;

  update public.notification_jobs
  set scheduled_for = p_starts_at - make_interval(hours => coalesce((v_settings->>'reminder_hours')::int, 24)),
      status = 'queued',
      error = null
  where booking_id = r.id and kind = 'reminder' and sent_at is null;

  insert into public.notification_jobs (booking_id, channel, kind, payload, scheduled_for, status)
  values (r.id, 'email', 'rescheduled', '{}'::jsonb, now(), 'queued');

  perform public.log_activity('booking.rescheduled', 'booking', r.id::text, jsonb_build_object('starts_at', p_starts_at));

  return jsonb_build_object('ok', true, 'starts_at', p_starts_at, 'ends_at', v_ends, 'staff_id', v_staff);
end;
$$;

grant execute on function public.reschedule_booking_by_token(text, timestamptz, uuid) to anon, authenticated;

create or replace function public.mark_deposit_received(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.bookings;
  v_token_placeholder text := '';
  v_reminder int;
begin
  if not public.is_owner() then
    raise exception 'Not allowed';
  end if;
  select * into r from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'Booking not found';
  end if;

  update public.bookings
  set deposit_received = true, status = 'confirmed'
  where id = p_booking_id and status = 'pending_deposit';

  select coalesce((data->>'reminder_hours')::int, 24) into v_reminder
  from public.business_settings where id = 1;

  insert into public.notification_jobs (booking_id, channel, kind, payload, scheduled_for, status)
  values (p_booking_id, 'email', 'deposit_received', '{}'::jsonb, now(), 'queued');

  insert into public.notification_jobs (booking_id, channel, kind, payload, scheduled_for)
  select p_booking_id, 'email', 'reminder', '{}'::jsonb, r.starts_at - make_interval(hours => v_reminder)
  where not exists (
    select 1 from public.notification_jobs n
    where n.booking_id = p_booking_id and n.kind = 'reminder'
  );

  perform public.log_activity('booking.deposit_received', 'booking', p_booking_id::text, '{}'::jsonb);
end;
$$;

grant execute on function public.mark_deposit_received(uuid) to authenticated;

create or replace function public.release_expired_deposits()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int := 0;
  r record;
begin
  for r in
    select * from public.bookings
    where status = 'pending_deposit'
      and deposit_received = false
      and deposit_hold_until is not null
      and deposit_hold_until < now()
    for update skip locked
  loop
    update public.bookings
    set status = 'cancelled',
        cancelled_at = now(),
        cancel_reason = 'Deposit hold expired'
    where id = r.id;
    insert into public.notification_jobs (booking_id, channel, kind, payload, scheduled_for, status)
    values (r.id, 'email', 'deposit_expired', '{}'::jsonb, now(), 'queued');
    n := n + 1;
  end loop;
  return n;
end;
$$;

create or replace function public.submit_contact(
  p_name text,
  p_email text,
  p_phone text,
  p_message text,
  p_honeypot text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(p_honeypot, '') <> '' then
    return jsonb_build_object('ok', true);
  end if;
  if p_name is null or length(trim(p_name)) < 2 or p_message is null or length(trim(p_message)) < 5 then
    raise exception 'Please complete the form';
  end if;
  insert into public.contact_messages (name, email, phone, message)
  values (trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), trim(p_message));
  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.submit_contact(text, text, text, text, text) to anon, authenticated;

create or replace function public.claim_due_notifications(p_limit int default 25)
returns setof public.notification_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with due as (
    select id from public.notification_jobs
    where status = 'queued'
      and scheduled_for <= now()
    order by scheduled_for
    limit p_limit
    for update skip locked
  )
  select n.* from public.notification_jobs n
  join due on due.id = n.id;
end;
$$;
