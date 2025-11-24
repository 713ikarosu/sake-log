-- Create a bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up access policies for the storage bucket
-- Allow public read access
create policy "Avatars are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload avatars."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow users to update their own avatars
create policy "Users can update their own avatars."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- Allow users to delete their own avatars
create policy "Users can delete their own avatars."
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.uid() = owner );
