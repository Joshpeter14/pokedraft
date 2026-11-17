import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import PokeImage from '../components/PokeImage'
import TypeBadges from '../components/TypeBadges'
import { FallbackBanner, Loading, NotFound } from '../components/StatusViews'
import useFetch from '../hooks/useFetch'
import { getRosters } from '../services/api'
import { withoutMega } from '../utils/roster'

const PAGE_SIZE = 40

export default function RosterList() {
  const { data, loading, isFallback } = useFetch(getRosters)
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE_SIZE)

  // Wujud Mega tidak ditampilkan di list; muncul di detail Pokémon dasarnya.
  const base = useMemo(() => (data ? withoutMega(data) : null), [data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace('#', '')
    if (!q) return base ?? []
    return (base ?? []).filter(
      (r) => r.name.toLowerCase().includes(q) || String(r.dex_number ?? '').replace('#', '').includes(q),
    )
  }, [base, query])

  return (
    <>
      <PageHeader title="Pokedex" />
      <div className="sticky top-14 z-30 border-b border-line bg-bg px-4 py-3">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setLimit(PAGE_SIZE)
          }}
          placeholder="Cari nama atau dex"
          aria-label="Cari Pokémon"
          className="field"
        />
        {base && (
          <p className="num mt-2 text-xs text-muted">
            {filtered.length} dari {base.length} Pokémon
          </p>
        )}
      </div>
      <main className="p-4">
        {loading ? (
          <Loading />
        ) : !filtered.length ? (
          <NotFound message={query ? 'Tidak ada hasil' : 'Belum ada karakter'} />
        ) : (
          <>
            {isFallback && <FallbackBanner />}
            <ul className="space-y-2">
              {filtered.slice(0, limit).map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/roster/${r.id}`}
                    className="card flex items-center gap-3 p-2 transition-colors duration-150 hover:bg-raised"
                  >
                    <PokeImage src={r.image} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-raised p-1" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="flex items-baseline gap-2">
                        <span className="num text-xs text-muted">{r.dex_number}</span>
                        <span className="truncate font-medium">{r.name}</span>
                      </p>
                      <TypeBadges type={r.type} />
                    </div>
                    <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            {limit < filtered.length && (
              <button onClick={() => setLimit((l) => l + PAGE_SIZE)} className="btn btn-secondary mt-4 w-full">
                Tampilkan lebih banyak
              </button>
            )}
          </>
        )}
      </main>
    </>
  )
}
