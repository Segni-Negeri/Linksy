-- Core tables for Linksy
-- Run this against Supabase (Postgres)

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  slug text unique not null,
  destination text not null,
  title text,
  logo_url text,
  brand_color text,
  custom_domain text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references links(id) on delete cascade,
  type text not null,
  target text,
  label text,
  meta jsonb not null default '{}'::jsonb,
  required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references links(id) on delete cascade,
  ip inet,
  user_agent text,
  referer text,
  created_at timestamptz not null default now()
);

create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits(id) on delete set null,
  task_id uuid not null references tasks(id) on delete cascade,
  method text not null,
  status text not null default 'pending',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_links_user on links(user_id) where is_deleted = false;
create index if not exists idx_tasks_link on tasks(link_id);
create index if not exists idx_visits_link_created on visits(link_id, created_at desc);
create index if not exists idx_completions_task_status on completions(task_id, status);
