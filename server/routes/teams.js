import { Router } from 'express'
import { supabase } from '../supabase.js'

const router = Router()

const INVALID_UUID = '22P02'
const TEAM_SIZE = 6
const MAX_MOVES = 4

const SELECT =
  '*, team_members(slot, nature, ability, item, moves, roster:rosters(id, name, dex_number, image))'

// Ubah hasil join menjadi { ..., members: [{ roster_id, name, dex_number, image, nature, ability, item, moves }] }
const shape = ({ team_members, ...team }) => ({
  ...team,
  members: (team_members ?? [])
    .sort((a, b) => a.slot - b.slot)
    .map(({ slot, roster, ...build }) => ({
      roster_id: roster?.id,
      name: roster?.name,
      dex_number: roster?.dex_number,
      image: roster?.image,
      ...build,
    })),
})

const str = (v) => (typeof v === 'string' ? v.trim() : '')

// Validasi body POST. Return { error } atau { value }.
function validateTeam(body) {
  if (!body || typeof body !== 'object') return { error: 'Body harus berupa JSON' }

  const name = str(body.name)
  if (!name) return { error: 'name wajib diisi' }
  if (name.length > 100) return { error: 'name maksimal 100 karakter' }

  const { members } = body
  if (!Array.isArray(members) || members.length < 1 || members.length > TEAM_SIZE) {
    return { error: `members harus berisi 1-${TEAM_SIZE} Pokémon` }
  }

  const ids = new Set()
  const cleaned = []
  for (const [i, m] of members.entries()) {
    const roster_id = str(m?.roster_id)
    if (!roster_id) return { error: `members[${i}].roster_id wajib diisi` }
    if (ids.has(roster_id)) return { error: 'Pokémon tidak boleh sama dalam satu tim' }
    ids.add(roster_id)

    const moves = Array.isArray(m.moves) ? m.moves.map(str).filter(Boolean) : []
    if (moves.length > MAX_MOVES) return { error: `members[${i}].moves maksimal ${MAX_MOVES}` }

    cleaned.push({
      roster_id,
      slot: i + 1,
      nature: str(m.nature) || null,
      ability: str(m.ability) || null,
      item: str(m.item) || null,
      moves,
    })
  }

  return {
    value: {
      team: { name, description: str(body.description) || null, strategy: str(body.strategy) || null },
      members: cleaned,
    },
  }
}

// GET /api/teams
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('teams')
    .select(SELECT)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data.map(shape))
})

// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('teams')
    .select(SELECT)
    .eq('id', req.params.id)
    .maybeSingle()

  if (error?.code === INVALID_UUID || (!error && !data)) {
    return res.status(404).json({ error: 'Tim tidak ditemukan' })
  }
  if (error) return res.status(500).json({ error: error.message })
  res.json(shape(data))
})

// PUT /api/teams/:id  -> ganti seluruh isi tim (nama, strategi, dan semua anggota beserta build-nya)
router.put('/:id', async (req, res) => {
  const { error: invalid, value } = validateTeam(req.body)
  if (invalid) return res.status(400).json({ error: invalid })

  const id = req.params.id
  const { data: existing, error: findErr } = await supabase
    .from('teams')
    .select('id')
    .eq('id', id)
    .maybeSingle()
  if (findErr?.code === INVALID_UUID || (!findErr && !existing)) {
    return res.status(404).json({ error: 'Tim tidak ditemukan' })
  }
  if (findErr) return res.status(500).json({ error: findErr.message })

  // Simpan anggota lama supaya bisa dipulihkan jika penyimpanan yang baru gagal.
  const { data: oldMembers, error: oldErr } = await supabase
    .from('team_members')
    .select('roster_id, slot, nature, ability, item, moves')
    .eq('team_id', id)
  if (oldErr) return res.status(500).json({ error: oldErr.message })

  const { error: teamErr } = await supabase.from('teams').update(value.team).eq('id', id)
  if (teamErr) return res.status(500).json({ error: teamErr.message })

  const { error: delErr } = await supabase.from('team_members').delete().eq('team_id', id)
  if (delErr) return res.status(500).json({ error: delErr.message })

  const { error: insErr } = await supabase
    .from('team_members')
    .insert(value.members.map((m) => ({ ...m, team_id: id })))
  if (insErr) {
    await supabase.from('team_members').insert(oldMembers.map((m) => ({ ...m, team_id: id })))
    const bad = insErr.code === '23503' || insErr.code === INVALID_UUID
    return res
      .status(bad ? 400 : 500)
      .json({ error: bad ? 'roster_id tidak valid' : insErr.message })
  }

  const { data: updated, error: readErr } = await supabase
    .from('teams')
    .select(SELECT)
    .eq('id', id)
    .single()
  if (readErr) return res.status(500).json({ error: readErr.message })
  res.json(shape(updated))
})

// DELETE /api/teams/:id  -> hapus tim; team_members ikut terhapus (on delete cascade)
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase.from('teams').delete().eq('id', req.params.id).select('id')
  if (error?.code === INVALID_UUID || (!error && !data.length)) {
    return res.status(404).json({ error: 'Tim tidak ditemukan' })
  }
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
})

// POST /api/teams
router.post('/', async (req, res) => {
  const { error: invalid, value } = validateTeam(req.body)
  if (invalid) return res.status(400).json({ error: invalid })

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert(value.team)
    .select('id')
    .single()
  if (teamErr) return res.status(500).json({ error: teamErr.message })

  const { error: memberErr } = await supabase
    .from('team_members')
    .insert(value.members.map((m) => ({ ...m, team_id: team.id })))

  if (memberErr) {
    // batalkan tim agar tidak ada tim tanpa anggota
    await supabase.from('teams').delete().eq('id', team.id)
    // 23503 = roster_id tidak ada, 22P02 = bukan uuid
    const bad = memberErr.code === '23503' || memberErr.code === INVALID_UUID
    return res
      .status(bad ? 400 : 500)
      .json({ error: bad ? 'roster_id tidak valid' : memberErr.message })
  }

  const { data: created, error: readErr } = await supabase
    .from('teams')
    .select(SELECT)
    .eq('id', team.id)
    .single()
  if (readErr) return res.status(500).json({ error: readErr.message })

  res.status(201).json(shape(created))
})

export default router
