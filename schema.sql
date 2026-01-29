-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Blood Tests table
create table blood_tests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  test_date date not null,
  
  -- Metrics
  calcium float, -- 8.5~10.5
  inorganic_p float, -- 2.5~4.2
  glucose float, -- 70~110
  bun float, -- 8.5~22
  creatinine float, -- 0.68~1.19
  uric_acid float, -- 3.5~8.1
  total_cholesterol float, -- 142~240
  total_protein float, -- 6.0~8.0
  albumin float, -- 3.3~5.3
  alk_phos float, -- 50~151
  ast float, -- 13.0~34.0
  alt float, -- 5.0~46.0
  t_bilirubin float, -- 0.5~1.8
  gamma_gt float, -- 12.0~54.0
  na float, -- 135.0~145.0
  k float, -- 3.5~5.5
  cl float, -- 98~110
  amylase float, -- 30~115
  lipase float, -- 5.0~60.0
  wbc_count float, -- 4.0~10.8
  rbc_count float, -- 3.6~6.1
  hemoglobin float, -- 13.0~17.4
  hct float, -- 40.0~52.0
  neutrophil float, -- 1.7~7
  cea float, -- 0.0~5.0
  ca_19_9 float, -- 0~35

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- iNKt Records
create table inkt_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  blood_collection_date date not null,
  first_admin_date date,
  second_admin_date date,
  notes text,
  treatment_effect text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CT Scans
create table ct_scans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  scan_date date not null,
  image_url text, -- Storage path
  cancer_size text, -- Can be text description like "2.5cm"
  interpretation text,
  doctor_opinion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Reports
create table ai_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  report_date date default current_date,
  content text,
  diet_recommendation text,
  treatment_recommendation text,
  
  -- References to source data (can be array of IDs or just text summary kept)
  reference_data jsonb, 

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table profiles enable row level security;
alter table blood_tests enable row level security;
alter table inkt_records enable row level security;
alter table ct_scans enable row level security;
alter table ai_reports enable row level security;

-- Profiles: Users can see their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Blood Tests: Users can see/edit own tests
create policy "Users can view own blood tests" on blood_tests for select using (auth.uid() = user_id);
create policy "Users can insert own blood tests" on blood_tests for insert with check (auth.uid() = user_id);
create policy "Users can update own blood tests" on blood_tests for update using (auth.uid() = user_id);

-- iNKt, CT, AI Reports: Similar policies
create policy "Users can view own records" on inkt_records for select using (auth.uid() = user_id);
create policy "Users can insert own records" on inkt_records for insert with check (auth.uid() = user_id);

create policy "Users can view own scans" on ct_scans for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on ct_scans for insert with check (auth.uid() = user_id);

create policy "Users can view own reports" on ai_reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on ai_reports for insert with check (auth.uid() = user_id);

-- Trigger to create profile on signup
drop function if exists public.handle_new_user cascade;
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
