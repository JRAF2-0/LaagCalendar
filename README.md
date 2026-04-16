# Laag — A Philippines Travel Journal

A minimal, calendar-based travel memory portfolio built with **Vite + React + Supabase**.

## Getting started

```bash
npm install
npm run dev
```

The app will run at <http://localhost:5173>. Until Supabase is configured, the app runs on local sample data (10 Philippines destinations).

## Setting up Supabase

1. Create a free project at <https://supabase.com>.
2. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ADMIN_EMAIL`.
3. In Supabase SQL editor, run:

```sql
create table memories (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  location text not null,
  region text,               -- Luzon | Visayas | Mindanao
  caption text not null,
  notes text,
  images text[] not null default '{}',
  privacy text not null default 'public',   -- public | private
  created_at timestamptz default now()
);

alter table memories enable row level security;

-- Anyone can read public memories
create policy "public read" on memories
  for select using (privacy = 'public' or auth.role() = 'authenticated');

-- Only authenticated users (admin) can write
create policy "admin write" on memories
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

4. Create a **Storage** bucket called `memory-photos` (public).
5. In **Authentication → Users**, create one user with the email you set in `VITE_ADMIN_EMAIL`.

## Admin mode

Go to `/login` and sign in with your admin email. You'll see:

- `+` button on calendar dates (hover)
- Edit / delete overlays on memory cards (hover)
- Floating "Add Memory" button
- Admin pill in the nav

Visitors see none of these.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview build locally
