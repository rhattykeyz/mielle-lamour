# Before launch — what you must provide or decide

The site can be demonstrated with placeholders. Do **not** send clients to it until the items below are real.

## Must decide / supply

1. **Business name** — confirmed as Mielle L'Amour. Change only if the registered name differs.
2. **Logo files** — circular badge, gold on baby pink, transparent PNG and/or SVG, plus a square version for social/favicon if you want it sharper than the ML monogram.
3. **Phone and WhatsApp** — personal number vs new business number. Until this is set, those buttons stay hidden on purpose.
4. **Email** — a mailbox you check (ideally on the real domain, e.g. `bookings@…`) and a Resend-verified sending domain.
5. **Address** — street, area, Accra, plus a Google Maps embed.
6. **Opening hours** — including Sunday if closed.
7. **Real photos** — shop exterior/interior when the fit-out is done; nail/beauty/spa work (phone photos are fine).
8. **Social** — Instagram and TikTok handles once the pages exist. Leave blank until then.
9. **Prices and durations** — replace every `[SAMPLE]` service in Admin → Services.
10. **Staff names, photos, bios, hours** — replace sample team members.
11. **Home and about copy** — replace `[PLACEHOLDER]` story text.
12. **Mobile Money** — network, account name, number, and how you want the booking reference written.
13. **Cancellation and deposit rules** — default is 24 hours’ notice and 24-hour deposit hold. Edit the policy wording in Settings.
14. **Reviews** — replace sample quotes or hide them.

## Legal (Ghana) — have a professional confirm

Ghana’s **Data Protection Act, 2012** applies to customer names, phones and emails.

Please ask a lawyer or the Data Protection Commission whether you need to:

- Register as a data controller.
- Keep a written privacy notice (the site has a starting draft — it is not legal advice).
- Set a retention period (how long you keep old bookings).
- Document how a client can ask for their data to be deleted.
- Confirm consent wording on the booking form.

This project stores **only** name, phone, optional email, notes, and booking history. No card data. No children’s data by design — do not add date of birth unless you have a reason and legal advice.

## Technical before going live

- Supabase **Pro** if this is a real appointment book (backups + no pause).
- Resend domain verified; test a real confirmation and reminder.
- Cron jobs running (see DEPLOYMENT.md) and a log check after 24 hours.
- Hostinger HTTPS + `.htaccess` rewrite.
- Owner login tested; password stored only by the owner.
- Manual database dump saved once.
