-- WARNING:
-- This script irreversibly deletes ALL objects in the public schema.
-- It does NOT drop Supabase-managed schemas like auth/storage.
-- Run this only if you are sure you want a clean slate.

begin;

-- Drop views/materialized views first.
do $$
declare
  r record;
begin
  for r in
    select schemaname, matviewname as obj_name
    from pg_matviews
    where schemaname = 'public'
  loop
    execute format('drop materialized view if exists %I.%I cascade', r.schemaname, r.obj_name);
  end loop;

  for r in
    select table_schema as schemaname, table_name as obj_name
    from information_schema.views
    where table_schema = 'public'
  loop
    execute format('drop view if exists %I.%I cascade', r.schemaname, r.obj_name);
  end loop;
end $$;

-- Drop tables.
do $$
declare
  r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('drop table if exists public.%I cascade', r.tablename);
  end loop;
end $$;

-- Drop functions.
do $$
declare
  r record;
begin
  for r in
    select n.nspname as schema_name, p.proname as fn_name, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format('drop function if exists %I.%I(%s) cascade', r.schema_name, r.fn_name, r.args);
  end loop;
end $$;

-- Drop custom types (enums/domains/composites).
do $$
declare
  r record;
begin
  for r in
    select t.typname
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typtype in ('e', 'd', 'c')
  loop
    execute format('drop type if exists public.%I cascade', r.typname);
  end loop;
end $$;

commit;

-- Optional: If you also want to remove existing auth users, run this manually:
-- delete from auth.users;
