import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import PokeImage from '../components/PokeImage'
import TypeBadges, { TYPE_COLORS, typeChip } from '../components/TypeBadges'
import { FallbackBanner, Loading, NotFound } from '../components/StatusViews'
import useFetch from '../hooks/useFetch'
import { getRosterById, getRosterMoves, getRosters } from '../services/api'
import { isMega, megaBaseName, megasOf } from '../utils/roster'

const statLabels = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  sp_atk: 'Sp. Atk',
  sp_def: 'Sp. Def',
  speed: 'Speed',
}
const categoryLabel = { physical: 'Fisik', special: 'Spesial', status: 'Status' }
const PREVIEW = 12

// Deskripsi bawaan seed hanya kalimat templat, jadi tidak ditampilkan.
const isTemplateText = (s) => /tersedia di Pokémon Champions\.?$/.test(s ?? '')

function Section({ title, aside, children }) {
  return (
    <section className="card mt-4 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-medium">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

function StatBar({ label, value, top }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-fg2">{label}</span>
      <span className="num w-8 shrink-0 text-right">{value}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-raised">
        <div
          className={`h-full rounded-full ${top ? 'bg-accent' : 'bg-fg2'}`}
          style={{ width: `${Math.min(100, (value / 160) * 100)}%` }}
        />
      </div>
    </div>
  )
}

function MoveList({ rosterId }) {
  const { data: moves, loading } = useFetch(() => getRosterMoves(rosterId), [rosterId])
  const [all, setAll] = useState(false)
  const shown = all ? moves : moves?.slice(0, PREVIEW)

  return (
    <Section title="Move Champions" aside={moves?.length ? <span className="num text-xs text-muted">{moves.length}</span> : null}>
      {loading ? (
        <p className="text-sm text-muted">Memuat</p>
      ) : !moves?.length ? (
        <p className="text-sm text-muted">Data move belum tersedia untuk Pokémon ini</p>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {shown.map((m) => (
              <li key={m.id} className="flex h-10 items-center gap-3">
                <span className="min-w-0 flex-1 truncate">{m.name}</span>
                <span className={`${typeChip} ${TYPE_COLORS[m.type] ?? 'bg-raised text-fg2'}`}>{m.type}</span>
                <span className="w-14 text-right text-xs text-muted">{categoryLabel[m.category]}</span>
                <span className="num w-8 text-right text-fg2">{m.power ?? '–'}</span>
              </li>
            ))}
          </ul>
          {moves.length > PREVIEW && (
            <button onClick={() => setAll((v) => !v)} className="btn btn-secondary mt-3 w-full">
              {all ? 'Sembunyikan' : `Tampilkan semua (${moves.length})`}
            </button>
          )}
        </>
      )}
    </Section>
  )
}

export default function RosterDetail() {
  const { id } = useParams()
  const { data: r, loading, isFallback } = useFetch(() => getRosterById(id), [id])
  const { data: allRosters } = useFetch(getRosters)
  const megas = megasOf(r, allRosters ?? [])
  const baseOfMega =
    r && isMega(r) ? (allRosters ?? []).find((x) => !isMega(x) && x.name === megaBaseName(r.name)) : null
  const stats = r?.stats ?? {}
  const statEntries = Object.entries(statLabels).filter(([k]) => stats[k] != null)
  const total = statEntries.reduce((s, [k]) => s + Number(stats[k]), 0)
  const top = Math.max(...statEntries.map(([k]) => Number(stats[k])), 0)
  const abilities = Array.isArray(r?.abilities) ? r.abilities : []

  return (
    <>
      <PageHeader title="Detail Roster" back />
      <main className="p-4">
        {loading ? (
          <Loading />
        ) : !r ? (
          <NotFound message="Karakter tidak ditemukan" />
        ) : (
          <>
            {isFallback && <FallbackBanner />}

            {/* Satu momen kaya per layar: artwork di atas permukaan yang tenang */}
            <div className="card p-4 text-center">
              <div className="rounded-lg bg-raised py-4">
                <PokeImage src={r.image} alt={r.name} className="mx-auto h-48 w-48" />
              </div>
              <p className="num mt-4 text-xs text-muted">{r.dex_number}</p>
              <h2 className="text-3xl leading-tight font-medium">{r.name}</h2>
              <div className="mt-2 flex justify-center">
                <TypeBadges type={r.type} />
              </div>
              {baseOfMega && (
                <Link
                  to={`/roster/${baseOfMega.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-accent-text"
                >
                  Wujud Mega dari {baseOfMega.name}
                  <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              )}
            </div>

            {r.description && !isTemplateText(r.description) && (
              <Section title="Deskripsi">
                <p className="leading-relaxed text-fg2">{r.description}</p>
              </Section>
            )}

            <Section title="Ability">
              {abilities.length ? (
                <ul className="flex flex-wrap gap-2">
                  {abilities.map((a) => (
                    <li key={a} className="rounded-md bg-raised px-3 py-1 text-sm">
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Data ability belum tersedia</p>
              )}
            </Section>

            <Section
              title="Base stats"
              aside={statEntries.length ? <span className="num text-xs text-muted">Total {total}</span> : null}
            >
              {statEntries.length ? (
                <div className="space-y-3 text-sm">
                  {statEntries.map(([k, label]) => (
                    <StatBar key={k} label={label} value={stats[k]} top={Number(stats[k]) === top} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Data base stats belum tersedia</p>
              )}
            </Section>

            {megas.length > 0 && (
              <Section title="Mega Evolution">
                <ul className="space-y-2">
                  {megas.map((m) => (
                    <li key={m.id}>
                      <Link
                        to={`/roster/${m.id}`}
                        className="flex items-center gap-3 rounded-lg bg-raised p-2 transition-colors duration-150 hover:bg-[#2b2b2e]"
                      >
                        <PokeImage src={m.image} alt="" className="h-16 w-16 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="truncate font-medium">{m.name}</p>
                          <TypeBadges type={m.type} />
                          {m.abilities?.length > 0 && (
                            <p className="truncate text-xs text-muted">{m.abilities.join(', ')}</p>
                          )}
                        </div>
                        <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <MoveList rosterId={r.id} />
          </>
        )}
      </main>
    </>
  )
}
