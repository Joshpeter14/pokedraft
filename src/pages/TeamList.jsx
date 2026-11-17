import { Link } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import PokeImage from '../components/PokeImage'
import { FallbackBanner, Loading, NotFound } from '../components/StatusViews'
import useFetch from '../hooks/useFetch'
import { getTeams } from '../services/api'

export default function TeamList() {
  const { data, loading, isFallback } = useFetch(getTeams)

  return (
    <>
      <PageHeader title="Tim" />
      <main className="p-4">
        <Link to="/team/new" className="btn btn-primary mb-4 w-full">
          <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
          Buat tim
        </Link>
        {loading ? (
          <Loading />
        ) : !data?.length ? (
          <NotFound message="Belum ada tim" />
        ) : (
          <>
            {isFallback && <FallbackBanner />}
            <ul className="space-y-3">
              {data.map((t) => (
                <li key={t.id}>
                  <Link to={`/team/${t.id}`} className="card block p-4 transition-colors duration-150 hover:bg-raised">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{t.name}</p>
                      <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
                    </div>
                    {t.description && <p className="mt-1 line-clamp-2 text-fg2">{t.description}</p>}
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
                        <span className="num ml-auto text-xs text-muted">{t.members.length}/6</span>
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
