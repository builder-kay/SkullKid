# Supabase SQL Setup

Run these scripts in this exact order inside Supabase SQL Editor:

1. `00_reset_public_schema.sql`
2. `01_create_schema.sql`
3. `02_seed_basics.sql`

## Notes

- `00_reset_public_schema.sql` clears the entire `public` schema (tables, views, functions, types).
- It does **not** remove Supabase managed schemas like `auth` and `storage`.
- If you also want to remove existing auth accounts, manually run:

```sql
delete from auth.users;
```

- Ensure your app `.env` contains valid Supabase and Clifze keys before testing auth flows.
