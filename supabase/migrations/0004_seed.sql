-- Sample catalogue, two staff members, working hours, placeholder content.
-- Replace all [PLACEHOLDER] values from Admin → Settings. Do not ship these
-- strings as if they were real contact details.

insert into public.business_settings (id, data)
values (1, jsonb_build_object(
  'business_name', 'Mielle L''Amour',
  'tagline', 'Nail · Beauty · Spa',
  'address', '[ADDRESS, AREA, ACCRA]',
  'area', '[AREA]',
  'city', 'Accra',
  'map_embed_url', '',
  'phone', '',
  'whatsapp', '',
  'email', '[EMAIL]',
  'instagram', '',
  'tiktok', '',
  'logo_url', '',
  'currency', 'GHS',
  'timezone', 'Africa/Accra',
  'opening_hours_note', '[HOURS] — edit this in Admin → Settings',
  'opening_hours', jsonb_build_object(
    '0', jsonb_build_object('label', 'Sunday', 'open', false, 'start', '10:00', 'end', '16:00'),
    '1', jsonb_build_object('label', 'Monday', 'open', true, 'start', '09:00', 'end', '18:00'),
    '2', jsonb_build_object('label', 'Tuesday', 'open', true, 'start', '09:00', 'end', '18:00'),
    '3', jsonb_build_object('label', 'Wednesday', 'open', true, 'start', '09:00', 'end', '18:00'),
    '4', jsonb_build_object('label', 'Thursday', 'open', true, 'start', '09:00', 'end', '18:00'),
    '5', jsonb_build_object('label', 'Friday', 'open', true, 'start', '09:00', 'end', '18:00'),
    '6', jsonb_build_object('label', 'Saturday', 'open', true, 'start', '09:00', 'end', '17:00')
  ),
  'buffer_minutes', 15,
  'min_notice_minutes', 120,
  'max_advance_days', 60,
  'cancellation_hours', 24,
  'reminder_hours', 24,
  'deposit_hold_hours', 24,
  'cancellation_policy', 'Please cancel or reschedule at least 24 hours before your appointment. [POLICY WORDING — edit in Admin]',
  'privacy_notice', 'Mielle L''Amour collects your name, phone number and optional email so we can confirm and remind you of your appointment. We do not sell your information. [LEGAL REVIEW RECOMMENDED — Ghana Data Protection Act, 2012]',
  'mobile_money', jsonb_build_object(
    'network', '[MoMo NETWORK]',
    'name', '[ACCOUNT NAME]',
    'number', '[MoMo NUMBER]',
    'instructions', 'Use your booking reference as the payment reference, then send us a screenshot on WhatsApp once the number is set.'
  )
))
on conflict (id) do nothing;

insert into public.service_categories (id, name, slug, description, sort_order) values
  ('11111111-1111-1111-1111-111111111001', 'Nails', 'nails', 'Manicure, pedicure, gel, acrylics and nail art.', 1),
  ('11111111-1111-1111-1111-111111111002', 'Facials', 'facials', 'Gentle, glowing facial treatments.', 2),
  ('11111111-1111-1111-1111-111111111003', 'Massage', 'massage', 'Relaxing massage rituals.', 3),
  ('11111111-1111-1111-1111-111111111004', 'Bridal & groups', 'bridal-groups', 'Wedding-day beauty and group packages. Deposit required.', 4);

insert into public.services (
  id, category_id, name, slug, description, duration_minutes, price_ghs, price_from,
  requires_deposit, deposit_kind, deposit_value, sort_order
) values
  ('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111001', 'Classic manicure', 'classic-manicure', '[SAMPLE] Shape, cuticle care and polish.', 45, 150, false, false, 'amount', 0, 1),
  ('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111001', 'Gel manicure', 'gel-manicure', '[SAMPLE] Long-wear gel colour.', 60, 250, false, false, 'amount', 0, 2),
  ('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111001', 'Acrylic full set', 'acrylic-full-set', '[SAMPLE] Full acrylic set with colour.', 90, 400, true, false, 'amount', 0, 3),
  ('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111001', 'Nail art add-on', 'nail-art-add-on', '[SAMPLE] Hand-painted details. Price from.', 30, 80, true, false, 'amount', 0, 4),
  ('22222222-2222-2222-2222-222222222005', '11111111-1111-1111-1111-111111111001', 'Classic pedicure', 'classic-pedicure', '[SAMPLE] Soak, care and polish.', 60, 180, false, false, 'amount', 0, 5),
  ('22222222-2222-2222-2222-222222222006', '11111111-1111-1111-1111-111111111002', 'Signature facial', 'signature-facial', '[SAMPLE] Cleanse, treat and glow.', 60, 350, false, false, 'amount', 0, 1),
  ('22222222-2222-2222-2222-222222222007', '11111111-1111-1111-1111-111111111003', 'Relaxing massage', 'relaxing-massage', '[SAMPLE] 60-minute full-body massage.', 60, 400, false, false, 'amount', 0, 1),
  ('22222222-2222-2222-2222-222222222008', '11111111-1111-1111-1111-111111111004', 'Bridal beauty package', 'bridal-beauty-package', '[SAMPLE] Nails, facial and makeup trial. Deposit required.', 180, 1500, false, true, 'percent', 30, 1),
  ('22222222-2222-2222-2222-222222222009', '11111111-1111-1111-1111-111111111004', 'Group glam (up to 4)', 'group-glam', '[SAMPLE] Shared booking for friends. Deposit required.', 150, 900, true, true, 'amount', 200, 2);

insert into public.staff (id, full_name, slug, title, bio, sort_order) values
  ('33333333-3333-3333-3333-333333333001', 'Ama Boateng', 'ama-boateng', 'Founder & nail artist', '[SAMPLE] Founder of Mielle L''Amour. Nails, bridal and facials.', 1),
  ('33333333-3333-3333-3333-333333333002', 'Efua Mensah', 'efua-mensah', 'Spa therapist', '[SAMPLE] Massage and facial specialist.', 2);

-- Both staff can offer most services; spa therapist focuses on spa + groups
insert into public.staff_services (staff_id, service_id)
select '33333333-3333-3333-3333-333333333001', id from public.services
where slug not in ('relaxing-massage');

insert into public.staff_services (staff_id, service_id)
select '33333333-3333-3333-3333-333333333002', id from public.services
where slug in ('signature-facial', 'relaxing-massage', 'bridal-beauty-package', 'group-glam', 'classic-pedicure');

insert into public.staff_working_hours (staff_id, weekday, start_time, end_time, is_off)
select s.id, d.weekday, '09:00'::time, case when d.weekday = 6 then '17:00'::time else '18:00'::time end, d.weekday = 0
from public.staff s
cross join (select generate_series(0, 6) as weekday) d;

insert into public.gallery_categories (name, slug, sort_order) values
  ('Nails', 'nails', 1),
  ('Beauty', 'beauty', 2),
  ('Spa', 'spa', 3);

insert into public.reviews (author_name, rating, quote, is_sample, sort_order) values
  ('[SAMPLE] Akosua', 5, 'Soft, pretty and so calming. I cannot wait for the salon doors to open.', true, 1),
  ('[SAMPLE] Nana Yaa', 5, 'The gel set lasted beautifully and the whole feeling is luxe.', true, 2),
  ('[SAMPLE] Esi', 5, 'Bridal trial was unhurried and the details were perfect.', true, 3);

insert into public.page_content (key, title, body) values
  ('home', 'Home', jsonb_build_object(
    'hero_kicker', 'Accra · Nail, beauty & spa',
    'hero_title', 'Soft luxury, made for you.',
    'hero_subtitle', '[PLACEHOLDER INTRO] Mielle L''Amour is a newly registered floral salon in Accra. The space is still being fitted out — this copy is sample text you can edit in Admin → Content.',
    'hero_cta', 'Book now',
    'intro_title', 'A pretty pause in your day',
    'intro_body', '[PLACEHOLDER] Come for nails, stay for the calm. Facets of gel, acrylics, facials, massage and bridal packages, all under one roof when we open.'
  )),
  ('about', 'About', jsonb_build_object(
    'story_title', 'Our story',
    'story_body', '[PLACEHOLDER STORY] Mielle L''Amour was born from a love of beautiful nails, gentle spa rituals and the kind of care that feels personal. We are newly registered and currently fitting out our Accra home. This paragraph is sample copy — replace it in the admin panel.',
    'team_title', 'The team'
  ));
