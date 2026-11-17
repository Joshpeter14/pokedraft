import { Router } from 'express'
import { supabase } from '../supabase.js'

const router = Router()

// GET /api/moves -> semua move, urut nama
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('moves').select('*').order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
