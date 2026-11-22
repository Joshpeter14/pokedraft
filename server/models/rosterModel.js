import { supabase } from '../config/supabaseClient.js'

const INVALID_UUID = '22P02'

export const RosterModel = {
  async getAll() {
    const { data, error } = await supabase.from('rosters').select('*').order('seq')
    if (error) throw error
    return data
  },

  // null jika tidak ditemukan atau id bukan UUID
  async getById(id) {
    const { data, error } = await supabase.from('rosters').select('*').eq('id', id).maybeSingle()
    if (error?.code === INVALID_UUID) return null
    if (error) throw error
    return data
  },

  // Move yang bisa dipelajari (Champions), urut nama. null jika id bukan UUID.
  async getMoves(id) {
    const { data, error } = await supabase
      .from('roster_moves')
      .select('move:moves(id, name, type, category, power, accuracy, pp)')
      .eq('roster_id', id)
    if (error?.code === INVALID_UUID) return null
    if (error) throw error
    return data.map((row) => row.move).sort((a, b) => a.name.localeCompare(b.name))
  },
}
