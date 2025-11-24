-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for logs
create table logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  drink_name text not null,
  drink_type text, -- e.g. 'Beer', 'Sake', 'Whisky'
  location_name text,
  location_type text, -- 'Home', 'Izakaya', 'Bar', 'Outdoor'
  image_url text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  visibility text default 'public' check (visibility in ('public', 'friends', 'private')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for logs
alter table logs enable row level security;

create policy "Logs are viewable by everyone if public." on logs
  for select using (visibility = 'public');

create policy "Users can view their own logs." on logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own logs." on logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own logs." on logs
  for update using (auth.uid() = user_id);

create policy "Users can delete their own logs." on logs
  for delete using (auth.uid() = user_id);

-- Create a table for follows (simple version)
create table follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

alter table follows enable row level security;

create policy "Follows are viewable by everyone." on follows
  for select using (true);

create policy "Users can follow others." on follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow." on follows
  for delete using (auth.uid() = follower_id);

-- Function to handle new user creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
