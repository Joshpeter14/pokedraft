import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export default function PokeImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-raised text-muted ${className}`}
      >
        <ImageOff size={20} strokeWidth={1.5} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  )
}
