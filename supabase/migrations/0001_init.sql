-- Mielle L'Amour — core schema
-- Timezone for display is Africa/Accra. Timestamps are stored as timestamptz.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";
create extension if not exists "pg_trgm";

create type public.user_role as enum ('owner', 'staff');
create type public.booking_status as enum (
  'pending_deposit',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);
create type public.booking_source as enum ('online', 'admin');
create type public.deposit_type as enum ('amount', 'percent');
create type public.notification_channel as enum ('email', 'sms', 'whatsapp');
create type public.notification_kind as enum (
  'confirmation',
  'reminder',
  'deposit_received',
  'deposit_expired',
  'cancelled',
  'rescheduled'
);
create type public.notification_status as enum ('queued', 'sent', 'failed', 'skipped');

-- ---------------------------------------------------------------------------
-- Staff and auth profiles
-- ---------------------------------------------------------------------------
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text not null unique,
  title text,
  bio text,
  photo_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  staff_id uuid unique references public.staff (id) on delete set null,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.staff_working_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  is_off boolean not null default false,
  unique (staff_id, weekday)
);

create table public.staff_time_off (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  reason text,
  check (ends_on >= starts_on)
);

-- ---------------------------------------------------------------------------
-- Services (fully admin-managed — never hard-code lists in the app)
-- ---------------------------------------------------------------------------
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  price_ghs numeric(10, 2) not null check (price_ghs >= 0),
  price_from boolean not null default false,
  requires_deposit boolean not null default false,
  deposit_kind public.deposit_type not null default 'amount',
  deposit_value numeric(10, 2) not null default 0,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_services (
  staff_id uuid not null references public.staff (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (staff_id, service_id)
);

-- ---------------------------------------------------------------------------
-- Closures / holidays
-- ---------------------------------------------------------------------------
create table public.closures (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null,
  ends_on date not null,
  reason text,
  check (ends_on >= starts_on)
);

-- ---------------------------------------------------------------------------
-- Clients and bookings
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  notes text,
  no_show_count int not null default 0,
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index clients_phone_key on public.clients (phone);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  client_id uuid not null references public.clients (id) on delete restrict,
  staff_id uuid not null references public.staff (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.booking_status not null default 'confirmed',
  source public.booking_source not null default 'online',
  notes text,
  total_price numeric(10, 2) not null default 0,
  deposit_required boolean not null default false,
  deposit_amount numeric(10, 2) not null default 0,
  deposit_received boolean not null default false,
  deposit_hold_until timestamptz,
  manage_token_hash text,
  created_by uuid references auth.users (id) on delete set null,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- Active bookings cannot overlap for the same staff member.
-- pending_deposit holds the slot until it is confirmed or released.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    staff_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('pending_deposit', 'confirmed', 'completed'));

create index bookings_staff_time_idx on public.bookings (staff_id, starts_at);
create index bookings_status_idx on public.bookings (status);
create index bookings_starts_idx on public.bookings (starts_at);

create table public.booking_services (
  booking_id uuid not null references public.bookings (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  name_snapshot text not null,
  duration_minutes int not null,
  price_ghs numeric(10, 2) not null,
  primary key (booking_id, service_id)
);

-- ---------------------------------------------------------------------------
-- Content, gallery, reviews
-- ---------------------------------------------------------------------------
create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  is_visible boolean not null default true
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.gallery_categories (id) on delete set null,
  storage_path text not null,
  alt text not null default '',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  quote text not null,
  is_visible boolean not null default true,
  is_sample boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.page_content (
  key text primary key,
  title text,
  body jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.business_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete cascade,
  channel public.notification_channel not null default 'email',
  kind public.notification_kind not null,
  payload jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz not null,
  status public.notification_status not null default 'queued',
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index notification_jobs_due_idx
  on public.notification_jobs (scheduled_for)
  where status = 'queued';

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hit_count int not null default 1,
  primary key (key, window_start)
);

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('gallery', 'gallery', true),
  ('staff', 'staff', true),
  ('branding', 'branding', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger staff_updated_at before update on public.staff
  for each row execute function public.set_updated_at();
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.staff_id_for_user()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select staff_id from public.profiles where id = auth.uid();
$$;

create or replace function public.hash_manage_token(p_token text)
returns text
language sql
immutable
as $$
  select encode(digest(p_token, 'sha256'), 'hex');
$$;
