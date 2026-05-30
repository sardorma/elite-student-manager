-- ============================================================
-- Elite Student Manager — Supabase SQL Migration
-- Supabase Dashboard > SQL Editor ga copy-paste qiling
-- ============================================================

-- 1. PROFILES jadvali (har bir user uchun rol)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  role        text not null default 'teacher' check (role in ('admin','teacher','viewer')),
  full_name   text,
  created_at  timestamptz default now()
);

-- Yangi user ro'yxatdan o'tganda avtomatik profil yaratish
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'teacher')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. TEACHER_GROUPS jadvali (qaysi teacher qaysi guruhga kira oladi)
create table if not exists public.teacher_groups (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  group_id    text not null,
  created_at  timestamptz default now(),
  unique(teacher_id, group_id)
);

-- 3. ESM_DATA jadvali (mavjud bo'lsa o'tkazib yuboradi)
create table if not exists public.esm_data (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  payload     jsonb not null,
  updated_at  timestamptz default now()
);
-- user_id ustuniga unique constraint (upsert uchun)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'esm_data_user_id_key'
  ) then
    alter table public.esm_data add constraint esm_data_user_id_key unique (user_id);
  end if;
end $$;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.teacher_groups enable row level security;
alter table public.esm_data       enable row level security;

-- Helper: joriy userning roli
create or replace function public.my_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Helper: teacher shu guruhga kira oladimi
create or replace function public.can_access_group(gid text)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.teacher_groups
    where teacher_id = auth.uid() and group_id = gid
  )
$$;

-- ── PROFILES policies ──
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (
    auth.uid() = id
    or public.my_role() = 'admin'
  );

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (
    auth.uid() = id
    or public.my_role() = 'admin'
  );

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

-- ── TEACHER_GROUPS policies ──
drop policy if exists "tg_select" on public.teacher_groups;
create policy "tg_select" on public.teacher_groups
  for select using (
    public.my_role() = 'admin'
    or teacher_id = auth.uid()
  );

drop policy if exists "tg_all_admin" on public.teacher_groups;
create policy "tg_all_admin" on public.teacher_groups
  for all using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

-- ── ESM_DATA policies ──
drop policy if exists "esm_own" on public.esm_data;
create policy "esm_own" on public.esm_data
  for all
  using (
    auth.uid() = user_id
    or public.my_role() = 'admin'
  )
  with check (
    auth.uid() = user_id
    or public.my_role() = 'admin'
  );

-- ============================================================
-- 5. Birinchi Admini qo'lda belgilash
-- (o'z emailingizni kiriting)
-- ============================================================
-- update public.profiles set role = 'admin' where email = 'siz@email.com';

