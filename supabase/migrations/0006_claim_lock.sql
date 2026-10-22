alter type public.notification_status add value if not exists 'processing';

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
  ),
  claimed as (
    update public.notification_jobs n
    set status = 'processing'
    from due
    where n.id = due.id
    returning n.*
  )
  select * from claimed;
end;
$$;

grant execute on function public.consume_rate_limit(text, int, int) to service_role;
grant execute on function public.claim_due_notifications(int) to service_role;
grant execute on function public.release_expired_deposits() to service_role;
