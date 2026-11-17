import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import PokeImage from '../components/PokeImage'
import PokemonPicker from '../components/PokemonPicker'
import TypeBadges from '../components/TypeBadges'
import { Loading, NotFound } from '../components/StatusViews'
import useFetch from '../hooks/useFetch'
import { getMoves, getRosters, getTeamById, getTeams } from '../services/api'
import { BAD, GOOD, analyze, damagingMoves, evaluateTrio, ratingOf } from '../utils/battle'
import { withoutMega } from '../utils/roster'
import { parseTypes } from '../utils/typeChart'

const ENEMY_SIZE = 6
const PICK_SIZE = 3

const fmt = (s) => (s > 0 ? `+${s.toFixed(1)}` : s.toFixed(1))
const names = (list, enemy) => list.map((o) => enemy[o.j].name).join(', ')

function Section({ title, hint, children }) {
  return (
    <section className="card mt-4 p-4">
      <h3 className="font-medium">{title}</h3>
      {hint ? <p className="mt-1 mb-4 text-xs text-muted">{hint}</p> : <div className="mb-4" />}
      {children}
    </section>
  )
}

const chip = 'inline-flex h-5 shrink-0 items-center rounded-md px-2 text-xs font-medium'

export default function Battle() {
  const { id } = useParams()
  const { data: team, loading: loadingTeam } = useFetch(() => getTeamById(id), [id])
  const { data: rosters, loading: loadingRosters } = useFetch(getRosters)
  const { data: teams } = useFetch(getTeams)
  const { data: allMoves } = useFetch(getMoves)

  const [step, setStep] = useState('enemy')
  const [enemyIds, setEnemyIds] = useState([])
  const [picked, setPicked] = useState([])

  const rosterMap = useMemo(() => new Map((rosters ?? []).map((r) => [r.id, r])), [rosters])
  const rosterByName = useMemo(() => {
    const map = new Map()
    for (const r of rosters ?? []) if (!map.has(r.name)) map.set(r.name, r)
    return map
  }, [rosters])

  const pickable = useMemo(() => withoutMega(rosters ?? []), [rosters]) // Mega disembunyikan dari pemilih lawan
  const moveMap = useMemo(() => new Map((allMoves ?? []).map((m) => [m.name.toLowerCase(), m])), [allMoves])

  // Tim kita: lengkapi data tipe/stats dari roster (response tim hanya berisi ringkasan)
  // dan data move yang dibawa tiap Pokémon.
  const mine = useMemo(
    () =>
      (team?.members ?? []).map((m) => {
        // Cocokkan lewat id; jika tidak ada (mis. tim contoh vs roster dari server) pakai nama.
        const r = rosterMap.get(m.roster_id ?? m.id) ?? rosterByName.get(m.name)
        const moveInfo = (m.moves ?? []).map((n) => moveMap.get(String(n).toLowerCase())).filter(Boolean)
        return { ...m, ...r, nature: m.nature, item: m.item, moves: m.moves, moveInfo }
      }),
    [team, rosterMap, rosterByName, moveMap],
  )
  const enemy = useMemo(() => enemyIds.map((i) => rosterMap.get(i)).filter(Boolean), [enemyIds, rosterMap])
  const analysis = useMemo(
    () => (step === 'result' && mine.length && enemy.length === ENEMY_SIZE ? analyze(mine, enemy) : null),
    [step, mine, enemy],
  )

  const fillFromTeam = (teamId) => {
    const t = teams?.find((x) => x.id === teamId)
    if (!t) return
    const ids = t.members.map((m) => m.roster_id ?? m.id).filter((i) => rosterMap.has(i))
    setEnemyIds([...new Set(ids)].slice(0, ENEMY_SIZE))
  }

  const startAnalysis = () => {
    setPicked(analyze(mine, enemy).bestTrio)
    setStep('result')
    window.scrollTo({ top: 0 })
  }

  const toggle = (i) =>
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < PICK_SIZE ? [...p, i] : p))

  if (loadingTeam || loadingRosters) {
    return (
      <>
        <PageHeader title="Battle" back />
        <Loading />
      </>
    )
  }
  if (!team) {
    return (
      <>
        <PageHeader title="Battle" back />
        <NotFound message="Tim tidak ditemukan" />
      </>
    )
  }

  const noTypes = mine.some((m) => !parseTypes(m.type).length)
  const otherTeams = (teams ?? []).filter((t) => t.id !== team.id && t.members?.length)

  // ---------- Langkah 1: input tim musuh ----------
  if (step === 'enemy' || !analysis) {
    return (
      <>
        <PageHeader title="Battle" back />
        <main className="p-4">
          <div className="card p-4">
            <p className="text-xs text-muted">Tim kamu</p>
            <p className="font-medium">{team.name}</p>
            <div className="mt-3 flex gap-1">
              {mine.map((m, i) => (
                <PokeImage key={i} src={m.image} alt={m.name} className="h-10 w-10 rounded-md bg-raised p-0.5" />
              ))}
            </div>
            {mine.length < PICK_SIZE && (
              <p className="mt-3 text-xs text-fg2">Tim ini hanya {mine.length} Pokémon, idealnya 6</p>
            )}
          </div>

          <Section
            title={`Tim musuh (${enemyIds.length}/${ENEMY_SIZE})`}
            hint="Ketuk Pokémon yang kamu lihat di tim lawan, tidak perlu tahu namanya. Filter tipe membantu mempersempit."
          >
            <PokemonPicker rosters={pickable} selected={enemyIds} max={ENEMY_SIZE} onChange={setEnemyIds} />
            {otherTeams.length > 0 && (
              <select
                value=""
                onChange={(e) => fillFromTeam(e.target.value)}
                aria-label="Isi dari tim tersimpan"
                className="field mt-4"
              >
                <option value="">Isi dari tim tersimpan</option>
                {otherTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </Section>

          {/* Tetap terlihat di atas bottom nav (64px), tidak perlu menggulir ke bawah */}
          <div className="sticky bottom-16 z-40 -mx-4 mt-4 border-t border-line bg-bg px-4 py-3">
            <button
              onClick={startAnalysis}
              disabled={enemy.length !== ENEMY_SIZE || !mine.length}
              className="btn btn-primary w-full"
            >
              {enemy.length === ENEMY_SIZE
                ? 'Analisis matchup'
                : `Pilih ${ENEMY_SIZE - enemy.length} Pokémon lagi`}
            </button>
          </div>
        </main>
      </>
    )
  }

  // ---------- Langkah 2: hasil & pilih 3 ----------
  const { matrix, details, perMine, bestTrio, threats } = analysis
  const isBest = (i) => bestTrio.includes(i)
  const sameAsBest = picked.length === bestTrio.length && picked.every((i) => bestTrio.includes(i))
  const evaluation = picked.length ? evaluateTrio(matrix, picked, enemy.length) : []
  const handled = evaluation.filter((e) => e.score >= GOOD).length
  const danger = evaluation.filter((e) => e.score < BAD)

  return (
    <>
      <PageHeader title="Battle" back />
      <main className="p-4">
        {noTypes && (
          <p className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-fg2">
            <Info size={16} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
            Sebagian Pokémon belum punya data tipe, hasil analisis kurang akurat
          </p>
        )}

        {/* Momen utama layar: tiga Pokémon yang direkomendasikan */}
        <div className="card p-4">
          <p className="text-xs text-muted">Rekomendasi 3 Pokémon</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {bestTrio.map((i, n) => (
              <div key={i} className="rounded-lg border border-accent/60 bg-raised p-2 text-center">
                <p className="num text-left text-xs text-muted">{String(n + 1).padStart(2, '0')}</p>
                <PokeImage src={mine[i].image} alt="" className="mx-auto -mt-2 h-20 w-20" />
                <p className="truncate text-sm font-medium">{mine[i].name}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Dipilih agar tiap lawan punya jawaban, karena kamu tidak tahu 3 mana yang akan dipilih musuh
          </p>
        </div>

        <Section title="Pilih 3 Pokémon kamu" hint="Ketuk untuk memilih atau melepas, hasil di bawah ikut berubah">
          <ul className="space-y-2">
            {mine.map((m, i) => {
              const on = picked.includes(i)
              const p = perMine[i]
              const r = ratingOf(p.avg)
              return (
                <li key={i}>
                  <button
                    onClick={() => toggle(i)}
                    aria-pressed={on}
                    className={`w-full rounded-xl border p-3 text-left transition-colors duration-150 ${
                      on ? 'border-accent bg-raised' : 'border-line bg-surface hover:bg-raised'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PokeImage src={m.image} alt="" className="h-12 w-12 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="flex items-center gap-2">
                          <span className="truncate font-medium">{m.name}</span>
                          {isBest(i) && <span className={`${chip} bg-accent/15 text-accent-text`}>Rekomendasi</span>}
                        </p>
                        <TypeBadges type={m.type} />
                      </div>
                      <div className="text-right">
                        <p className={`num ${r.text}`}>{fmt(p.avg)}</p>
                        <p className="text-xs text-muted">rata-rata</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 border-t border-line pt-3 text-xs">
                      {p.strongVs.length > 0 && (
                        <p className="text-pos">
                          <span className="font-medium">Unggul vs</span> {names(p.strongVs, enemy)}
                        </p>
                      )}
                      {p.weakVs.length > 0 && (
                        <p className="text-[#f08a8d]">
                          <span className="font-medium">Lemah vs</span> {names(p.weakVs, enemy)}
                        </p>
                      )}
                      {!p.strongVs.length && !p.weakVs.length && (
                        <p className="text-muted">Seimbang melawan semua lawan</p>
                      )}
                      <p className="text-muted">
                        {damagingMoves(m).length
                          ? `Serangan: ${damagingMoves(m)
                              .map((mv) => `${mv.name} (${mv.type})`)
                              .join(', ')}`
                          : 'Belum ada move serangan, dihitung dari tipe Pokémon'}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          {!sameAsBest && (
            <button onClick={() => setPicked(bestTrio)} className="btn btn-secondary mt-3 w-full">
              Pakai rekomendasi
            </button>
          )}
        </Section>

        <Section
          title={`Hasil pilihanmu (${picked.length}/${PICK_SIZE})`}
          hint="Untuk tiap lawan, siapa dari 3 pilihanmu yang paling cocok melawannya"
        >
          {picked.length < PICK_SIZE ? (
            <p className="text-sm text-muted">Pilih {PICK_SIZE} Pokémon dulu</p>
          ) : (
            <>
              <p
                className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                  danger.length ? 'border-neg/40 bg-neg/10 text-[#f08a8d]' : 'border-pos/40 bg-pos/10 text-pos'
                }`}
              >
                <span className="num">
                  {handled}/{enemy.length}
                </span>{' '}
                lawan punya jawaban unggul
                {danger.length > 0 && `. Waspada: ${danger.map((d) => enemy[d.enemy].name).join(', ')}`}
              </p>
              <ul className="space-y-2">
                {evaluation.map((e) => {
                  const r = ratingOf(e.score)
                  const d = details[e.answer][e.enemy]
                  return (
                    <li key={e.enemy} className="flex items-center gap-3 text-sm">
                      <PokeImage src={enemy[e.enemy].image} alt="" className="h-10 w-10 shrink-0" />
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate font-medium">{enemy[e.enemy].name}</span>
                        <span className="flex items-center gap-1 text-xs text-fg2">
                          <ArrowLeft size={12} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
                          <span className="truncate">
                            {mine[e.answer].name}
                            {d.move && (
                              <span className="num text-muted">
                                {' '}
                                · {d.move.name} ×{d.mult}
                              </span>
                            )}
                          </span>
                        </span>
                      </span>
                      <span className={`${chip} ${r.cell}`}>{r.label}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </Section>

        <Section
          title="Perkiraan ancaman musuh"
          hint="Lawan yang paling merepotkan timmu, jadi kemungkinan sering dipilih. Ini perkiraan, bukan kepastian"
        >
          <ul className="space-y-3">
            {threats.slice(0, 3).map(({ j, threat }) => (
              <li key={j} className="flex items-center gap-3">
                <PokeImage src={enemy[j].image} alt="" className="h-10 w-10 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-medium">{enemy[j].name}</p>
                  <TypeBadges type={enemy[j].type} />
                </div>
                <span className="num text-[#f08a8d]">{fmt(threat)}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Matriks matchup" hint="Baris: Pokémon kamu. Kolom: musuh. Hijau berarti kamu unggul">
          <div className="grid grid-cols-[2.5rem_repeat(6,minmax(0,1fr))] gap-1">
            <div />
            {enemy.map((e, j) => (
              <PokeImage key={j} src={e.image} alt={e.name} className="mx-auto h-8 w-8" />
            ))}
            {mine.map((m, i) => (
              <div key={i} className="contents">
                <PokeImage src={m.image} alt={m.name} className="h-8 w-8" />
                {matrix[i].map((s, j) => (
                  <div
                    key={j}
                    title={`${m.name} vs ${enemy[j].name}: ${ratingOf(s).label}${
                      details[i][j].move ? ` (${details[i][j].move.name})` : ''
                    }`}
                    className={`num flex h-8 items-center justify-center rounded-md text-xs ${ratingOf(s).cell}`}
                  >
                    {fmt(s)}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Skor = kekuatan serangan terbaikmu − serangan terbaik lawan, ±0,5 untuk kecepatan dasar. Seranganmu
            dihitung dari move yang kamu bawa (tipe, power, STAB). Lawan diasumsikan memakai move STAB power 80
            karena movenya tidak diketahui. Item, ability, dan cuaca belum diperhitungkan
          </p>
        </Section>

        <button onClick={() => setStep('enemy')} className="btn btn-secondary mt-4 w-full">
          Ubah tim musuh
        </button>
      </main>
    </>
  )
}
