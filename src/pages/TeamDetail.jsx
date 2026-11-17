import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import PokeImage from '../components/PokeImage'
import { FallbackBanner, Loading, NotFound } from '../components/StatusViews'
import useFetch from '../hooks/useFetch'
import { deleteTeam, getTeamById } from '../services/api'
import { TEAM_SIZE } from '../constants'

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="truncate">{value || '–'}</dd>
    </div>
  )
}

function Slot({ m, index }) {
  const moves = Array.isArray(m.moves) ? m.moves.filter(Boolean) : []
  return (
    <li className="card p-3">
      <Link to={`/roster/${m.roster_id ?? m.id}`} className="flex items-center gap-3">
        <span className="num w-5 shrink-0 text-xs text-muted">{String(index + 1).padStart(2, '0')}</span>
        <PokeImage src={m.image} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-raised p-1" />
        <div className="min-w-0 flex-1">
          <p className="num text-xs text-muted">{m.dex_number}</p>
          <p className="truncate font-medium">{m.name}</p>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
      </Link>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
        <Detail label="Nature" value={m.nature} />
        <Detail label="Held item" value={m.item} />
        {m.ability && (
          <div className="col-span-2">
            <Detail label="Ability" value={m.ability} />
          </div>
        )}
      </dl>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {moves.length ? (
          moves.map((mv, i) => (
            <span key={`${mv}-${i}`} className="truncate rounded-md bg-raised px-2 py-1 text-xs">
              {mv}
            </span>
          ))
        ) : (
          <span className="col-span-2 text-xs text-muted">Moveset belum diisi</span>
        )}
      </div>
    </li>
  )
}

export default function TeamDetail() {
  const { id } = useParams()
  const { data: t, loading, isFallback } = useFetch(() => getTeamById(id), [id])
  const members = t?.members ?? []
  const empty = Math.max(0, TEAM_SIZE - members.length)
  const readOnly = /^t-/.test(String(t?.id)) // tim contoh bawaan aplikasi (fallback dummy)
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const onDelete = async () => {
    setDeleting(true)
    try {
      await deleteTeam(t.id)
      navigate('/team', { replace: true })
    } catch (err) {
      setDeleteError(err.response?.data?.error ?? 'Gagal menghapus: server tidak terjangkau')
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader title="Detail tim" back />
      <main className="p-4">
        {loading ? (
          <Loading />
        ) : !t ? (
          <NotFound message="Tim tidak ditemukan" />
        ) : (
          <>
            {isFallback && <FallbackBanner />}
            <div className="card p-4">
              <h2 className="text-xl font-medium">{t.name}</h2>
              {t.description && <p className="mt-1 text-fg2">{t.description}</p>}
              {!readOnly && (
                <Link to={`/team/${t.id}/edit`} className="btn btn-secondary mt-4 w-full">
                  <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
                  Edit tim
                </Link>
              )}
            </div>

            <h3 className="mt-6 mb-3 flex items-baseline justify-between font-medium">
              Roster
              <span className="num text-xs font-normal text-muted">
                {members.length}/{TEAM_SIZE}
              </span>
            </h3>
            <ul className="space-y-3">
              {members.map((m, i) => (
                <Slot key={`${m.roster_id ?? m.id}-${i}`} m={m} index={i} />
              ))}
              {Array.from({ length: empty }, (_, i) => (
                <li
                  key={`empty-${i}`}
                  className="flex h-16 items-center gap-3 rounded-xl border border-dashed border-line-strong px-3 text-sm text-muted"
                >
                  <span className="num w-5 text-xs">{String(members.length + i + 1).padStart(2, '0')}</span>
                  Slot kosong
                </li>
              ))}
            </ul>

            {t.strategy && (
              <section className="card mt-6 p-4">
                <h3 className="mb-2 font-medium">Strategi</h3>
                <p className="leading-relaxed text-fg2">{t.strategy}</p>
              </section>
            )}

            {readOnly ? (
              <p className="mt-6 text-center text-xs text-muted">Tim contoh tidak dapat diubah atau dihapus</p>
            ) : (
              <section className="mt-6">
                {!confirming ? (
                  <button onClick={() => setConfirming(true)} className="btn btn-danger w-full">
                    <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                    Hapus tim
                  </button>
                ) : (
                  <div role="alertdialog" className="rounded-xl border border-neg/40 bg-neg/10 p-4 text-center">
                    <p className="text-sm">Hapus "{t.name}"? Tim yang dihapus tidak bisa dikembalikan</p>
                    {deleteError && <p className="mt-2 text-xs text-[#f08a8d]">{deleteError}</p>}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setConfirming(false)
                          setDeleteError('')
                        }}
                        disabled={deleting}
                        className="btn btn-secondary"
                      >
                        Batal
                      </button>
                      <button onClick={onDelete} disabled={deleting} className="btn btn-danger-solid">
                        {deleting ? 'Menghapus' : 'Ya, hapus'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}
