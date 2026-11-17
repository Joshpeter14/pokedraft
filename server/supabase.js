import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_KEY wajib diisi (file .env, atau Environment Variables di Vercel)')
}

// Ambil origin saja, supaya URL yang tertempel dengan path (mis. /rest/v1/) tetap valid.
export const supabase = createClient(new URL(SUPABASE_URL).origin, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})
