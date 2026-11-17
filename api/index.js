// Vercel Serverless Function: seluruh /api/* ditangani oleh aplikasi Express yang sama
// dengan yang dipakai saat pengembangan lokal (lihat rewrites di vercel.json).
import app from '../server/app.js'

export default app
