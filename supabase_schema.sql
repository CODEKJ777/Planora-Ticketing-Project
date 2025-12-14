-- 1. PROFILES TABLE (Stores user roles and org names)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user', -- 'user' or 'organizer'
  org_name text, -- For organizers
  created_at timestamptz default now()
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using ( true );
create policy "Users can insert their own profile." on public.profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on public.profiles for update using ( auth.uid() = id );

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. EVENTS TABLE (Stores event details)
create table public.events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  organizer_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  location text,
  date timestamptz,
  image_url text,
  price_inr integer default 0,
  is_published boolean default true
);

-- Enable RLS for events
alter table public.events enable row level security;
create policy "Events are viewable by everyone." on public.events for select using ( true );
create policy "Organizers can insert their own events." on public.events for insert with check ( auth.uid() = organizer_id );
create policy "Organizers can update their own events." on public.events for update using ( auth.uid() = organizer_id );


-- 3. UPDATE TICKETS TABLE (Link to specific events)
-- Note: existing tickets will have null event_id, you might want to delete them or backfill
alter table public.tickets add column event_id uuid references public.events(id);
alter table public.tickets add column checked_in_at timestamptz;

-- Update RLS for tickets to allow event organizers to view tickets for their events
create policy "Organizers can view tickets for their events" on public.tickets
  for select using (
    exists (
      select 1 from public.events
      where events.id = tickets.event_id
      and events.organizer_id = auth.uid()
    )
  );
