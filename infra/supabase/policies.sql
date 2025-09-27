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

-- NOTE: Apply via Supabase SQL editor or psql after creating the tables.




