// Warna tipe membawa makna (bukan dekorasi), jadi dipertahankan, dibuat tenang untuk tema gelap.
export const TYPE_COLORS = {
  Normal: 'bg-zinc-500/20 text-zinc-300',
  Fire: 'bg-orange-500/15 text-orange-300',
  Water: 'bg-blue-500/15 text-blue-300',
  Electric: 'bg-yellow-500/15 text-yellow-300',
  Grass: 'bg-green-500/15 text-green-300',
  Ice: 'bg-cyan-500/15 text-cyan-300',
  Fighting: 'bg-red-500/15 text-red-300',
  Poison: 'bg-purple-500/15 text-purple-300',
  Ground: 'bg-amber-600/20 text-amber-300',
  Flying: 'bg-sky-500/15 text-sky-300',
  Psychic: 'bg-pink-500/15 text-pink-300',
  Bug: 'bg-lime-500/15 text-lime-300',
  Rock: 'bg-stone-500/20 text-stone-300',
  Ghost: 'bg-indigo-500/20 text-indigo-300',
  Dragon: 'bg-violet-500/20 text-violet-300',
  Dark: 'bg-neutral-500/25 text-neutral-300',
  Steel: 'bg-slate-500/20 text-slate-300',
  Fairy: 'bg-fuchsia-500/15 text-fuchsia-300',
}

export const typeChip = 'inline-flex h-5 items-center rounded-md px-2 text-xs font-medium'

export default function TypeBadges({ type }) {
  // Backend mengirim null untuk tipe yang belum diisi.
  if (!type) return null
  return (
    <div className="flex flex-wrap gap-1">
      {String(type)
        .split('/')
        .filter(Boolean)
        .map((t) => (
          <span key={t} className={`${typeChip} ${TYPE_COLORS[t.trim()] ?? 'bg-raised text-fg2'}`}>
            {t.trim()}
          </span>
        ))}
    </div>
  )
}
