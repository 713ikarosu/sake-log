-- Create a bucket for log images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('log-images', 'log-images', true)
on conflict (id) do nothing;

-- Set up access policies for the storage bucket
-- Allow public read access
create policy "Log images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'log-images' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload log images."
  on storage.objects for insert
  with check ( bucket_id = 'log-images' and auth.role() = 'authenticated' );

-- Allow users to update their own images
create policy "Users can update their own log images."
  on storage.objects for update
  using ( bucket_id = 'log-images' and auth.uid() = owner );

-- Allow users to delete their own images
create policy "Users can delete their own log images."
  on storage.objects for delete
  using ( bucket_id = 'log-images' and auth.uid() = owner );
