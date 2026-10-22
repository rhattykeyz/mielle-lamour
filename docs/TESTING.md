# Testing checklist — Mielle L'Amour

Test on a phone and a desktop. Use two browsers (or incognito) for the double-book test.

## Public site

- [ ] Home shows Mielle L'Amour, floral layout, Book now, featured services, gallery preview, reviews, hours.
- [ ] WhatsApp float and phone links are **hidden** while numbers are empty; they appear after saving real numbers in Settings.
- [ ] Services page groups by category; adding a category in admin appears without a code change.
- [ ] Gallery lightbox, lazy loading, portrait crop. Placeholders show when empty.
- [ ] About shows story + both sample staff.
- [ ] Contact form sends; honeypot field `website` is not visible.
- [ ] Privacy and cancellation pages show Settings text.
- [ ] Refreshing `/services` on Hostinger does not 404.
- [ ] Pages have unique titles; `/sitemap.xml` exists after build.

## Booking (no account)

- [ ] Choose one or more services → staff or “Any available” → date → only free slots.
- [ ] Slot length matches the sum of service durations and sits inside working hours.
- [ ] Buffer (default 15 min) blocks the time after an appointment.
- [ ] Cannot book closer than min notice (default 2 hours) or further than max advance (default 60 days).
- [ ] Closures and staff days off have no slots.
- [ ] Policy and privacy checkboxes are required.
- [ ] Confirmation page shows reference; email arrives if an address was given (after Resend is set).
- [ ] Payment copy says pay in person.

## Double booking

- [ ] Open the same free slot in two tabs. Confirm both at once.
- [ ] One succeeds; the other shows “That time is no longer available”.
- [ ] Database exclusion constraint: a second overlapping insert for the same staff with status `confirmed` / `pending_deposit` / `completed` fails.

## Cancel / reschedule (token link)

- [ ] `/manage/{token}` loads the booking. Guessing a short token fails.
- [ ] Database stores `manage_token_hash` only, not the raw token.
- [ ] Cancel outside the 24-hour window frees the slot.
- [ ] Reschedule lists only valid free times; old slot becomes free.
- [ ] Inside the window, the page asks the guest to contact the salon.

## Deposits

- [ ] Bridal/group sample services create status **pending deposit** and a hold deadline.
- [ ] Confirmation + email show Mobile Money placeholders and the booking reference.
- [ ] Owner: Calendar → Mark deposit received → status **confirmed**, client emailed.
- [ ] If the hold expires, `release-deposits` sets cancelled, slot is free, client is notified (if email exists).

## Reminders

- [ ] A confirmed booking with email queues a `reminder` job ~24 hours before (configurable).
- [ ] Calling `send-reminders` with `CRON_SECRET` sends due jobs and marks them `sent`.
- [ ] Jobs without email are `skipped`.
- [ ] Failed Resend calls are `failed` with an error, not silently lost.
- [ ] After cron is on, inspect `cron.job_run_details` or the external cron log.

## Admin roles

- [ ] Owner sees dashboard, calendar, services, staff, clients, gallery, content, settings, export, activity.
- [ ] Staff login sees only dashboard, calendar, new booking — and **only their own** bookings.
- [ ] Staff cannot read `business_settings` or other staff’s bookings (RLS).
- [ ] Anonymous `select` on `bookings` returns no rows.
- [ ] Anon key in the browser; service role only in Edge Functions.

## Export

- [ ] .xlsx opens in Excel; phone column keeps a leading 0 (text).
- [ ] Accents in names display (file is UTF-8). CSV path includes BOM.
- [ ] Summary sheets: per day, per service, per staff.

## Accessibility / mobile

- [ ] Keyboard through the booking form; labels exist; focus ring visible.
- [ ] Contrast: dark text on cream/pink; gold used on buttons, not long paragraphs.
- [ ] `prefers-reduced-motion` disables smooth animations.
- [ ] Lighthouse (mobile): no huge uncompressed photos after gallery upload (client compresses to JPEG).
