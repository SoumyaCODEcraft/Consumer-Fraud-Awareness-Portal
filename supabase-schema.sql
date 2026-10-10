-- =====================================================================
-- FraudSafe – Supabase schema
-- Run this whole file once in: Supabase Dashboard > SQL Editor > New query
-- It is safe to run again (it uses IF NOT EXISTS / DROP ... IF EXISTS).
-- =====================================================================
-- Passwords are NOT stored here. Supabase Auth keeps them (hashed) in its
-- own private auth schema. We only store extra profile info.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. PROFILES  (one row per registered user)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    name        text not null
                check (char_length(btrim(name)) between 1 and 100),
    email       text,
    created_at  timestamptz not null default now()
);

comment on table public.profiles is
    'Public-schema profile for each auth user. Private: RLS lets users see only their own row.';


-- ---------------------------------------------------------------------
-- 2. REPORTS  (replaces the old localStorage "Send Feedback / Report" form)
-- ---------------------------------------------------------------------
create table if not exists public.reports (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users (id) on delete set null,
    name        text not null check (char_length(btrim(name))  between 1 and 100),
    email       text not null check (char_length(btrim(email)) between 3 and 255),
    fraud_type  text not null check (fraud_type in (
                    'Online Shopping Fraud',
                    'UPI / Payment Fraud',
                    'Phishing',
                    'Fake Customer Care',
                    'OTP Scam',
                    'Fake Offers',
                    'Delivery Scam',
                    'Fake Job Scam',
                    'Impersonation Scam',
                    'SIM Scam'
                )),
    message     text not null check (char_length(btrim(message)) between 5 and 2000),
    created_at  timestamptz not null default now()
);

create index if not exists reports_user_id_idx    on public.reports (user_id);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

comment on table public.reports is
    'Fraud reports / feedback sent from the website. Anyone can insert; users can only read their own.';


-- ---------------------------------------------------------------------
-- 3. AUTO-CREATE A PROFILE WHEN SOMEONE REGISTERS
--    Runs on the database side, so the browser never needs permission
--    to insert into "profiles".
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, name, email)
    values (
        new.id,
        coalesce(
            nullif(btrim(left(new.raw_user_meta_data ->> 'name', 100)), ''),
            split_part(new.email, '@', 1)
        ),
        new.email
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

-- Nobody should be able to call this function directly from the API.
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
--    RLS = the database itself checks every request. Even if someone edits
--    the JavaScript in their browser, they cannot read or change other
--    people's rows.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.reports  enable row level security;

-- ----- profiles: a user can read / update ONLY their own row ----------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
    on public.profiles for select
    to authenticated
    using ( (select auth.uid()) = id );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
    on public.profiles for update
    to authenticated
    using      ( (select auth.uid()) = id )
    with check ( (select auth.uid()) = id );

-- No INSERT or DELETE policy on purpose:
--   * rows are created only by the trigger above
--   * rows are deleted automatically if the auth user is deleted

-- ----- reports: anyone may submit, users may read only their own -------
drop policy if exists "reports_insert_anyone" on public.reports;
create policy "reports_insert_anyone"
    on public.reports for insert
    to anon, authenticated
    with check ( user_id is null or user_id = (select auth.uid()) );

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
    on public.reports for select
    to authenticated
    using ( user_id = (select auth.uid()) );

-- No UPDATE / DELETE policies: reports cannot be edited or removed from the website.


-- ---------------------------------------------------------------------
-- 5. TABLE PRIVILEGES  (second layer of protection, on top of RLS)
-- ---------------------------------------------------------------------
revoke all on public.profiles from anon, authenticated;
revoke all on public.reports  from anon, authenticated;

-- profiles: logged-in users may read, and may change ONLY the "name" column
grant select           on public.profiles to authenticated;
grant update (name)    on public.profiles to authenticated;

-- reports: visitors may submit; logged-in users may read their own
grant insert           on public.reports  to anon, authenticated;
grant select           on public.reports  to authenticated;


-- ---------------------------------------------------------------------
-- 6. (OPTIONAL) BACK-FILL profiles for users created before this script
-- ---------------------------------------------------------------------
insert into public.profiles (id, name, email)
select u.id,
       coalesce(nullif(btrim(left(u.raw_user_meta_data ->> 'name', 100)), ''), split_part(u.email, '@', 1)),
       u.email
from auth.users u
on conflict (id) do nothing;


-- ---------------------------------------------------------------------
-- HOW TO VIEW SUBMITTED REPORTS (as the site owner):
-- Dashboard > Table Editor > reports   (the dashboard bypasses RLS for you)
-- ---------------------------------------------------------------------
