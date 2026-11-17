import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Loading, NotFound } from '../components/StatusViews'
import useFetch from '../hooks/useFetch'
import { createTeam, getRosterMoves, getRosters, getTeamById, updateTeam } from '../services/api'
import { isMega } from '../utils/roster'
import { COMMON_ITEMS, MAX_MOVES, NATURES, TEAM_SIZE } from '../constants'

const emptySlot = () => ({
  roster_id: '',
  nature: '',
  ability: '',
  item: '',
  moves: Array(MAX_MOVES).fill(''),
})

export default function TeamForm() {
  const navigate = useNavigate()
  const { id: editId } = useParams() // ada = mode edit (/team/:id/edit)
  const isEdit = Boolean(editId)
  const { data: rosters, loading: loadingRosters } = useFetch(getRosters)
  const { data: editTeam, loading: loadingTeam } = useFetch(
    () => (isEdit ? getTeamById(editId) : Promise.resolve({ data: null, isFallback: false })),
    [editId],
  )
  const loading = loadingRosters || (isEdit && loadingTeam)
  const [name, setName] = useState('')
  const [strategy, setStrategy] = useState('')
  const [slots, setSlots] = useState(() => Array.from({ length: TEAM_SIZE }, emptySlot))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Mode edit: isi form dari tim yang ada (sekali saja).
  const initialized = useRef(false)
  useEffect(() => {
    if (!isEdit || initialized.current || !editTeam) return
    initialized.current = true
    setName(editTeam.name ?? '')
    setStrategy(editTeam.strategy ?? '')
    const members = (editTeam.members ?? []).map((m) => ({
      roster_id: m.roster_id ?? m.id ?? '',
      nature: m.nature ?? '',
      ability: m.ability ?? '',
      item: m.item ?? '',
      moves: Array.from({ length: MAX_MOVES }, (_, i) => m.moves?.[i] ?? ''),
    }))
    while (members.length < TEAM_SIZE) members.push(emptySlot())
    setSlots(members)
  }, [editTeam, isEdit])

  // moveLists[rosterId]: undefined = belum diminta, null = memuat, array = daftar move (kosong = tidak ada data)
  const [moveLists, setMoveLists] = useState({})
  const requested = useRef(new Set())

  useEffect(() => {
    for (const { roster_id } of slots) {
      if (!roster_id || requested.current.has(roster_id)) continue
      requested.current.add(roster_id)
      setMoveLists((m) => ({ ...m, [roster_id]: null }))
      getRosterMoves(roster_id).then((res) => setMoveLists((m) => ({ ...m, [roster_id]: res.data ?? [] })))
    }
  }, [slots])

  const update = (i, patch) =>
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, ...patch } : slot)))

  const pickRoster = (i, roster_id) =>
    update(i, { roster_id, moves: Array(MAX_MOVES).fill('') }) // move lama tidak berlaku untuk Pokémon baru

  const updateMove = (i, j, value) =>
    setSlots((s) =>
      s.map((slot, idx) =>
        idx === i ? { ...slot, moves: slot.moves.map((m, k) => (k === j ? value : m)) } : slot,
      ),
    )

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Nama tim wajib diisi')
    if (slots.some((s) => !s.roster_id)) return setError(`Pilih ${TEAM_SIZE} Pokémon untuk semua slot`)
    if (new Set(slots.map((s) => s.roster_id)).size !== slots.length)
      return setError('Tidak boleh ada Pokémon yang sama dalam satu tim')

    // Validasi move terhadap movepool (jika datanya ada) dan samakan huruf besar/kecil.
    const members = []
    for (const [i, s] of slots.entries()) {
      const pool = moveLists[s.roster_id]
      const entered = s.moves.map((m) => m.trim()).filter(Boolean)
      const canon = []
      for (const m of entered) {
        const hit = pool?.length ? pool.find((p) => p.name.toLowerCase() === m.toLowerCase()) : null
        if (pool?.length && !hit) return setError(`Slot ${i + 1}: "${m}" tidak ada di movepool Pokémon ini`)
        canon.push(hit ? hit.name : m)
      }
      if (new Set(canon.map((m) => m.toLowerCase())).size !== canon.length)
        return setError(`Slot ${i + 1}: ada move yang sama dipilih dua kali`)
      members.push({
        roster_id: s.roster_id,
        nature: s.nature,
        ability: s.ability.trim(),
        item: s.item.trim(),
        moves: canon,
      })
    }

    setError('')
    setSaving(true)
    const payload = { name: name.trim(), strategy: strategy.trim(), members }
    try {
      const { data } = isEdit ? await updateTeam(editId, payload) : await createTeam(payload)
      navigate(data?.id ? `/team/${data.id}` : '/team', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error ?? 'Gagal menyimpan: server tidak terjangkau')
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title={isEdit ? 'Edit tim' : 'Buat tim'} back />
      <main className="p-4">
        {loading ? (
          <Loading />
        ) : isEdit && !editTeam ? (
          <NotFound message="Tim tidak ditemukan" />
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <section className="card space-y-4 p-4">
              <label className="block text-sm text-fg2">
                Nama tim
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field mt-1"
                  placeholder="Mega Offense"
                />
              </label>
              <label className="block text-sm text-fg2">
                Strategi
                <textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  rows={3}
                  className="field mt-1"
                  placeholder="Rencana memilih 3 dari 6"
                />
              </label>
            </section>

            {slots.map((slot, i) => {
              const pool = moveLists[slot.roster_id]
              const hasPool = Array.isArray(pool) && pool.length > 0
              return (
                <section key={i} className="card space-y-2 p-4">
                  <h3 className="num mb-2 text-xs text-muted">Slot {String(i + 1).padStart(2, '0')}</h3>
                  <select
                    value={slot.roster_id}
                    onChange={(e) => pickRoster(i, e.target.value)}
                    aria-label={`Pokémon slot ${i + 1}`}
                    className="field"
                  >
                    <option value="">Pilih Pokémon</option>
                    {/* Wujud Mega disembunyikan; tetap muncul jika sudah terpilih di tim lama. */}
                    {rosters
                      ?.filter((r) => !isMega(r) || r.id === slot.roster_id)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.dex_number} {r.name}
                        </option>
                      ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={slot.nature}
                      onChange={(e) => update(i, { nature: e.target.value })}
                      aria-label={`Nature slot ${i + 1}`}
                      className="field"
                    >
                      <option value="">Nature</option>
                      {NATURES.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                    <input
                      value={slot.item}
                      onChange={(e) => update(i, { item: e.target.value })}
                      list="items-list"
                      placeholder="Held item"
                      aria-label={`Held item slot ${i + 1}`}
                      className="field"
                    />
                  </div>
                  <input
                    value={slot.ability}
                    onChange={(e) => update(i, { ability: e.target.value })}
                    list={`abilities-${i}`}
                    placeholder="Ability"
                    aria-label={`Ability slot ${i + 1}`}
                    className="field"
                  />
                  <datalist id={`abilities-${i}`}>
                    {(rosters?.find((r) => r.id === slot.roster_id)?.abilities ?? []).map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>

                  <div className="grid grid-cols-2 gap-2">
                    {slot.moves.map((mv, j) => (
                      <input
                        key={j}
                        value={mv}
                        onChange={(e) => updateMove(i, j, e.target.value)}
                        list={hasPool ? `moves-${i}` : undefined}
                        placeholder={`Move ${j + 1}`}
                        aria-label={`Move ${j + 1} slot ${i + 1}`}
                        disabled={!slot.roster_id}
                        className="field"
                      />
                    ))}
                  </div>
                  {hasPool && (
                    <datalist id={`moves-${i}`}>
                      {pool.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.type} · {m.category}
                          {m.power ? ` · ${m.power}` : ''}
                        </option>
                      ))}
                    </datalist>
                  )}
                  {slot.roster_id && (
                    <p className="text-xs text-muted">
                      {pool === null || pool === undefined
                        ? 'Memuat daftar move'
                        : hasPool
                          ? `${pool.length} move tersedia, ketik untuk mencari`
                          : 'Data move belum tersedia, isi manual'}
                    </p>
                  )}
                </section>
              )
            })}

            <datalist id="items-list">
              {COMMON_ITEMS.map((it) => (
                <option key={it} value={it} />
              ))}
            </datalist>

            {error && (
              <p role="alert" className="rounded-lg border border-neg/40 bg-neg/10 px-3 py-2 text-sm text-[#f08a8d]">
                {error}
              </p>
            )}
            <button type="submit" disabled={saving} className="btn btn-primary w-full">
              {saving ? 'Menyimpan' : isEdit ? 'Simpan perubahan' : 'Simpan tim'}
            </button>
          </form>
        )}
      </main>
    </>
  )
}
