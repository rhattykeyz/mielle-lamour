insert into public.service_categories (id, name, slug, description, sort_order, is_visible)
values (
  '11111111-1111-1111-1111-111111111005',
  'Footcare & pedicures',
  'footcare-pedicures',
  'Classic, hot stone and turbo pedicures, plus manicure and pedicure combinations.',
  5,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible;

insert into public.services (
  id, category_id, name, slug, description, duration_minutes, price_ghs,
  price_from, requires_deposit, deposit_kind, deposit_value, sort_order, is_visible
) values
  (
    '22222222-2222-2222-2222-222222222010',
    '11111111-1111-1111-1111-111111111005',
    'Male Pedicure — Basic',
    'male-pedicure-basic',
    null,
    60,
    230,
    false,
    false,
    'amount',
    0,
    1,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222011',
    '11111111-1111-1111-1111-111111111005',
    'VIP Pedi — VIP',
    'vip-pedi-vip',
    null,
    75,
    700,
    false,
    false,
    'amount',
    0,
    2,
    true
  )
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price_ghs = excluded.price_ghs,
  price_from = excluded.price_from,
  requires_deposit = excluded.requires_deposit,
  deposit_kind = excluded.deposit_kind,
  deposit_value = excluded.deposit_value,
  sort_order = excluded.sort_order,
  is_visible = true;

insert into public.services (
  id, category_id, name, slug, description, duration_minutes, price_ghs,
  price_from, requires_deposit, deposit_kind, deposit_value, sort_order, is_visible
)
select
  '22222222-2222-2222-2222-222222222012',
  c.id,
  'Massage — VIP',
  'massage-vip',
  null,
  60,
  1950,
  false,
  false,
  'amount',
  0,
  1,
  true
from public.service_categories c
where c.slug = 'massage'
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price_ghs = excluded.price_ghs,
  price_from = excluded.price_from,
  requires_deposit = excluded.requires_deposit,
  deposit_kind = excluded.deposit_kind,
  deposit_value = excluded.deposit_value,
  sort_order = excluded.sort_order,
  is_visible = true;
