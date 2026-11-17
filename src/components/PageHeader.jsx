import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, back = false }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line bg-bg px-4">
      {back && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-fg2 transition-colors duration-150 hover:bg-raised hover:text-fg"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
      )}
      <h1 className="text-lg font-medium">{title}</h1>
    </header>
  )
}
