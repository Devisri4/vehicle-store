# 🚗 Second-Hand Vehicle Store

React + Vite + Tailwind CSS frontend, Supabase (PostgreSQL, Auth, Storage) backend, deployed on Vercel.
Migrated from the original HTML/Express/MySQL version, preserved at
[Devisri4/vehicle-store-legacy](https://github.com/Devisri4/vehicle-store-legacy).

## Roles
- **Buyer**: browse vehicles, contact sellers (must be logged in)
- **Seller**: post, edit and delete own vehicles; read messages about them
- **Admin**: manage all users and listings (assigned manually in the database)

## Page mapping

| Original page | New route |
| --- | --- |
| index.html | `/` |
| login.html / signup.html | `/login`, `/signup` |
| dashboard.html (buyer) | `/dashboard` |
| vehicle-detail.html | `/vehicles/:id` |
| edit-vehicle.html | `/vehicles/:id/edit` |
| post-vehicle.html | `/post` |
| seller-dashboard.html | `/seller` (+ new `/seller/messages`) |
| admin-dashboard.html | `/admin` |

## Database
`supabase/migrations/0001_initial_schema.sql` creates the tables, Row Level Security policies,
signup trigger and the `vehicle-images` storage bucket. Run it once in the Supabase SQL Editor.

## Environment variables
See `.env.example`. Set them in Vercel (Project → Settings → Environment Variables) and in StackBlitz.
Never commit real keys; never expose the service-role key with a `VITE_` prefix.

## Running (no local installs needed)
- **StackBlitz**: open `https://stackblitz.com/github/Devisri4/vehicle-store` — it installs and runs `npm run dev`.
- **Vercel**: every push to GitHub builds and deploys automatically.
- Locally (if Node 18+ is available): `npm install` then `npm run dev`.
