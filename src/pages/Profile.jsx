import PageHeader from '../components/PageHeader'

const developer = {
  name: 'Josh Peter Sirait',
  nim: '21120124140155',
  photo: '/profile.webp',
}

export default function Profile() {
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
      </main>
    </>
  )
}
