-- Manual de Procesos — schema + RLS
-- Run this in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Systems
create table if not exists systems (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null default '#5b7a99',
  created_at timestamptz default now()
);

-- Processes
create table if not exists processes (
  id          uuid primary key default gen_random_uuid(),
  system_id   uuid references systems(id),
  title       text not null,
  category    text,
  tags        text[] default '{}',
  is_favorite boolean default false,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Steps
create table if not exists steps (
  id         uuid primary key default gen_random_uuid(),
  process_id uuid references processes(id) on delete cascade,
  "order"    integer not null,
  text       text not null,
  warning    text,
  image_url  text
);

-- RLS
alter table systems   enable row level security;
alter table processes enable row level security;
alter table steps     enable row level security;

-- SELECT: any authenticated user
drop policy if exists "auth read systems"   on systems;
drop policy if exists "auth read processes" on processes;
drop policy if exists "auth read steps"     on steps;
create policy "auth read systems"   on systems   for select using (auth.role() = 'authenticated');
create policy "auth read processes" on processes for select using (auth.role() = 'authenticated');
create policy "auth read steps"     on steps     for select using (auth.role() = 'authenticated');

-- Favoritos: any authenticated user can toggle is_favorite on processes
drop policy if exists "auth update favorite" on processes;
create policy "auth update favorite" on processes for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- INSERT/UPDATE/DELETE: admin only (role stored in user_metadata)
drop policy if exists "admin write systems"   on systems;
drop policy if exists "admin write processes" on processes;
drop policy if exists "admin write steps"     on steps;
create policy "admin write systems"   on systems   for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "admin write processes" on processes for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
create policy "admin write steps"     on steps     for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
