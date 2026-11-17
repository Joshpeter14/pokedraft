import { Info } from 'lucide-react'

export function Loading() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Memuat">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-fg2" />
    </div>
  )
}

export function NotFound({ message = 'Data tidak ditemukan' }) {
  return <p className="py-16 text-center text-sm text-muted">{message}</p>
}

export function FallbackBanner() {
  return (
    <p className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-fg2">
      <Info size={16} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden="true" />
      Server tidak terjangkau, menampilkan data contoh
    </p>
  )
}
