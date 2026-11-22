import { supabase } from '../config/supabaseClient.js'

const INVALID_UUID = '22P02'

// Tim beserta anggota (team_members) dan ringkasan roster tiap anggota, dalam satu query.
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

const getRaw = async (id) => {
  const { data, error } = await supabase.from('teams').select(SELECT).eq('id', id).maybeSingle()
  if (error?.code === INVALID_UUID) return null
  if (error) throw error
  return data
}

export const TeamModel = {
  async getAll() {
    const { data, error } = await supabase
      .from('teams')
      .select(SELECT)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(shape)
  },

  // null jika tidak ditemukan atau id bukan UUID
  async getById(id) {
    const data = await getRaw(id)
    return data ? shape(data) : null
  },

  // team: { name, description, strategy }, members: [{ roster_id, slot, nature, ability, item, moves }]
  async create(team, members) {
    const { data: created, error } = await supabase.from('teams').insert(team).select('id').single()
    if (error) throw error

    const { error: memberErr } = await supabase
      .from('team_members')
      .insert(members.map((m) => ({ ...m, team_id: created.id })))
    if (memberErr) {
      // batalkan tim agar tidak ada tim tanpa anggota
      await supabase.from('teams').delete().eq('id', created.id)
      throw memberErr
    }
    return shape(await getRaw(created.id))
  },

  // Ganti seluruh isi tim. null jika tim tidak ditemukan.
  async update(id, team, members) {
    const existing = await getRaw(id)
    if (!existing) return null

    // Simpan anggota lama supaya bisa dipulihkan jika penyimpanan yang baru gagal.
    const oldMembers = existing.team_members.map(({ roster, ...m }) => ({ ...m, roster_id: roster.id }))

    const { error: teamErr } = await supabase.from('teams').update(team).eq('id', id)
    if (teamErr) throw teamErr

    const { error: delErr } = await supabase.from('team_members').delete().eq('team_id', id)
    if (delErr) throw delErr

    const { error: insErr } = await supabase
      .from('team_members')
      .insert(members.map((m) => ({ ...m, team_id: id })))
    if (insErr) {
      await supabase.from('team_members').insert(oldMembers.map((m) => ({ ...m, team_id: id })))
      throw insErr
    }
    return shape(await getRaw(id))
  },

  // true jika terhapus, false jika tidak ditemukan. team_members ikut terhapus (on delete cascade).
  async remove(id) {
    const { data, error } = await supabase.from('teams').delete().eq('id', id).select('id')
    if (error?.code === INVALID_UUID) return false
    if (error) throw error
    return data.length > 0
  },
}
