import { supabase } from '../config/supabaseClient.js'

export const MoveModel = {
  async getAll() {
    const { data, error } = await supabase.from('moves').select('*').order('name')
    if (error) throw error
    return data
  },
}
