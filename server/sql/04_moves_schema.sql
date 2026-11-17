-- Tabel move dan relasinya ke roster. Jalankan di Supabase SQL Editor.
-- Datanya diisi oleh script (npm run seed:moves), bukan lewat SQL.

create table if not exists moves (
  id integer primary key,          -- sama dengan id move di PokeAPI
  name text not null,
  type text not null,              -- contoh: 'Fire'
  category text not null check (category in ('physical', 'special', 'status')),
  power integer,                   -- null untuk move status / power variabel
  accuracy integer,                -- null jika tidak pernah meleset
  pp integer
);

create table if not exists roster_moves (
  roster_id uuid not null references rosters(id) on delete cascade,
  move_id integer not null references moves(id) on delete cascade,
  primary key (roster_id, move_id)
);

create index if not exists roster_moves_move_idx on roster_moves(move_id);

alter table moves enable row level security;
alter table roster_moves enable row level security;
