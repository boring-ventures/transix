-- Enable RLS
alter table auth.users enable row level security;

-- Create Branches table first since it's referenced by profiles
create table public.branches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  city text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Profiles table
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text,
  role text check (role in ('superadmin', 'branch_admin', 'seller')) not null,
  branch_id uuid references public.branches(id),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create function to check if superadmin exists
create or replace function public.superadmin_exists()
returns boolean as $$
begin
  return exists(
    select 1 from public.profiles
    where role = 'superadmin'
  );
end;
$$ language plpgsql security definer;

-- Create function to create first superadmin
create or replace function public.create_first_superadmin(
  email text,
  password text,
  full_name text
)
returns json as $$
declare
  new_user uuid;
  result json;
begin
  -- Check if superadmin already exists
  if public.superadmin_exists() then
    return json_build_object('error', 'Superadmin already exists');
  end if;

  -- Create user in auth.users
  insert into auth.users (email, encrypted_password, email_confirmed_at)
  values (email, crypt(password, gen_salt('bf')), now())
  returning id into new_user;

  -- Create profile
  insert into public.profiles (user_id, full_name, role)
  values (new_user, full_name, 'superadmin');

  return json_build_object('user_id', new_user);
end;
$$ language plpgsql security definer;

-- RLS Policies
create policy "Profiles are viewable by users who created them."
  on profiles for select
  using ( auth.uid() = user_id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = user_id );