-- Supabase RLS policies (stubs)
-- Enable RLS and create owner-only policies for links table.

alter table if exists links enable row level security;

-- Helper: assumes links.user_id stores the owner (auth uid()).
drop policy if exists "links_owner_select" on links;
create policy "links_owner_select" on links
  for select
  using (auth.uid() = user_id and is_deleted = false);

drop policy if exists "links_owner_insert" on links;
create policy "links_owner_insert" on links
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "links_owner_update" on links;
create policy "links_owner_update" on links
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "links_owner_delete" on links;
create policy "links_owner_delete" on links
  for delete
  using (auth.uid() = user_id);

-- RLS policies for tasks table
alter table if exists tasks enable row level security;

drop policy if exists "tasks_owner_select" on tasks;
create policy "tasks_owner_select" on tasks
  for select
  using (exists (
    select 1 from links 
    where links.id = tasks.link_id 
    and links.user_id = auth.uid() 
    and links.is_deleted = false
  ));

drop policy if exists "tasks_owner_insert" on tasks;
create policy "tasks_owner_insert" on tasks
  for insert
  with check (exists (
    select 1 from links 
    where links.id = tasks.link_id 
    and links.user_id = auth.uid()
  ));

drop policy if exists "tasks_owner_update" on tasks;
create policy "tasks_owner_update" on tasks
  for update
  using (exists (
    select 1 from links 
    where links.id = tasks.link_id 
    and links.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from links 
    where links.id = tasks.link_id 
    and links.user_id = auth.uid()
  ));

drop policy if exists "tasks_owner_delete" on tasks;
create policy "tasks_owner_delete" on tasks
  for delete
  using (exists (
    select 1 from links 
    where links.id = tasks.link_id 
    and links.user_id = auth.uid()
  ));

-- RLS policies for visits table (public read, owner-only analytics)
alter table if exists visits enable row level security;

-- Allow public inserts (for visit tracking)
drop policy if exists "visits_public_insert" on visits;
create policy "visits_public_insert" on visits
  for insert
  with check (true);

-- Allow owners to read their link's visits
drop policy if exists "visits_owner_select" on visits;
create policy "visits_owner_select" on visits
  for select
  using (exists (
    select 1 from links 
    where links.id = visits.link_id 
    and links.user_id = auth.uid() 
    and links.is_deleted = false
  ));

-- RLS policies for completions table
alter table if exists completions enable row level security;

-- Allow public inserts (for verification tracking)
drop policy if exists "completions_public_insert" on completions;
create policy "completions_public_insert" on completions
  for insert
  with check (true);

-- Allow owners to read completions for their links
drop policy if exists "completions_owner_select" on completions;
create policy "completions_owner_select" on completions
  for select
  using (exists (
    select 1 from visits 
    join links on links.id = visits.link_id
    where visits.id = completions.visit_id 
    and links.user_id = auth.uid() 
    and links.is_deleted = false
  ));

-- Allow service role to update completions (for admin operations)
drop policy if exists "completions_service_update" on completions;
create policy "completions_service_update" on completions
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- NOTE: Apply via Supabase SQL editor or psql after creating the tables.




