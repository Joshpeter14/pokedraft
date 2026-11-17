import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import PokeImage from './PokeImage'
import { TYPE_COLORS } from './TypeBadges'

const TYPES = Object.keys(TYPE_COLORS)

// Pilih Pokémon dengan menjelajah grid gambar, supaya bisa dikenali lewat tampilan
// tanpa harus tahu namanya. Bisa dipersempit dengan pencarian dan filter tipe.
export default function PokemonPicker({ rosters, selected, max, onChange }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const byId = useMemo(() => new Map(rosters.map((r) => [r.id, r])), [rosters])
  const full = selected.length >= max

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase().replace('#', '')
    return rosters.filter((r) => {
      if (type && !String(r.type ?? '').split('/').includes(type)) return false
      if (!q) return true
      return r.name.toLowerCase().includes(q) || String(r.dex_number).replace('#', '').includes(q)
    })
  }, [rosters, query, type])

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id))
    else if (!full) onChange([...selected, id])
  }

  return (
    <div>
      {/* Slot terpilih tetap terlihat saat menggulir grid */}
      <div className="sticky top-14 z-30 -mx-4 border-b border-line bg-surface px-4 py-3">
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: max }, (_, i) => {
            const r = byId.get(selected[i])
            return r ? (
              <button
                key={r.id}
                type="button"
                onClick={() => toggle(r.id)}
                aria-label={`Hapus ${r.name}`}
                className="relative aspect-square rounded-lg border border-accent bg-raised"
              >
                <PokeImage src={r.image} alt={r.name} className="h-full w-full p-1" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bg text-muted ring-1 ring-line-strong">
                  <X size={12} strokeWidth={2} />
                </span>
              </button>
            ) : (
              <div
                key={`empty-${i}`}
                className="num flex aspect-square items-center justify-center rounded-lg border border-dashed border-line-strong text-xs text-muted"
              >
                {String(i + 1).padStart(2, '0')}
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          {full ? 'Tim lengkap, ketuk slot untuk menghapus' : `Ketuk gambar untuk memilih (${selected.length}/${max})`}
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari nama atau dex"
        aria-label="Cari Pokémon lawan"
        className="field mt-4"
      />

      <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter tipe">
        <button
          type="button"
          onClick={() => setType('')}
          aria-pressed={!type}
          className={`h-8 shrink-0 rounded-md px-3 text-xs font-medium transition-colors duration-150 ${
            !type ? 'bg-fg text-bg' : 'bg-raised text-fg2 hover:text-fg'
          }`}
        >
          Semua
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(type === t ? '' : t)}
            aria-pressed={type === t}
            className={`h-8 shrink-0 rounded-md px-3 text-xs font-medium transition-[box-shadow] duration-150 ${TYPE_COLORS[t]} ${
              type === t ? 'ring-1 ring-fg' : ''
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="num mt-4 text-xs text-muted">{visible.length} Pokémon</p>
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Tidak ada hasil</p>
      ) : (
        <ul className="mt-2 grid grid-cols-4 gap-2">
          {visible.map((r) => {
            const on = selected.includes(r.id)
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => toggle(r.id)}
                  disabled={!on && full}
                  aria-pressed={on}
                  aria-label={r.name}
                  className={`relative w-full rounded-lg border p-1 text-center transition-colors duration-150 disabled:opacity-30 ${
                    on ? 'border-accent bg-raised' : 'border-line bg-surface hover:bg-raised'
                  }`}
                >
                  <PokeImage src={r.image} alt="" className="mx-auto h-16 w-16" />
                  <span className="block truncate text-xs text-fg2">{r.name}</span>
                  {on && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-bg">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
