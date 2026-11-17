import { effectiveness, parseTypes } from './typeChart'

// Analisis berbasis tipe, move (jika sudah diisi), dan kecepatan dasar.
// Tidak memperhitungkan item, ability, weather, atau efek move khusus.

const BASE = 90 // indeks damage netral acuan -> skor 0 (mis. move power 60 dengan STAB)
const STAB = 1.5
const ASSUMED_POWER = 80 // move STAB power 80 diasumsikan saat move tidak diketahui
const FALLBACK_POWER = 60 // power move damaging yang power-nya variabel (null)

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
const logIdx = (idx) => (idx <= 0 ? -3 : clamp(Math.log2(idx / BASE), -3, 3))

// Serangan STAB terbaik dari `attackerTypes` ke `defTypes`.
const bestEff = (attackerTypes, defTypes) =>
  attackerTypes.length ? Math.max(...attackerTypes.map((t) => effectiveness(t, defTypes))) : 1

const speedOf = (p) => (p.stats?.speed != null ? Number(p.stats.speed) : null)

const isDamaging = (m) => m.category !== 'status'

// Move damaging yang sudah diisi pemain (dengan data tipe/power).
export const damagingMoves = (p) => (p.moveInfo ?? []).filter(isDamaging)

// Kekuatan serangan `a` terhadap `d`: pakai move yang dimiliki jika ada, jika tidak asumsi STAB.
function offense(a, d) {
  const at = parseTypes(a.type)
  const dt = parseTypes(d.type)
  const moves = damagingMoves(a)

  if (moves.length) {
    let best = null
    for (const m of moves) {
      const mult = effectiveness(String(m.type).toLowerCase(), dt)
      const idx = mult * (m.power ?? FALLBACK_POWER) * (at.includes(String(m.type).toLowerCase()) ? STAB : 1)
      if (!best || idx > best.idx) best = { idx, mult, move: m }
    }
    return { value: logIdx(best.idx), move: best.move, mult: best.mult, fromMoves: true }
  }
  const mult = bestEff(at, dt)
  return { value: logIdx(mult * ASSUMED_POWER * STAB), move: null, mult, fromMoves: false }
}

// Ancaman dari `d` ke `a`: lawan tidak diketahui movenya, jadi asumsi STAB terbaik.
const threat = (d, a) =>
  logIdx(bestEff(parseTypes(d.type), parseTypes(a.type)) * ASSUMED_POWER * STAB)

// Detail `a` melawan `d`: score >0 = a diuntungkan (kira-kira rentang -6..+6).
export function matchup(a, d) {
  const off = offense(a, d)
  const sa = speedOf(a)
  const sd = speedOf(d)
  const speed = sa != null && sd != null && sa !== sd ? (sa > sd ? 0.5 : -0.5) : 0
  return { score: off.value - threat(d, a) + speed, move: off.move, mult: off.mult, fromMoves: off.fromMoves }
}

export const matchupScore = (a, d) => matchup(a, d).score

// Selisih kecepatan saja (±0,5) sengaja tidak cukup untuk dianggap unggul/lemah.
export const GOOD = 0.75
export const BAD = -0.75

export const RATINGS = [
  { min: 1.5, label: 'Sangat unggul', cell: 'bg-pos text-[#0b1f15]', text: 'text-pos' },
  { min: GOOD, label: 'Unggul', cell: 'bg-pos/20 text-pos', text: 'text-pos' },
  { min: BAD, label: 'Seimbang', cell: 'bg-raised text-muted', text: 'text-fg2' },
  { min: -1.5, label: 'Kurang', cell: 'bg-neg/20 text-[#f08a8d]', text: 'text-[#f08a8d]' },
  { min: -Infinity, label: 'Berbahaya', cell: 'bg-neg text-[#1a0809]', text: 'text-[#f08a8d]' },
]
export const ratingOf = (score) => RATINGS.find((r) => score >= r.min)

function combinations(n, k) {
  const out = []
  const walk = (start, acc) => {
    if (acc.length === k) return out.push(acc)
    for (let i = start; i < n; i++) walk(i + 1, [...acc, i])
  }
  walk(0, [])
  return out
}

// Untuk tiap lawan: anggota trio yang paling cocok melawannya.
export function evaluateTrio(matrix, trio, enemyCount) {
  return Array.from({ length: enemyCount }, (_, j) => {
    let best = trio[0]
    for (const i of trio) if (matrix[i][j] > matrix[best][j]) best = i
    return { enemy: j, answer: best, score: matrix[best][j] }
  })
}

/**
 * mine, enemy: array Pokémon { type, stats, moveInfo? }.
 * Trio terbaik = yang paling banyak punya "jawaban" bagus untuk SEMUA 6 lawan,
 * karena kita tidak tahu 3 mana yang akan dipilih lawan.
 */
export function analyze(mine, enemy) {
  const details = mine.map((a) => enemy.map((d) => matchup(a, d)))
  const matrix = details.map((row) => row.map((x) => x.score))

  const perMine = matrix.map((row) => {
    const order = row.map((s, j) => ({ j, s })).sort((x, y) => y.s - x.s)
    return {
      avg: row.reduce((a, b) => a + b, 0) / row.length,
      strongVs: order.filter((o) => o.s >= GOOD).slice(0, 3),
      weakVs: order.filter((o) => o.s < BAD).slice(-3).reverse(),
    }
  })

  const size = Math.min(3, mine.length)
  let bestTrio = []
  let bestValue = -Infinity
  for (const trio of combinations(mine.length, size)) {
    const coverage = evaluateTrio(matrix, trio, enemy.length).reduce((s, e) => s + e.score, 0)
    const value = coverage + 0.3 * trio.reduce((s, i) => s + perMine[i].avg, 0)
    if (value > bestValue) {
      bestValue = value
      bestTrio = trio
    }
  }

  // Seberapa mengancam tiap lawan terhadap seluruh tim kita.
  const threats = enemy
    .map((_, j) => ({ j, threat: matrix.reduce((s, row) => s - row[j], 0) / matrix.length }))
    .sort((a, b) => b.threat - a.threat)

  return { matrix, details, perMine, bestTrio, threats }
}
