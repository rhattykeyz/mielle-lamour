-- Run in the Supabase SQL editor AFTER deploying Edge Functions.
-- pg_cron and pg_net are on the Pro plan. On the free tier, use an external
-- cron (cron-job.org or GitHub Actions) instead — see docs/DEPLOYMENT.md.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace PROJECT_REF and CRON_SECRET before running.
select cron.schedule(
  'mielle-send-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://PROJECT_REF.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'mielle-release-deposits',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://PROJECT_REF.supabase.co/functions/v1/release-deposits',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Confirm jobs exist:
-- select * from cron.job;
-- Confirm recent runs:
-- select * from cron.job_run_details order by start_time desc limit 20;
