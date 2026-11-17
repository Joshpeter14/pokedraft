import { Router } from 'express'
import { supabase } from '../supabase.js'

const router = Router()

const INVALID_UUID = '22P02'

// GET /api/rosters
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('rosters').select('*').order('seq')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/rosters/:id/moves  -> daftar move yang bisa dipelajari (Champions), urut nama
router.get('/:id/moves', async (req, res) => {
  const { data, error } = await supabase
    .from('roster_moves')
    .select('move:moves(id, name, type, category, power, accuracy, pp)')
    .eq('roster_id', req.params.id)

  if (error?.code === INVALID_UUID) return res.status(404).json({ error: 'Roster tidak ditemukan' })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data.map((row) => row.move).sort((a, b) => a.name.localeCompare(b.name)))
})

// GET /api/rosters/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('rosters')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle()

  if (error?.code === INVALID_UUID || (!error && !data)) {
    return res.status(404).json({ error: 'Roster tidak ditemukan' })
  }
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
