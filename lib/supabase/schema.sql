-- Enable RLS (public.users references removed as it does not exist)
-- alter table public.users enable row level security;

-- 1. Patients Table
create table if not exists public.patients (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamptz default now() not null,
    name text not null,
    birth_date date,
    diagnosis text,
    primary_doctor text,
    hospital_name text,
    created_by uuid references auth.users(id)
);

-- 2. Care Team (User <-> Patient Access)
create table if not exists public.care_team (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamptz default now() not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    role text default 'member' check (role in ('owner', 'admin', 'member')),
    unique(patient_id, user_id)
);

-- 3. Migration: Add patient_id to existing tables
-- We will make it nullable for now to avoid breaking existing data immediately, 
-- but eventually it should be required.
alter table public.blood_tests add column if not exists patient_id uuid references public.patients(id);
alter table public.ct_scans add column if not exists patient_id uuid references public.patients(id);
alter table public.inkt_records add column if not exists patient_id uuid references public.patients(id);
-- alter table public.medical_reports add column if not exists patient_id uuid references public.patients(id);
alter table public.ai_reports add column if not exists patient_id uuid references public.patients(id);

-- RLS Policies
alter table public.patients enable row level security;
alter table public.care_team enable row level security;

-- Drop existing policies to Ensure Idempotency
drop policy if exists "Users can view their care teams" on public.care_team;
drop policy if exists "Users can view patients they belong to" on public.patients;
drop policy if exists "Users can update their own patient record" on public.patients;
drop policy if exists "Users can create patient records" on public.patients;
drop policy if exists "Users can join care teams" on public.care_team;
drop policy if exists "Owners can update care teams" on public.care_team;

-- Care Team Policy: Users can view teams they are part of
create policy "Users can view their care teams"
    on public.care_team for select
    using (auth.uid() = user_id);

-- Patient Policy: Users can view patients if they are in the care team
create policy "Users can view patients they belong to"
    on public.patients for select
    using (
        exists (
            select 1 from public.care_team
            where care_team.patient_id = patients.id
            and care_team.user_id = auth.uid()
        )
    );

-- ==========================================
-- FINAL RLS POLICIES FOR ONBOARDING & UPDATES
-- ==========================================

-- 1. Allow users to update their own patient record (e.g. generating invite code)
create policy "Users can update their own patient record"
    on public.patients for update
    using (created_by = auth.uid());

-- 2. Allow users to create patient records (Onboarding)
create policy "Users can create patient records"
    on public.patients for insert
    with check (auth.uid() = created_by);

-- 3. Allow users to insert into care_team (Onboarding: Joining or Creating)
create policy "Users can join care teams"
    on public.care_team for insert
    with check (auth.uid() = user_id);

-- 4. Allow owners to update care teams
create policy "Owners can update care teams"
    on public.care_team for update
    using (
        exists (
            select 1 from public.care_team as ct
            where ct.patient_id = care_team.patient_id
            and ct.user_id = auth.uid()
            and ct.role = 'owner'
        )
    );


-- ==========================================
-- DATA MIGRATION (Execute to port existing data)
-- ==========================================

-- 1. Create Patient records for existing users (Self)
-- We strictly use the ID from profiles so the UUID matches, facilitating easier data migration
insert into public.patients (id, name, created_by)
select id, coalesce(full_name, email, 'Unknown'), id
from public.profiles
on conflict (id) do nothing;

-- 2. Add users to their own Care Team
insert into public.care_team (patient_id, user_id, role)
select id, id, 'owner'
from public.profiles
on conflict (patient_id, user_id) do nothing;

-- 3. Update existing medical records to populate patient_id
-- Since we reused the profile ID as the patient ID for self-users, we can just copy user_id
update public.blood_tests set patient_id = user_id where patient_id is null;
update public.ct_scans set patient_id = user_id where patient_id is null;
update public.inkt_records set patient_id = user_id where patient_id is null;
update public.ai_reports set patient_id = user_id where patient_id is null;


-- ==========================================
-- SHARED CARE UPDATES
-- ==========================================
alter table public.patients add column if not exists invite_code text unique;

-- Function to generate a random 6-character invite code
create or replace function generate_invite_code()
returns text as $$
declare
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
begin
  for i in 1..6 loop
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  end loop;
  return result;
end;
$$ language plpgsql;

--     on public.blood_tests for select
--     using (
--         exists (
--             select 1 from public.care_team
--             where care_team.patient_id = blood_tests.patient_id
--             and care_team.user_id = auth.uid()
--         )
--     );
