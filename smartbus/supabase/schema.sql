-- SmartBus - College Bus Management System
-- PostgreSQL Schema for Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles Table (extends Supabase auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('admin', 'student', 'driver')),
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trigger to update updated_at on profiles
create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function handle_updated_at();

-- ============================================================
-- Buses Table
-- ============================================================
create table if not exists buses (
  id uuid default uuid_generate_v4() primary key,
  plate_number text not null unique,
  capacity integer not null check (capacity > 0),
  model text,
  status text default 'active' check (status in ('active', 'maintenance', 'retired')),
  driver_id uuid references drivers(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger for buses updated_at
create trigger buses_updated_at
  before update on buses
  for each row
  execute function handle_updated_at();

-- Index on plate_number for faster lookups
create index idx_buses_plate_number on buses(plate_number);

-- Index on driver_id for faster driver-bus queries
create index idx_buses_driver_id on buses(driver_id);

-- ============================================================
-- Drivers Table
-- ============================================================
create table if not exists drivers (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text unique not null,
  phone text,
  license_number text not null unique,
  license_expiry date not null,
  status text default 'available' check (status in ('available', 'on_duty', 'off_duty')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger for drivers updated_at
create trigger drivers_updated_at
  before update on drivers
  for each row
  execute function handle_updated_at();

-- Index on license_number for faster lookups
create index idx_drivers_license_number on drivers(license_number);

-- Index on status for faster driver queries
create index idx_drivers_status on drivers(status);

-- ============================================================
-- Routes Table
-- ============================================================
create table if not exists routes (
  id uuid default uuid_generate_v4() primary key,
  route_name text not null unique,
  description text,
  start_location text not null,
  end_location text not null,
  waypoints text, -- JSON array of waypoints
  distance_km numeric(10, 2),
  estimated_duration_minutes integer,
  status text default 'active' check (status in ('active', 'inactive', 'planned')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger for routes updated_at
create trigger routes_updated_at
  before update on routes
  for each row
  execute function handle_updated_at();

-- Index on route_name for faster lookups
create index idx_routes_route_name on routes(route_name);

-- ============================================================
-- Bus Stops Table
-- ============================================================
create table if not exists bus_stops (
  id uuid default uuid_generate_v4() primary key,
  route_id uuid references routes(on delete cascade) not null,
  stop_name text not null,
  address text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  stop_order integer not null default 1,
  is_pickup boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger for bus_stops updated_at
create trigger bus_stops_updated_at
  before update on bus_stops
  for each row
  execute function handle_updated_at();

-- Index on route_id for faster route-stop queries
create index idx_bus_stops_route_id on bus_stops(route_id);

-- Index on stop_order for sequential stop queries
create index idx_bus_stops_stop_order on bus_stops(stop_order);

-- ============================================================
-- Student Buses Table (Many-to-Many: Students ↔ Buses)
-- ============================================================
create table if not exists student_buses (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  bus_id uuid references buses(id) on delete cascade not null,
  route_id uuid references routes(id),
  seat_number text,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  assigned_by uuid references profiles(id),
  active boolean default true
);

-- Unique constraint to prevent duplicate assignments
create unique index idx_student_buses_student_bus on student_buses(student_id, bus_id);

-- Index on student_id for faster student queries
create index idx_student_buses_student_id on student_buses(student_id);

-- Index on bus_id for faster bus queries
create index idx_student_buses_bus_id on student_buses(bus_id);

-- Index on route_id for faster route queries
create index idx_student_buses_route_id on student_buses(route_id);

-- ============================================================
-- Attendance Table
-- ============================================================
create table if not exists attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  bus_id uuid references buses(id) not null,
  route_id uuid references routes(id),
  attendance_status text not null check (attendance_status in ('present', 'absent', 'late', 'excused')),
  attendance_date date not null,
  marked_by uuid references profiles(id),
  marked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, bus_id, attendance_date) -- Prevent duplicate attendance
);

-- Index on student_id for faster student attendance queries
create index idx_attendance_student_id on attendance(student_id);

-- Index on bus_id and date for faster bus/date queries
create index idx_attendance_bus_date on attendance(bus_id, attendance_date);

-- Index on attendance_date for faster date-based queries
create index idx_attendance_date on attendance(attendance_date);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table buses enable row level security;
alter table drivers enable row level security;
alter table routes enable row level security;
alter table bus_stops enable row level security;
alter table student_buses enable row level security;
alter table attendance enable row level security;

-- ============================================================
-- Profiles RLS Policies
-- ============================================================
-- Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can insert profiles (during signup)
create policy "Admins can insert profiles"
  on profiles for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update profiles
create policy "Admins can update profiles"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Buses RLS Policies
-- ============================================================
-- Everyone can view active buses
create policy "Everyone can view active buses"
  on buses for select
  using (status = 'active');

-- Admins can manage buses
create policy "Admins can manage buses"
  on buses for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Drivers can view buses assigned to them
create policy "Drivers can view assigned bus"
  on buses for select
  using (
    driver_id = auth.uid()::text or
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'driver'
    )
  );

-- ============================================================
-- Drivers RLS Policies
-- ============================================================
-- Everyone can view active drivers
create policy "Everyone can view active drivers"
  on drivers for select
  using (status = 'available' or status = 'on_duty');

-- Admins can manage drivers
create policy "Admins can manage drivers"
  on drivers for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Drivers can view their own profile
create policy "Drivers can view own profile"
  on drivers for select
  using (email = current_user or id::text = auth.uid());

-- ============================================================
-- Routes RLS Policies
-- ============================================================
-- Everyone can view active routes
create policy "Everyone can view active routes"
  on routes for select
  using (status = 'active');

-- Admins can manage routes
create policy "Admins can manage routes"
  on routes for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Bus Stops RLS Policies
-- ============================================================
-- Everyone can view bus stops
create policy "Everyone can view bus stops"
  on bus_stops for select
  using (true);

-- Admins can manage bus stops
create policy "Admins can manage bus stops"
  on bus_stops for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Student Buses RLS Policies
-- ============================================================
-- Students can view their own bus assignment
create policy "Students can view own assignment"
  on student_buses for select
  using (
    student_id = auth.uid()::text or
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'student'
    )
  );

-- Admins can manage student bus assignments
create policy "Admins can manage student buses"
  on student_buses for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Attendance RLS Policies
-- ============================================================
-- Students can view their own attendance
create policy "Students can view own attendance"
  on attendance for select
  using (student_id = auth.uid()::text);

-- Drivers can view attendance for their bus
create policy "Drivers can view bus attendance"
  on attendance for select
  using (
    exists (
      select 1 from buses
      where buses.id = attendance.bus_id
      and buses.driver_id = auth.uid()::text
    )
  );

-- Admins can manage attendance
create policy "Admins can manage attendance"
  on attendance for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Helper Function
-- ============================================================
create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

grant all on profiles to authenticated;
grant all on buses to authenticated;
grant all on drivers to authenticated;
grant all on routes to authenticated;
grant all on bus_stops to authenticated;
grant all on student_buses to authenticated;
grant all on attendance to authenticated;

comment on table profiles is 'User profiles extending Supabase auth, with role-based access';
comment on table buses is 'College transportation buses with capacity and status';
comment on table drivers is 'Registered bus drivers with license information';
comment on table routes is 'Bus routes with stops and schedules';
comment on table bus_stops is 'Designated bus stop locations along routes';
comment on table student_buses is 'Student-bus assignments with seat numbers';
comment on table attendance is 'Daily student attendance records';