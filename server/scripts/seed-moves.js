// Isi tabel moves dan roster_moves dari ../data/moves.json.
// Jalankan setelah sql/04_moves_schema.sql: npm run seed:moves
// Aman diulang: memakai upsert, dan roster_moves dibuat ulang per roster.
import { readFileSync } from 'node:fs'
import { supabase } from '../supabase.js'

const data = JSON.parse(readFileSync(new URL('../data/moves.json', import.meta.url)))

const { data: rosters, error } = await supabase.from('rosters').select('id, seq').order('seq')
if (error) throw error
if (rosters.length !== data.roster.length) {
  throw new Error(`jumlah roster beda: db ${rosters.length}, data ${data.roster.length}`)
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

const moveRows = data.moves.map(([id, name, type, category, power, accuracy, pp]) => ({
  id, name, type, category, power, accuracy, pp,
}))
for (const part of chunk(moveRows, 200)) {
  const { error } = await supabase.from('moves').upsert(part)
  if (error) throw error
}
console.log('moves:', moveRows.length)

const pairs = rosters.flatMap((r) =>
  data.roster[r.seq - 1].map((move_id) => ({ roster_id: r.id, move_id })),
)
const { error: delErr } = await supabase
  .from('roster_moves')
  .delete()
  .in('roster_id', rosters.map((r) => r.id))
if (delErr) throw delErr
for (const part of chunk(pairs, 1000)) {
  const { error } = await supabase.from('roster_moves').insert(part)
  if (error) throw error
}
console.log('roster_moves:', pairs.length)
