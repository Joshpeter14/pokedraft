const TEAM_SIZE = 6
const MAX_MOVES = 4

const str = (v) => (typeof v === 'string' ? v.trim() : '')

// Validasi body POST/PUT tim. Return { error } atau { value: { team, members } }.
export function validateTeam(body) {
  if (!body || typeof body !== 'object') return { error: 'Body harus berupa JSON' }

  const name = str(body.name)
  if (!name) return { error: 'name wajib diisi' }
  if (name.length > 100) return { error: 'name maksimal 100 karakter' }

  const { members } = body
  if (!Array.isArray(members) || members.length < 1 || members.length > TEAM_SIZE) {
    return { error: `members harus berisi 1-${TEAM_SIZE} Pokémon` }
  }

  const ids = new Set()
  const cleaned = []
  for (const [i, m] of members.entries()) {
    const roster_id = str(m?.roster_id)
    if (!roster_id) return { error: `members[${i}].roster_id wajib diisi` }
    if (ids.has(roster_id)) return { error: 'Pokémon tidak boleh sama dalam satu tim' }
    ids.add(roster_id)

    const moves = Array.isArray(m.moves) ? m.moves.map(str).filter(Boolean) : []
    if (moves.length > MAX_MOVES) return { error: `members[${i}].moves maksimal ${MAX_MOVES}` }

    cleaned.push({
      roster_id,
      slot: i + 1,
      nature: str(m.nature) || null,
      ability: str(m.ability) || null,
      item: str(m.item) || null,
      moves,
    })
  }

  return {
    value: {
      team: { name, description: str(body.description) || null, strategy: str(body.strategy) || null },
      members: cleaned,
    },
  }
}
