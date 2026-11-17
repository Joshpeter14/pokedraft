import { Link } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import PokeImage from '../components/PokeImage'
import { FallbackBanner, Loading } from '../components/StatusViews'
import useFetch from '../hooks/useFetch'
import { getTeams } from '../services/api'

// Tab Battle: pilih tim mana yang dibawa ke pertarungan.
export default function BattleSelect() {
  const { data, loading, isFallback } = useFetch(getTeams)

  return (
    <>
      <PageHeader title="Battle" />
      <main className="p-4">
        <p className="mb-4 text-fg2">
          Pilih tim yang kamu bawa, masukkan 6 Pokémon lawan, lalu pilih 3 dari 6 dengan panduan matchup
        </p>
        {loading ? (
          <Loading />
        ) : !data?.length ? (
          <div className="card p-6 text-center">
            <p className="text-fg2">Belum ada tim untuk dibawa battle</p>
            <Link to="/team/new" className="btn btn-primary mt-4">
              <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
              Buat tim
            </Link>
          </div>
        ) : (
          <>
            {isFallback && <FallbackBanner />}
            <ul className="space-y-3">
              {data.map((t) => (
                <li key={t.id}>
                  <Link to={`/battle/${t.id}`} className="card block p-4 transition-colors duration-150 hover:bg-raised">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{t.name}</p>
                      <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
                    </div>
                    {t.members?.length > 0 && (
                      <div className="mt-3 flex items-center gap-1">
                        {t.members.map((m, i) => (
                          <PokeImage
                            key={`${m.roster_id ?? m.id}-${i}`}
                            src={m.image}
                            alt={m.name}
                            className="h-10 w-10 rounded-md bg-raised p-0.5"
                          />
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  )
}
