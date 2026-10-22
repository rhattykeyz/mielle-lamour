-- Row Level Security. Anonymous users never read booking rows.
-- Public data is limited to catalogues, content and a settings RPC.

alter table public.staff enable row level security;
alter table public.profiles enable row level security;
alter table public.staff_working_hours enable row level security;
alter table public.staff_time_off enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.staff_services enable row level security;
alter table public.closures enable row level security;
alter table public.clients enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_services enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_images enable row level security;
alter table public.reviews enable row level security;
alter table public.page_content enable row level security;
alter table public.business_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.activity_log enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.rate_limits enable row level security;

-- Public catalogue
create policy "public read visible staff"
  on public.staff for select
  using (is_active = true);

create policy "owner manage staff"
  on public.staff for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read visible categories"
  on public.service_categories for select
  using (is_visible = true or public.is_owner());

create policy "owner manage categories"
  on public.service_categories for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read visible services"
  on public.services for select
  using (is_visible = true or public.is_owner());

create policy "owner manage services"
  on public.services for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read staff services"
  on public.staff_services for select
  using (true);

create policy "owner manage staff services"
  on public.staff_services for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read hours"
  on public.staff_working_hours for select
  using (true);

create policy "owner manage hours"
  on public.staff_working_hours for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "authenticated read time off"
  on public.staff_time_off for select
  to authenticated
  using (public.is_owner() or staff_id = public.staff_id_for_user());

create policy "owner manage time off"
  on public.staff_time_off for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read closures"
  on public.closures for select
  using (true);

create policy "owner manage closures"
  on public.closures for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read gallery categories"
  on public.gallery_categories for select
  using (is_visible = true or public.is_owner());

create policy "owner manage gallery categories"
  on public.gallery_categories for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read gallery"
  on public.gallery_images for select
  using (is_visible = true or public.is_owner());

create policy "owner manage gallery"
  on public.gallery_images for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read reviews"
  on public.reviews for select
  using (is_visible = true or public.is_owner());

create policy "owner manage reviews"
  on public.reviews for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "public read pages"
  on public.page_content for select
  using (true);

create policy "owner manage pages"
  on public.page_content for all
  using (public.is_owner())
  with check (public.is_owner());

-- Settings: owners only. Public fields are exposed via get_public_settings().
create policy "owner read settings"
  on public.business_settings for select
  to authenticated
  using (public.is_owner());

create policy "owner update settings"
  on public.business_settings for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- Profiles
create policy "users read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_owner());

create policy "owner manage profiles"
  on public.profiles for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- Clients / bookings: staff see only their own bookings' clients
create policy "staff read related clients"
  on public.clients for select
  to authenticated
  using (
    public.is_owner()
    or exists (
      select 1 from public.bookings b
      where b.client_id = clients.id
        and b.staff_id = public.staff_id_for_user()
    )
  );

create policy "staff insert clients"
  on public.clients for insert
  to authenticated
  with check (public.is_owner() or public.staff_id_for_user() is not null);

create policy "owner update clients"
  on public.clients for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy "staff read own bookings"
  on public.bookings for select
  to authenticated
  using (public.is_owner() or staff_id = public.staff_id_for_user());

create policy "staff insert bookings"
  on public.bookings for insert
  to authenticated
  with check (
    public.is_owner()
    or staff_id = public.staff_id_for_user()
  );

create policy "staff update own bookings"
  on public.bookings for update
  to authenticated
  using (public.is_owner() or staff_id = public.staff_id_for_user())
  with check (public.is_owner() or staff_id = public.staff_id_for_user());

create policy "staff read booking services"
  on public.booking_services for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_services.booking_id
        and (public.is_owner() or b.staff_id = public.staff_id_for_user())
    )
  );

create policy "staff write booking services"
  on public.booking_services for all
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_services.booking_id
        and (public.is_owner() or b.staff_id = public.staff_id_for_user())
    )
  )
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_services.booking_id
        and (public.is_owner() or b.staff_id = public.staff_id_for_user())
    )
  );

create policy "owner read contact"
  on public.contact_messages for select
  to authenticated
  using (public.is_owner());

create policy "owner read activity"
  on public.activity_log for select
  to authenticated
  using (public.is_owner());

create policy "staff read notifications for own bookings"
  on public.notification_jobs for select
  to authenticated
  using (
    public.is_owner()
    or exists (
      select 1 from public.bookings b
      where b.id = notification_jobs.booking_id
        and b.staff_id = public.staff_id_for_user()
    )
  );

-- Storage
create policy "public read media"
  on storage.objects for select
  using (bucket_id in ('gallery', 'staff', 'branding'));

create policy "owner upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('gallery', 'staff', 'branding') and public.is_owner());

create policy "owner update media"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('gallery', 'staff', 'branding') and public.is_owner());

create policy "owner delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('gallery', 'staff', 'branding') and public.is_owner());
