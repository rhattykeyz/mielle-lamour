# Setup and deployment — Mielle L'Amour

## 1. Create the Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a project. Region: pick the closest (e.g. `eu-west-1`).
2. Set a strong database password and store it in a password manager.
3. Wait until the project is healthy.
4. **Settings → API**: copy `Project URL` and `anon public` key into the React `.env.local` / Hostinger build env.
5. Copy the `service_role` key into a password manager. **Never put it in the frontend or Hostinger.**

## 2. Run migrations

Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then from this repo:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or paste the files in `supabase/migrations/` into the SQL editor **in filename order** (`0001` … `0008`).

This creates tables, RLS, booking functions, storage buckets (`gallery`, `staff`, `branding`) and sample services/staff.

## 3. Auth settings

**Authentication → Providers → Email**: enable email + password.

**Authentication → URL configuration**:

- Site URL: `https://your-domain.com`
- Redirect URLs: `https://your-domain.com/**` and `http://localhost:5173/**`

Turn on leaked-password protection if offered.

## 4. First owner account

1. Authentication → Users → Add user. Email + password (the owner’s login).
2. Copy the user UUID.
3. SQL editor:

```sql
insert into public.profiles (id, role, full_name)
values ('PASTE-USER-UUID', 'owner', 'Owner name');
```

To add a staff login later: create another Auth user, insert `profiles` with `role = 'staff'` and `staff_id` set to the matching `staff` row.

### If the owner forgets the password

Use Authentication → Users → the user → Send password recovery. They need a working email. Keep a second owner profile or the database password so you can reset from the dashboard if email fails.

## 5. Edge Function secrets

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
npx supabase secrets set FROM_EMAIL="Mielle L'Amour <bookings@your-domain.com>"
npx supabase secrets set SITE_URL=https://your-domain.com
npx supabase secrets set CRON_SECRET=long-random-string
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to functions.

Resend: create an account, verify the sending domain (or use `beth.t@example.com` only for tests), create an API key.

## 6. Deploy Edge Functions

```bash
npx supabase functions deploy availability
npx supabase functions deploy create-booking
npx supabase functions deploy manage-booking
npx supabase functions deploy contact
npx supabase functions deploy send-reminders
npx supabase functions deploy release-deposits
```

`supabase/config.toml` sets `verify_jwt = false` for these public/cron functions. They still validate origin, tokens, or `CRON_SECRET`.

## 7. Scheduled jobs (reminders + deposit release)

### Production (Supabase Pro) — pg_cron

1. Upgrade if needed (pg_cron / pg_net are not something to rely on for a live salon on the free tier).
2. Edit `supabase/cron.sql`: replace `PROJECT_REF` and `CRON_SECRET`.
3. Run it in the SQL editor.
4. Confirm:

```sql
select * from cron.job;
select * from cron.job_run_details order by start_time desc limit 20;
```

You should see `mielle-send-reminders` and `mielle-release-deposits` every 15 minutes.

Manual test:

```bash
curl -X POST https://YOUR_REF.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer CRON_SECRET" -H "Content-Type: application/json" -d "{}"

curl -X POST https://YOUR_REF.supabase.co/functions/v1/release-deposits \
  -H "Authorization: Bearer CRON_SECRET" -H "Content-Type: application/json" -d "{}"
```

### Free tier — external cron

Use [cron-job.org](https://cron-job.org) or GitHub Actions every 15 minutes to POST to those two URLs with the same `Authorization: Bearer CRON_SECRET` header.

**Flag:** free-tier projects **pause after inactivity**. Reminders will stop until someone opens the project. Move to Pro before launch.

## 8. Build the React app

```bash
npm install
```

Create `.env.production` or set CI env:

```
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://your-domain.com
```

```bash
npm run build
```

This outputs `dist/` plus prerendered HTML shells (`/services/index.html`, etc.) and `sitemap.xml`.

## 9. Upload to Hostinger

1. File Manager or FTP: upload **contents of `dist/`** into `public_html` (including `.htaccess`).
2. Confirm `.htaccess` is present. It rewrites unknown paths to `index.html` so `/book` and `/admin` work on refresh.
3. If Apache rewrite is off, enable it in Hostinger → Advanced → Apache.
4. Force HTTPS in Hostinger.

Nginx-only hosts would need `try_files $uri $uri/ /index.html;` instead of `.htaccess`.

## 10. Backups

| Plan | Automatic daily backups |
|---|---|
| Free | **No.** Download a manual dump from Database → Backups (if shown) or run `npx supabase db dump -f backup.sql` regularly. |
| Pro | **Yes** — point-in-time recovery / daily backups. Use this for a live salon. |

Manual routine until Pro: once a week (and after any big settings change) run `npx supabase db dump` and store the file off-site.

## 11. Storage

Buckets `gallery`, `staff`, `branding` are public-read, owner-write (RLS). If they were not created by the migration, create them in Storage with the same names and public access.
