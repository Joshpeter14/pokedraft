-- Jalankan di Supabase: SQL Editor -> New query -> Run

create table if not exists rosters (
  id uuid primary key default gen_random_uuid(),
  seq integer not null,                 -- urutan tampil (sama seperti daftar game)
  dex_number text not null,             -- contoh: '#0006'
  name text not null,                   -- contoh: 'Mega Charizard X'
  type text,                            -- contoh: 'Fire/Dragon' (opsional)
  role text,
  description text,
  image text,
  abilities text[] not null default '{}',
  stats jsonb                           -- {hp, attack, defense, sp_atk, sp_def, speed}
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  strategy text,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  roster_id uuid not null references rosters(id) on delete restrict,
  slot integer not null check (slot between 1 and 6),
  nature text,
  ability text,
  item text,
  moves text[] not null default '{}' check (cardinality(moves) <= 4),
  unique (team_id, slot),
  unique (team_id, roster_id)
);

create index if not exists team_members_team_idx on team_members(team_id);
create index if not exists rosters_seq_idx on rosters(seq);

-- Backend memakai service_role (melewati RLS). Aktifkan RLS supaya anon key
-- tidak bisa membaca/menulis langsung ke tabel dari luar.
alter table rosters enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
