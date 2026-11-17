// Ikon pokeball bergaya garis, selaras dengan lucide (24x24, stroke 1.5, warna mengikuti teks).
export default function PokeballIcon({ size = 24, strokeWidth = 1.5, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h5.5M15.5 12H21" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}
