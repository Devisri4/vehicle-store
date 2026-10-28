-- Vehicle Store: initial schema for Supabase
-- Replaces the MySQL tables (users, vehicles, messages) and the Multer uploads folder.
-- Run once in Supabase Dashboard -> SQL Editor. The whole script is one transaction:
-- if anything fails, nothing is applied.

begin;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('buyer', 'seller', 'admin');

-- One row per Supabase Auth user. Passwords live only in auth.users (hashed by Supabase).
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null,
  role       public.user_role not null default 'buyer',
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id          bigint generated always as identity primary key,
  seller_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 100),
  price       numeric(12, 2) not null check (price >= 0),
  year        int not null check (year between 1900 and 2100),
  location    text not null check (char_length(location) between 1 and 100),
  type        text not null check (char_length(type) between 1 and 50),
  condition   text not null check (char_length(condition) between 1 and 50),
  description text not null check (char_length(description) between 1 and 5000),
  image_path  text,  -- path inside the vehicle-images bucket: <seller uuid>/<file>
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index vehicles_seller_id_idx on public.vehicles (seller_id);

create table public.messages (
  id          bigint generated always as identity primary key,
  vehicle_id  bigint not null references public.vehicles (id) on delete cascade,
  sender_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  sender_name text not null check (char_length(sender_name) between 1 and 100),
  email       text not null check (char_length(email) between 3 and 254),
  message     text not null check (char_length(message) between 1 and 2000),
  created_at  timestamptz not null default now()
);

create index messages_vehicle_id_idx on public.messages (vehicle_id);
create index messages_sender_id_idx on public.messages (sender_id);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so RLS policies can read roles without recursion)
-- ---------------------------------------------------------------------------

create function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- Create a profile on signup. Only 'buyer' or 'seller' can be self-selected;
-- anything else (including 'admin') becomes 'buyer'.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)), 100),
    new.email,
    case when new.raw_user_meta_data ->> 'role' = 'seller'
         then 'seller'::public.user_role
         else 'buyer'::public.user_role
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table privileges (explicit; "automatically expose new tables" is off)
-- Column-level grants stop users from setting role, seller_id or sender_id themselves.
-- ---------------------------------------------------------------------------

revoke all on public.profiles, public.vehicles, public.messages from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;

grant select on public.vehicles to anon, authenticated;
grant insert (title, price, year, location, type, condition, description, image_path),
      update (title, price, year, location, type, condition, description, image_path),
      delete
  on public.vehicles to authenticated;

grant select on public.messages to authenticated;
grant insert (vehicle_id, sender_name, email, message) on public.messages to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.messages enable row level security;

-- profiles: see/edit yourself; admins see everyone
create policy "profiles: read own or admin"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- vehicles: anyone can browse; sellers manage their own; admins can delete any
create policy "vehicles: public read"
  on public.vehicles for select to anon, authenticated
  using (true);

create policy "vehicles: sellers insert own"
  on public.vehicles for insert to authenticated
  with check (
    seller_id = (select auth.uid())
    and (select public.current_user_role()) in ('seller', 'admin')
  );

create policy "vehicles: owner update"
  on public.vehicles for update to authenticated
  using (seller_id = (select auth.uid()))
  with check (seller_id = (select auth.uid()));

create policy "vehicles: owner or admin delete"
  on public.vehicles for delete to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()));

-- messages: logged-in users contact sellers (not themselves);
-- readable by the sender, the vehicle's seller, or an admin; never edited
create policy "messages: logged-in users send"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.seller_id <> (select auth.uid())
    )
  );

create policy "messages: sender, seller or admin read"
  on public.messages for select to authenticated
  using (
    sender_id = (select auth.uid())
    or (select public.is_admin())
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.seller_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Image storage (replaces server/uploads)
-- Public read via URL; uploads limited to 5 MB images in the uploader's own folder.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-images', 'vehicle-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp']);

create policy "vehicle-images: owner read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'vehicle-images'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );

create policy "vehicle-images: sellers upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.current_user_role()) in ('seller', 'admin')
  );

create policy "vehicle-images: owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'vehicle-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'vehicle-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "vehicle-images: owner or admin delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'vehicle-images'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );

commit;
