-- Seed data for local/dev testing
-- NOTE: Supabase Auth manages users. Set an existing auth user UUID below.
-- Replace the value of test_user_id with a real user id from auth.users when running in Supabase.

-- Variables (psql syntax). If your tool doesn't support \set, replace manually.
-- Example: \set test_user_id '00000000-0000-0000-0000-000000000000'
\set test_user_id '00000000-0000-0000-0000-000000000001'

-- Create a sample link for the test user (idempotent by slug)
with upsert_link as (
  insert into links (user_id, slug, destination, title, logo_url, brand_color)
  values (:
test_user_id, 'testslug', 'https://example.com', 'My Test Link', null, '#111827')
  on conflict (slug)
  do update set title = excluded.title,
                destination = excluded.destination,
                brand_color = excluded.brand_color,
                is_deleted = false
  returning id
)
select * from upsert_link;

-- Insert a sample task tied to that link (idempotent by (link_id,label))
insert into tasks (link_id, type, target, label, required)
select l.id, 'manual', 'https://instagram.com/example', 'Follow on Instagram', true
from links l
where l.slug = 'testslug'
  and not exists (
    select 1 from tasks t where t.link_id = l.id and t.label = 'Follow on Instagram'
  );

-- Verify
-- select * from links where slug = 'testslug';
-- select * from tasks where link_id = (select id from links where slug = 'testslug');





