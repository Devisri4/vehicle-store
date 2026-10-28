-- Vehicle Store: sold status, public seller card, saved vehicles, message replies, admin role changes.
-- Run once in Supabase Dashboard -> SQL Editor. One transaction: if anything fails, nothing is applied.

begin;

-- ---------------------------------------------------------------------------
-- 1. Mark as sold
-- ---------------------------------------------------------------------------

alter table public.vehicles
  add column status text not null default 'available'
    constraint vehicles_status_check check (status in ('available', 'sold'));

create index vehicles_status_idx on public.vehicles (status);

-- Owners can change it (the existing "owner update" policy limits rows to their own)
grant update (status) on public.vehicles to authenticated;

-- New enquiries only for vehicles that are still for sale
drop policy "messages: logged-in users send" on public.messages;
create policy "messages: logged-in users send"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
        and v.seller_id <> (select auth.uid())
        and v.status = 'available'
    )
  );

-- ---------------------------------------------------------------------------
-- 2. Public seller card: name, join date and listing count of someone who has listings.
--    profiles stays private; this exposes only those three values, only for active sellers.
-- ---------------------------------------------------------------------------

create function public.seller_card(seller uuid)
returns table (name text, member_since timestamptz, listings bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select p.name, p.created_at, count(v.id)
  from public.profiles p
  join public.vehicles v on v.seller_id = p.id
  where p.id = seller
  group by p.id, p.name, p.created_at;
$$;

revoke execute on function public.seller_card(uuid) from public;
grant execute on function public.seller_card(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Saved vehicles (favourites): each user sees and changes only their own
-- ---------------------------------------------------------------------------

create table public.favorites (
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  vehicle_id bigint not null references public.vehicles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);

create index favorites_vehicle_id_idx on public.favorites (vehicle_id);

alter table public.favorites enable row level security;
revoke all on public.favorites from anon, authenticated;
grant select, delete on public.favorites to authenticated;
grant insert (vehicle_id) on public.favorites to authenticated;

create policy "favorites: read own"
  on public.favorites for select to authenticated
  using (user_id = (select auth.uid()));

create policy "favorites: add own"
  on public.favorites for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "favorites: remove own"
  on public.favorites for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Replies inside a message conversation (buyer <-> seller); admins can read
-- ---------------------------------------------------------------------------

create table public.message_replies (
  id         bigint generated always as identity primary key,
  message_id bigint not null references public.messages (id) on delete cascade,
  sender_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index message_replies_message_id_idx on public.message_replies (message_id);

-- True when the current user sent the original message or owns the vehicle it is about
create function public.is_message_participant(msg bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.messages m
    join public.vehicles v on v.id = m.vehicle_id
    where m.id = msg
      and (m.sender_id = (select auth.uid()) or v.seller_id = (select auth.uid()))
  );
$$;

revoke execute on function public.is_message_participant(bigint) from public, anon;
grant execute on function public.is_message_participant(bigint) to authenticated;

alter table public.message_replies enable row level security;
revoke all on public.message_replies from anon, authenticated;
grant select on public.message_replies to authenticated;
grant insert (message_id, body) on public.message_replies to authenticated;

create policy "replies: participants or admin read"
  on public.message_replies for select to authenticated
  using ((select public.is_admin()) or public.is_message_participant(message_id));

create policy "replies: participants send"
  on public.message_replies for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_message_participant(message_id));

-- ---------------------------------------------------------------------------
-- 5. Admins switch users between buyer and seller. Promoting to admin stays a manual SQL step.
-- ---------------------------------------------------------------------------

create function public.admin_set_role(target uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only.' using errcode = '42501';
  end if;
  if new_role not in ('buyer', 'seller') then
    raise exception 'Role must be buyer or seller.' using errcode = '22023';
  end if;
  if target = auth.uid() then
    raise exception 'You cannot change your own role.' using errcode = '22023';
  end if;
  update public.profiles set role = new_role where id = target and role <> 'admin';
  if not found then
    raise exception 'User not found, or the user is an admin.' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.admin_set_role(uuid, public.user_role) from public, anon;
grant execute on function public.admin_set_role(uuid, public.user_role) to authenticated;

commit;
