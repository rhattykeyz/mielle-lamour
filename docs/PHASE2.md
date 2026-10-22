# Phase 2 hooks (not built)

## Payments

Bookings already have `status`, `deposit_required`, `deposit_amount`, and `deposit_received`. To add Paystack / Flutterwave / Hubtel later:

- Create a `payments` table and an Edge Function that starts a checkout and a webhook that calls a new RPC `confirm_payment(booking_id)`.
- Do not change the public booking wizard except for a “Pay deposit” step on `pending_deposit`.

## SMS / WhatsApp reminders

See `supabase/functions/_shared/notifications.ts`. Implement `SmsProvider.send` and `WhatsAppProvider.send`, set API secrets, and enqueue jobs with `channel = 'sms'` or `'whatsapp'`. Email stays the default.

## Gift cards, memberships, retail

New tables and admin pages. Do not overload `services` for physical products — add a `products` catalogue later.
