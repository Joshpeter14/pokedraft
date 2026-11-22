import express from 'express'
import cors from 'cors'
import rosterRoutes from './routes/rosterRoutes.js'
import teamRoutes from './routes/teamRoutes.js'
import moveRoutes from './routes/moveRoutes.js'

const app = express()

// CORS_ORIGIN: daftar origin dipisah koma. Kosong = izinkan semua (hanya untuk development).
const origins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
app.use(cors({ origin: origins.length ? origins : true }))
app.use(express.json({ limit: '100kb' }))

app.get('/', (req, res) => res.json({ status: 'ok', name: 'PokeDraft API' }))
app.use('/api/rosters', rosterRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/moves', moveRoutes)

app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }))

// JSON rusak / error tak terduga
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON tidak valid' })
  console.error(err)
  res.status(500).json({ error: 'Terjadi kesalahan server' })
})

export default app
