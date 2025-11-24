-- Add drunk_at column
alter table logs add column drunk_at timestamptz;

-- Backfill existing data
update logs set drunk_at = created_at where drunk_at is null;

-- Make it not null (optional, but good for consistency)
alter table logs alter column drunk_at set not null;

-- Default to now() for new rows if not specified (though app will specify it)
alter table logs alter column drunk_at set default now();
