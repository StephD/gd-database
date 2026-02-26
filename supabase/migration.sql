-- =============================================
-- Game Database Migration (gd-database)
-- Compatible with galaxydefense-webapp Supabase project
-- Run this in the Supabase SQL Editor
-- =============================================
-- REQUIRES: user_profiles table already exists (from galaxydefense migrations)
-- Uses: user_profiles.user_id, user_profiles.is_admin for admin checks
-- =============================================

-- 0. Add username to user_profiles
alter table public.user_profiles
  add column if not exists username text;

-- Allow users to update their own profile (for username)
drop policy if exists "Allow users to update own profile" on public.user_profiles;
create policy "Allow users to update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- 1. Add parent_id + submitted_by to existing turrets table
-- submitted_by references auth.users (same as user_profiles.user_id)
alter table public.turrets
  add column if not exists image_url text,
  add column if not exists parent_id uuid references public.turrets(id) on delete cascade,
  add column if not exists submitted_by uuid references auth.users(id);

create unique index if not exists turrets_one_pending_edit
  on public.turrets (parent_id) where parent_id is not null;

-- 2. Add parent_id + submitted_by to existing chips table
alter table public.chips
  add column if not exists image_url text,
  add column if not exists parent_id uuid references public.chips(id) on delete cascade,
  add column if not exists submitted_by uuid references auth.users(id);

create unique index if not exists chips_one_pending_edit
  on public.chips (parent_id) where parent_id is not null;

-- 3. Frames table
create table if not exists public.frames (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  hp_star1 numeric,
  hp_star2 numeric,
  hp_star3 numeric,
  hp_star4 numeric,
  hp_star5 numeric,
  def_star1 numeric,
  def_star2 numeric,
  def_star3 numeric,
  def_star4 numeric,
  def_star5 numeric,
  parent_id uuid references public.frames(id) on delete cascade,
  submitted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create unique index if not exists frames_one_pending_edit
  on public.frames (parent_id) where parent_id is not null;

-- 4. Guardians table
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  hp_star1 numeric,
  hp_star2 numeric,
  hp_star3 numeric,
  hp_star4 numeric,
  hp_star5 numeric,
  def_star1 numeric,
  def_star2 numeric,
  def_star3 numeric,
  def_star4 numeric,
  def_star5 numeric,
  parent_id uuid references public.guardians(id) on delete cascade,
  submitted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create unique index if not exists guardians_one_pending_edit
  on public.guardians (parent_id) where parent_id is not null;

-- 5. Rangers table
create table if not exists public.rangers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  atk_star1 numeric,
  atk_star2 numeric,
  atk_star3 numeric,
  atk_star4 numeric,
  atk_star5 numeric,
  spd_star1 numeric,
  spd_star2 numeric,
  spd_star3 numeric,
  spd_star4 numeric,
  spd_star5 numeric,
  parent_id uuid references public.rangers(id) on delete cascade,
  submitted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create unique index if not exists rangers_one_pending_edit
  on public.rangers (parent_id) where parent_id is not null;

-- 6. RLS for all entity tables
-- Admin check: user_profiles.user_id = auth.uid() AND user_profiles.is_admin = true

-- Turrets
alter table public.turrets enable row level security;

drop policy if exists "Anyone can read turrets" on public.turrets;
create policy "Anyone can read turrets"
  on public.turrets for select using (true);

drop policy if exists "Authenticated users can propose turret edits" on public.turrets;
create policy "Authenticated users can propose turret edits"
  on public.turrets for insert
  with check (auth.uid() is not null and parent_id is not null);

drop policy if exists "Admins can update turrets" on public.turrets;
create policy "Admins can update turrets"
  on public.turrets for update
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can delete turret revisions" on public.turrets;
create policy "Admins can delete turret revisions"
  on public.turrets for delete
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

-- Chips
alter table public.chips enable row level security;

drop policy if exists "Anyone can read chips" on public.chips;
create policy "Anyone can read chips"
  on public.chips for select using (true);

drop policy if exists "Authenticated users can propose chip edits" on public.chips;
create policy "Authenticated users can propose chip edits"
  on public.chips for insert
  with check (auth.uid() is not null and parent_id is not null);

drop policy if exists "Admins can update chips" on public.chips;
create policy "Admins can update chips"
  on public.chips for update
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

drop policy if exists "Admins can delete chip revisions" on public.chips;
create policy "Admins can delete chip revisions"
  on public.chips for delete
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

-- Frames
alter table public.frames enable row level security;

create policy "Anyone can read frames"
  on public.frames for select using (true);

create policy "Authenticated users can propose frame edits"
  on public.frames for insert
  with check (auth.uid() is not null and parent_id is not null);

create policy "Admins can update frames"
  on public.frames for update
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete frame revisions"
  on public.frames for delete
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

-- Guardians
alter table public.guardians enable row level security;

create policy "Anyone can read guardians"
  on public.guardians for select using (true);

create policy "Authenticated users can propose guardian edits"
  on public.guardians for insert
  with check (auth.uid() is not null and parent_id is not null);

create policy "Admins can update guardians"
  on public.guardians for update
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete guardian revisions"
  on public.guardians for delete
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

-- Rangers
alter table public.rangers enable row level security;

create policy "Anyone can read rangers"
  on public.rangers for select using (true);

create policy "Authenticated users can propose ranger edits"
  on public.rangers for insert
  with check (auth.uid() is not null and parent_id is not null);

create policy "Admins can update rangers"
  on public.rangers for update
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete ranger revisions"
  on public.rangers for delete
  using (
    exists (select 1 from public.user_profiles where user_id = auth.uid() and is_admin = true)
  );
