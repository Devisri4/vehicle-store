-- Vehicle Store: allow up to 4 photos per vehicle (replaces the single image_path column).
-- Run once in Supabase Dashboard -> SQL Editor, BEFORE deploying the matching app code.

begin;

-- True when every path is inside the given seller's folder ("<seller uuid>/...")
create function public.paths_in_folder(paths text[], folder uuid)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(bool_and(p like folder::text || '/%'), true) from unnest(paths) as p;
$$;

alter table public.vehicles add column image_paths text[] not null default '{}';

-- Keep existing photos: the single image becomes the first (cover) photo
update public.vehicles set image_paths = array[image_path] where image_path is not null;

alter table public.vehicles drop column image_path;

alter table public.vehicles
  add constraint vehicles_image_paths_max check (cardinality(image_paths) <= 4),
  add constraint vehicles_image_paths_own_folder check (public.paths_in_folder(image_paths, seller_id));

grant insert (image_paths), update (image_paths) on public.vehicles to authenticated;

commit;
