import { useState } from 'react'
import { Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const developer = {
  name: 'Josh Peter Sirait',
  nim: '21120124140155',
  photo: '/profile.webp',
  title: 'PokeDraft: Progressive Web App Panduan Roster dan Tim Pokémon Champions',
}

export default function Profile() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <PageHeader title="Profil" />
      <main className="space-y-4 p-4">
        <section className="card p-4">
          <h2 className="mb-2 font-medium">Tentang PokeDraft</h2>
          <p className="leading-relaxed text-fg2">
            PokeDraft membantu pemain Pokémon Champions meracik tim 6 Pokémon beserta nature, item, dan moveset,
            lalu memilih 3 dari 6 saat drafting ranked 3v3 berdasarkan matchup melawan tim lawan
          </p>
          <p className="num mt-3 text-xs text-muted">v1.0.0 · React, Vite, Tailwind CSS</p>
        </section>

        <section className="card p-4">
          <h2 className="mb-4 font-medium">Developer</h2>
          <div className="flex items-center gap-4">
            <img
              src={developer.photo}
              alt={developer.name}
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden'
              }}
              className="h-20 w-20 shrink-0 rounded-xl bg-raised object-cover object-[center_20%]"
            />
            <div className="min-w-0">
              <p className="text-lg font-medium">{developer.name}</p>
              <p className="mt-1 text-xs text-muted">NIM</p>
              <p className="num text-fg2">{developer.nim}</p>
            </div>
          </div>
        </section>

        <button onClick={() => setOpen(true)} className="btn btn-primary w-full">
          <Info size={18} strokeWidth={1.5} aria-hidden="true" />
          Info Tugas Akhir
        </button>
      </main>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ta-title"
            className="card w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="ta-title" className="font-medium">
              Tugas Akhir PPB
            </h2>
            <p className="mt-3 text-xs text-muted">NIM</p>
            <p className="num text-fg2">{developer.nim}</p>
            <p className="mt-3 text-xs text-muted">Judul</p>
            <p className="leading-relaxed text-fg2">{developer.title}</p>
            <button onClick={() => setOpen(false)} className="btn btn-primary mt-5 w-full">
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  )
}
