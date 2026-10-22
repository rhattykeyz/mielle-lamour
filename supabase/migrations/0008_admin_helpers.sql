-- Admin helpers: status changes, no-show counting, activity.

create or replace function public.admin_set_booking_status(
  p_id uuid,
  p_status public.booking_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.bookings;
begin
  select * into r from public.bookings where id = p_id;
  if not found then
    raise exception 'Booking not found';
  end if;
  if not (public.is_owner() or r.staff_id = public.staff_id_for_user()) then
    raise exception 'Not allowed';
  end if;

  update public.bookings set status = p_status where id = p_id;

  if p_status = 'no_show' and r.status is distinct from 'no_show' then
    update public.clients set no_show_count = no_show_count + 1 where id = r.client_id;
  end if;

  perform public.log_activity('booking.status', 'booking', p_id::text,
    jsonb_build_object('from', r.status, 'to', p_status));
end;
$$;

grant execute on function public.admin_set_booking_status(uuid, public.booking_status) to authenticated;

create or replace function public.admin_reschedule_booking(
  p_id uuid,
  p_starts_at timestamptz,
  p_staff_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.bookings;
  v_duration int;
  v_ends timestamptz;
begin
  select * into r from public.bookings where id = p_id;
  if not found then
    raise exception 'Booking not found';
  end if;
  if not public.is_owner() then
    raise exception 'Not allowed';
  end if;

  select coalesce(sum(duration_minutes), 0) into v_duration
  from public.booking_services where booking_id = p_id;
  v_ends := p_starts_at + make_interval(mins => v_duration);

  perform pg_advisory_xact_lock(hashtextextended(p_staff_id::text, 0));
  if not public.slot_is_valid(p_staff_id, p_starts_at, v_ends, p_id) then
    raise exception 'That time is no longer available';
  end if;

  update public.bookings
  set starts_at = p_starts_at, ends_at = v_ends, staff_id = p_staff_id
  where id = p_id;

  perform public.log_activity('booking.rescheduled', 'booking', p_id::text,
    jsonb_build_object('starts_at', p_starts_at));
end;
$$;

grant execute on function public.admin_reschedule_booking(uuid, timestamptz, uuid) to authenticated;
