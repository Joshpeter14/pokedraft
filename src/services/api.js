import axios from 'axios'
import { dummyRosters, dummyTeams } from './dummyData'

const api = axios.create({
  // Kosong = alamat yang sama dengan halaman (Vercel: /api/* ditangani function; dev: proxy Vite ke port 3000).
  // Isi VITE_API_URL hanya jika API di-host di alamat lain.
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 8000,
  headers: { Accept: 'application/json' },
})

// Backend bisa membungkus data: [..] atau { data: [..] }.
const unwrap = (res) => res.data?.data ?? res.data

// Jalankan request; jika gagal (backend belum aktif) pakai fallback dummy.
async function withFallback(request, fallback) {
  try {
    return { data: unwrap(await request()), isFallback: false }
  } catch (err) {
    console.warn('[api] request gagal, memakai data dummy:', err.message)
    return { data: await fallback(), isFallback: true }
  }
}

// Tim buatan user yang gagal dikirim ke server disimpan lokal supaya UI tetap berfungsi.
const LOCAL_KEY = 'pokedraft_local_teams'
const readLocalTeams = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? []
  } catch {
    return []
  }
}
const writeLocalTeams = (teams) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(teams))
  } catch {
    // storage penuh/diblokir: abaikan
  }
}

export const getRosters = () =>
  withFallback(() => api.get('/api/rosters'), () => dummyRosters)

export const getRosterById = (id) =>
  withFallback(
    () => api.get(`/api/rosters/${id}`),
    () => dummyRosters.find((r) => r.id === id) ?? null,
  )

// Move yang bisa dipelajari sebuah roster (Champions). Array kosong = datanya belum ada.
export const getRosterMoves = (rosterId) =>
  withFallback(
    () => api.get(`/api/rosters/${rosterId}/moves`),
    async () => {
      const idx = /^r-(\d+)$/.exec(rosterId)?.[1]
      if (!idx) return []
      const { moves, roster } = await import('./moveData') // dimuat hanya saat fallback
      const byId = new Map(moves.map((m) => [m[0], m]))
      return (roster[Number(idx) - 1] ?? [])
        .map((id) => byId.get(id))
        .map(([id, name, type, category, power, accuracy, pp]) => ({ id, name, type, category, power, accuracy, pp }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },
  )

// Semua move (nama, tipe, kategori, power, ...).
export const getMoves = () =>
  withFallback(
    () => api.get('/api/moves'),
    async () => {
      const { moves } = await import('./moveData')
      return moves.map(([id, name, type, category, power, accuracy, pp]) => ({
        id, name, type, category, power, accuracy, pp,
      }))
    },
  )

export const getTeams = () =>
  withFallback(() => api.get('/api/teams'), () => [...readLocalTeams(), ...dummyTeams])

export const getTeamById = (id) =>
  withFallback(
    () => api.get(`/api/teams/${id}`),
    () => [...readLocalTeams(), ...dummyTeams].find((t) => t.id === id) ?? null,
  )

// payload: { name, description?, strategy?, members: [{ roster_id, nature, ability, item, moves[] }] }
export const createTeam = async (payload) => {
  try {
    const res = await api.post('/api/teams', payload)
    return { data: unwrap(res), isFallback: false }
  } catch (err) {
    console.warn('[api] POST /api/teams gagal, disimpan lokal:', err.message)
    const members = payload.members.map((m) => {
      const r = dummyRosters.find((x) => x.id === m.roster_id)
      return { ...m, name: r?.name, dex_number: r?.dex_number, image: r?.image }
    })
    const team = { ...payload, members, id: `local-${Date.now()}` }
    writeLocalTeams([team, ...readLocalTeams()])
    return { data: team, isFallback: true }
  }
}

const withRosterInfo = (members) =>
  members.map((m) => {
    const r = dummyRosters.find((x) => x.id === m.roster_id)
    return r ? { ...m, name: r.name, dex_number: r.dex_number, image: r.image } : m
  })

// Ubah tim. Tim lokal (hasil POST saat server mati) diubah di penyimpanan lokal;
// tim milik server tidak bisa disimpan saat server mati, jadi error dilempar ke pemanggil.
export const updateTeam = async (id, payload) => {
  if (String(id).startsWith('local-')) {
    const teams = readLocalTeams()
    const updated = { ...payload, members: withRosterInfo(payload.members), id }
    writeLocalTeams(teams.map((t) => (t.id === id ? updated : t)))
    return { data: updated, isFallback: true }
  }
  const res = await api.put(`/api/teams/${id}`, payload)
  return { data: unwrap(res), isFallback: false }
}

// Hapus tim. Tim lokal dihapus dari penyimpanan lokal; tim milik server butuh server aktif (error dilempar).
export const deleteTeam = async (id) => {
  if (String(id).startsWith('local-')) {
    writeLocalTeams(readLocalTeams().filter((t) => t.id !== id))
    return
  }
  await api.delete(`/api/teams/${id}`)
}

export default api
