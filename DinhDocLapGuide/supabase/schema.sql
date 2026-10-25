-- Chạy trong Supabase: SQL Editor -> New query -> Run. Chạy lại nhiều lần vẫn an toàn.
-- Khớp với dashboard (Admin.jsx): bảng places, analytics_events, bucket ảnh place-images.

-- ===== Tài khoản và vai trò (admin, editor được vào dashboard) =====
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('admin','editor','viewer'))
);
create or replace function public.app_role() returns text
language sql security definer stable set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as
$$ begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
-- Tài khoản đã tạo từ trước chưa có hồ sơ thì bổ sung
insert into public.profiles (id, full_name)
select id, email from auth.users on conflict (id) do nothing;

-- ===== Địa điểm tham quan =====
create table if not exists public.places (
  id text primary key,
  icon text not null default '📍',
  category text not null default 'palace',
  sort_order int not null default 1,
  floor jsonb not null default '{}'::jsonb,
  title jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  text jsonb not null default '{}'::jsonb,
  image_url text,
  latitude double precision,
  longitude double precision,
  updated_at timestamptz not null default now()
);
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists places_touch on public.places;
create trigger places_touch before update on public.places
  for each row execute function public.touch_updated_at();

-- ===== Thống kê (web và mobile ghi ẩn danh, chỉ nhân viên được xem) =====
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('audio_play','audio_complete','qr_scan')),
  place_id text,
  language text check (language in ('vi','en','zh','ja','ko')),
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);

-- ===== Bảo mật theo dòng (RLS) =====
alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.app_role() = 'admin');
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles for update to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

drop policy if exists places_read on public.places;
create policy places_read on public.places for select using (true);
drop policy if exists places_write on public.places;
create policy places_write on public.places for all to authenticated
  using (public.app_role() in ('admin','editor'))
  with check (public.app_role() in ('admin','editor'));

drop policy if exists events_insert on public.analytics_events;
create policy events_insert on public.analytics_events for insert to anon, authenticated
  with check (true);
drop policy if exists events_staff_read on public.analytics_events;
create policy events_staff_read on public.analytics_events for select to authenticated
  using (public.app_role() in ('admin','editor'));

-- ===== Dashboard cập nhật tức thì (Realtime) =====
do $$ begin
  alter publication supabase_realtime add table public.places;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.analytics_events;
exception when duplicate_object then null;
end $$;

-- ===== Kho ảnh địa điểm (công khai để đọc, chỉ admin/editor được tải lên) =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('place-images', 'place-images', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists place_images_read on storage.objects;
create policy place_images_read on storage.objects for select
  using (bucket_id = 'place-images');
drop policy if exists place_images_insert on storage.objects;
create policy place_images_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'place-images' and public.app_role() in ('admin','editor'));
drop policy if exists place_images_update on storage.objects;
create policy place_images_update on storage.objects for update to authenticated
  using (bucket_id = 'place-images' and public.app_role() in ('admin','editor'));
drop policy if exists place_images_delete on storage.objects;
create policy place_images_delete on storage.objects for delete to authenticated
  using (bucket_id = 'place-images' and public.app_role() in ('admin','editor'));

-- Gán quyền cho tài khoản của bạn (thay email), chạy riêng sau khi đã tạo tài khoản:
-- update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'admin@example.com');
