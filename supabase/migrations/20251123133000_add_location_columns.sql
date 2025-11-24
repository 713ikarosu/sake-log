-- Add location columns to logs table
alter table public.logs
add column latitude float8,
add column longitude float8,
add column place_id text;

-- Add index for location based queries (optional but good for map bounds)
create index logs_location_idx on public.logs (latitude, longitude);
