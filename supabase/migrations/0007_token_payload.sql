-- Include service ids on the manage-token payload so reschedule can load real slots.
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
    'staff_id', r.staff_id,
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
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', bs.service_id,
        'name', bs.name_snapshot,
        'duration_minutes', bs.duration_minutes,
        'price_ghs', bs.price_ghs
      )), '[]'::jsonb)
      from public.booking_services bs where bs.booking_id = r.id
    )
  );
end;
$$;
