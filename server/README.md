# PokeDraft API

Struktur (mengikuti Modul 1): `config/` (klien Supabase), `models/` (akses database), `controllers/` (logika request/response), `routes/` (pemetaan URL), `utils/` (validasi).

Express + Supabase.

## Setup
1. Buat project di supabase.com. Ambil `Project URL` dan `service_role` key (Project Settings → API).
2. SQL Editor: jalankan `sql/01_schema.sql`, lalu `sql/02_seed_rosters.sql` (326 roster).
3. SQL Editor: jalankan juga `sql/04_moves_schema.sql` (tabel move).
4. Salin `.env.example` ke `.env` dan isi. `service_role` rahasia, jangan di-commit.
5. `npm install`, lalu `npm run seed:moves` (isi 496 move + movepool, aman diulang) dan `npm run dev` (port 3000).

`sql/03_update_roster_details.sql` (tipe, ability, stats) opsional: datanya sudah diisi lewat script, SQL itu hanya untuk mengulang di project lain.

## Endpoint
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/rosters` | List roster (urut seperti daftar game) |
| GET | `/api/rosters/:id` | Detail roster |
| GET | `/api/rosters/:id/moves` | Move yang bisa dipelajari (Champions), urut nama |
| GET | `/api/moves` | Semua move |
| GET | `/api/teams` | List tim beserta `members` |
| GET | `/api/teams/:id` | Detail tim |
| POST | `/api/teams` | Buat tim, balasan 201 |
| PUT | `/api/teams/:id` | Ganti seluruh isi tim (nama, strategi, anggota + build) |
| DELETE | `/api/teams/:id` | Hapus tim, balasan 204 |

Body POST:
```json
{
  "name": "Mega Offense",
  "strategy": "…",
  "members": [
    { "roster_id": "uuid", "nature": "Timid", "ability": "Drought", "item": "Leftovers", "moves": ["Protect"] }
  ]
}
```
`members` 1–6 item, `roster_id` tidak boleh kembar, `moves` maksimal 4. Error validasi: 400 `{ "error": "…" }`.

## Deploy (Render/Railway)
Build `npm install`, start `npm start`. Isi env `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, dan `CORS_ORIGIN` (domain frontend).

