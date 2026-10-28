-- Vehicle Store: let the server-side delete-user function (api/delete-user.js) read roles.
-- "Automatically expose new tables" is off, so service_role has no table privileges by default.
-- It only needs to read who is an admin; the deletion itself goes through the Auth admin API.
-- Run once in Supabase Dashboard -> SQL Editor.

grant usage on schema public to service_role;
grant select (id, role) on public.profiles to service_role;
