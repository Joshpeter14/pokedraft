// Helper untuk entri roster. Wujud Mega disimpan sebagai entri sendiri di database,
// tetapi di UI hanya ditampilkan sebagai bagian dari Pokémon dasarnya.

export const isMega = (r) => /^Mega /.test(r?.name ?? '')

// "Mega Charizard X" -> "Charizard"
export const megaBaseName = (name) => name.replace(/^Mega /, '').replace(/ [XYZ]$/, '')

// Daftar yang dipakai untuk memilih/menjelajah Pokémon (tanpa Mega).
export const withoutMega = (rosters = []) => rosters.filter((r) => !isMega(r))

// Wujud Mega milik `r`. Entri kembar (wujud regional) tidak punya Mega: hanya entri pertama.
export function megasOf(r, rosters = []) {
  if (!r || isMega(r)) return []
  const first = rosters.find((x) => !isMega(x) && x.name === r.name)
  if (first && first.id !== r.id) return []
  return rosters.filter((x) => isMega(x) && megaBaseName(x.name) === r.name)
}
