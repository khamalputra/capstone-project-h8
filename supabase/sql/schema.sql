-- FixIt database schema

create table if not exists public.profiles (
  id uuid primary key,
  email text unique,
  role text not null default 'USER' check (role in ('USER', 'PROVIDER', 'ADMIN')),
  name text,
  phone text,
  avatar_url text,
  created_at timestamptz default timezone('utc'::text, now())
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  price integer not null,
  rating numeric default 0,
  rating_count integer default 0,
  city text,
  created_at timestamptz default timezone('utc'::text, now())
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.profiles(id) on delete cascade,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  constraint availability_window check (end_ts > start_ts)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  provider_id uuid references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  status text not null default 'PENDING' check (status in ('PENDING','CONFIRMED','COMPLETED','CANCELLED')),
  notes text,
  created_at timestamptz default timezone('utc'::text, now()),
  constraint bookings_window check (end_ts > start_ts)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default timezone('utc'::text, now())
);

create or replace function public.increment_service_rating(service_id uuid, new_rating integer)
returns void
language plpgsql
as $$
begin
  update public.services
     set rating = ((rating * rating_count) + new_rating)::numeric / nullif(rating_count + 1, 0),
         rating_count = rating_count + 1
   where id = service_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Services policies
create policy "Public read services" on public.services for select using (true);
create policy "Providers manage own services" on public.services for all using (auth.uid() = provider_id) with check (auth.uid() = provider_id);
create policy "Admins manage services" on public.services for all using ((select role from public.profiles where id = auth.uid()) = 'ADMIN') with check (true);

-- Availability policies
create policy "Providers read availability" on public.availability for select using (auth.uid() = provider_id or (select role from public.profiles where id = auth.uid()) = 'ADMIN');
create policy "Providers manage availability" on public.availability for all using (auth.uid() = provider_id) with check (auth.uid() = provider_id);

-- Bookings policies
create policy "Users read own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Providers read service bookings" on public.bookings for select using (auth.uid() = provider_id);
create policy "Users create bookings" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Users cancel own pending bookings" on public.bookings for update using (auth.uid() = user_id) with check (status in ('PENDING','CANCELLED','CONFIRMED'));
create policy "Providers manage requests" on public.bookings for update using (auth.uid() = provider_id) with check (status in ('CONFIRMED','CANCELLED','COMPLETED'));

-- Reviews policies
create policy "Public read reviews" on public.reviews for select using (true);
create policy "Users insert reviews" on public.reviews for insert with check (auth.uid() = user_id);

-- Admin role enforcement
create or replace function public.enforce_role_change()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'UPDATE' and new.role <> old.role) then
    if (current_setting('request.jwt.claim.role', true) is distinct from 'ADMIN') then
      raise exception 'Only admins can change roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_role_change
  before update on public.profiles
  for each row execute procedure public.enforce_role_change();
