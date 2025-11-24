-- Update the handle_new_user function to be more robust
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_username text;
begin
  -- Try to find a username from various metadata fields
  new_username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Ensure username is at least 3 chars (pad if necessary)
  if char_length(new_username) < 3 then
    new_username := new_username || '_' || substr(md5(random()::text), 1, 4);
  end if;

  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new_username,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    username = excluded.username,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

-- Attempt to fix existing profiles with null usernames
-- Note: This requires access to auth.users which is restricted.
-- If running from Dashboard SQL Editor, this usually works.
do $$
declare
  user_record record;
  new_name text;
begin
  for user_record in select * from auth.users loop
    -- Check if profile exists and has null username or doesn't exist
    if exists (select 1 from public.profiles where id = user_record.id and username is null) then
       new_name := coalesce(
         user_record.raw_user_meta_data->>'username',
         user_record.raw_user_meta_data->>'full_name',
         user_record.raw_user_meta_data->>'name',
         split_part(user_record.email, '@', 1)
       );

       update public.profiles
       set username = new_name
       where id = user_record.id;
    end if;
  end loop;
end;
$$;
