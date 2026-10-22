# Mielle L'Amour

Website, online booking and admin panel for **Mielle L'Amour**, a nail, beauty and spa salon in Accra, Ghana.

Public site is a React (Vite) static app for Hostinger. Backend is Supabase (Postgres, Auth, Storage, Edge Functions). Payment is in person. Deposits are collected by Mobile Money outside the app.

## Plan and assumptions

- Business name is **Mielle L'Amour** everywhere.
- Address, hours, phone, WhatsApp, email, Instagram, TikTok and Mobile Money are **placeholders** until edited in Admin → Settings. Empty phone/WhatsApp hides those buttons.
- Service categories, services, gallery categories, staff, reviews and home/about copy all live in the database. Nothing in the menu is hard-coded.
- Timezone `Africa/Accra`, currency GHS, language English.
- The supplied circular gold-on-pink badge is in `public/logo.jpg` and is the header, footer, and favicon. A newer file can still be uploaded in Admin → Settings.
- Sample services, two staff members (Ama Boateng, Efua Mensah), reviews and copy are marked `[SAMPLE]` / `[PLACEHOLDER]`.
- Email is implemented via Resend. SMS and WhatsApp notifications are stub providers for Phase 2.
- Online card/MoMo checkout is out of scope; booking status is structured so a payment gateway can be added later.
- **Supabase free tier** is fine for development. Production should move to **Pro** before relying on daily backups, cron, and “always on” hosting.

## Monthly cost (to quote the client)

| Service | Plan | Typical cost | Notes |
|---|---|---|---|
| Hostinger | Existing shared hosting | Already paid | Serves the static React files |
| Domain | Existing | Already paid | Point to Hostinger |
| Supabase | Free | **$0** | Pauses after ~7 days inactivity. **No automatic daily backups.** 500 MB database. |
| Supabase | Pro (recommended for live salon) | **$25 / month** | Daily backups, no pause, pg_cron, more headroom |
| Resend | Free | **$0** | 100 emails/day, 3,000/month — enough for confirmations + reminders at first |
| Resend | Pro | **$20 / month** | If booking volume outgrows the free quota |
| Google Fonts | — | $0 | Cormorant Garamond, Outfit, Great Vibes |
| SMS / WhatsApp API | Phase 2 | TBD | Not built |

**Suggested live quote:** Hostinger (existing) + Supabase Pro $25 + Resend $0–20. Budget **$25–45 / month** besides hosting.

## Local development

1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env.local` and add your Supabase URL and **anon** key (never the service role key).
3. `npm install`
4. `npm run dev`
5. Open http://localhost:5173

Admin: http://localhost:5173/admin/login

## Project layout

```
src/                 React app (public site + /admin)
supabase/migrations  Schema, RLS, RPCs, seed
supabase/functions   Edge Functions (booking, email, cron)
docs/                Deployment, testing, owner guide
public/.htaccess     Hostinger SPA rewrite
```

## Docs

- [Setup and deployment](docs/DEPLOYMENT.md)
- [Testing checklist](docs/TESTING.md)
- [Admin user guide](docs/ADMIN_GUIDE.md)
- [Launch checklist and legal flags](docs/LAUNCH.md)

## Palette (CSS variables in `src/index.css`)

- Baby pink `#F8D7E0` / hover `#F1B8C8`
- Gold `#C9A24B` / hover `#A8832F`
- Cream `#FFF8EE`
- Ink `#3A2B2E`
