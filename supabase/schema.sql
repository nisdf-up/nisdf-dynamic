-- NISDF Base Schema (schema.sql)
-- Run this first in Supabase SQL Editor

-- 1) Profiles (optional helper table for roles)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text check (role in ('admin','staff','member','volunteer')) default 'member',
  created_at timestamptz default now()
);

-- 2) Membership types (fees)
create table if not exists membership_types (
  id bigserial primary key,
  code text unique,
  label text,
  fee_inr integer not null default 0
);
insert into membership_types (code,label,fee_inr) values
  ('GENERAL','General',30),
  ('STUDENT','Student',30),
  ('VOLUNTEER','Volunteer',30),
  ('LIFETIME','Lifetime',500)
on conflict do nothing;

-- 3) Memberships (applications)
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  member_no text unique,
  type_id bigint references membership_types(id),
  full_name text not null,
  father_or_husband text,
  dob date,
  gender text,
  address text,
  mobile text,
  whatsapp text,
  email text,
  occupation text,
  education text,
  motivation text,
  id_proof_type text,
  id_proof_url text,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  txn_mode text,
  txn_id text,
  txn_amount integer,
  txn_at timestamptz,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- 4) Volunteers (optional linkage)
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid references memberships(id) on delete cascade,
  skills text,
  availability text,
  created_at timestamptz default now()
);

-- 5) Documents
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid references memberships(id) on delete cascade,
  cert_no text unique,
  pdf_url text,
  issued_at timestamptz default now()
);
create table if not exists id_cards (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid references memberships(id) on delete cascade,
  card_no text unique,
  pdf_url text,
  issued_at timestamptz default now()
);

-- 6) QR tokens (for verify page)
create table if not exists qr_tokens (
  id uuid primary key default gen_random_uuid(),
  entity_type text check (entity_type in ('certificate','id_card','member')),
  entity_id uuid not null,
  token text unique not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 7) Events / News / Partners / Resources / Posts (CMS)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  description text,
  cover_url text,
  is_published boolean default false,
  created_at timestamptz default now()
);
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  published_at timestamptz,
  body text,
  media_urls text[],
  is_published boolean default false,
  created_at timestamptz default now()
);
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text,
  logo_url text,
  url text,
  is_training_partner boolean default false,
  created_at timestamptz default now()
);
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text,
  file_url text,
  category text,
  created_at timestamptz default now()
);
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text unique,
  excerpt text,
  body text,
  cover_url text,
  language text default 'en',
  published_at timestamptz,
  created_at timestamptz default now()
);

-- 8) Donations
create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  email text,
  phone text,
  amount integer not null,
  purpose text,
  txn_id text,
  status text check (status in ('submitted','verified','rejected')) default 'submitted',
  created_at timestamptz default now()
);

-- 9) Helpers: running number generators
create or replace function gen_running_no(prefix text)
returns text as $$
  select prefix ||
         to_char(extract(year from now())::int, 'FM9999') ||
         '-' ||
         lpad((floor(random()*900000)+100000)::text,6,'0');
$$ language sql;

create or replace function set_member_no()
returns trigger as $$
begin
  if new.member_no is null then
    new.member_no := gen_running_no('NISDF-M-');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_member_no on memberships;
create trigger trg_member_no before insert on memberships
for each row execute function set_member_no();

create or replace function set_doc_nos()
returns trigger as $$
begin
  if TG_TABLE_NAME = 'id_cards' and new.card_no is null then
    new.card_no := gen_running_no('NISDF-ID-');
  elsif TG_TABLE_NAME = 'certificates' and new.cert_no is null then
    new.cert_no := gen_running_no('NISDF-C-');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_card_no on id_cards;
create trigger trg_card_no before insert on id_cards
for each row execute function set_doc_nos();

drop trigger if exists trg_cert_no on certificates;
create trigger trg_cert_no before insert on certificates
for each row execute function set_doc_nos();

-- 10) Row Level Security (RLS) & policies
alter table profiles enable row level security;
create policy "read_own_profile" on profiles
  for select using (auth.uid() = id);
create policy "update_own_profile" on profiles
  for update using (auth.uid() = id);

alter table memberships enable row level security;
create policy "insert_anon" on memberships
  for insert with check (true);
create policy "read_own_membership" on memberships
  for select using (user_id = auth.uid());

alter table certificates enable row level security;
create policy "read_cert_own" on certificates
  for select using (
    exists(select 1 from memberships m where m.id = certificates.membership_id and m.user_id = auth.uid())
  );

alter table id_cards enable row level security;
create policy "read_id_own" on id_cards
  for select using (
    exists(select 1 from memberships m where m.id = id_cards.membership_id and m.user_id = auth.uid())
  );

alter table events enable row level security;
create policy "public_read" on events
  for select using (is_published);

alter table news enable row level security;
create policy "public_read" on news
  for select using (is_published);

alter table partners enable row level security;
create policy "public_read" on partners
  for select using (true);

alter table resources enable row level security;
create policy "public_read" on resources
  for select using (true);

alter table posts enable row level security;
create policy "public_read" on posts
  for select using (published_at is not null);

alter table donations enable row level security;
create policy "insert_anon" on donations
  for insert with check (true);

-- End of base schema
