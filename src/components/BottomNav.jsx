import { NavLink } from 'react-router-dom'
import { LayoutGrid, Swords, User } from 'lucide-react'
import PokeballIcon from './PokeballIcon'

const items = [
  { to: '/roster', label: 'Pokedex', Icon: PokeballIcon },
  { to: '/team', label: 'Tim', Icon: LayoutGrid },
  { to: '/battle', label: 'Battle', Icon: Swords },
  { to: '/profile', label: 'Profil', Icon: User },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-line bg-deep pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150 ${
                  isActive ? 'text-accent-text' : 'text-muted hover:text-fg2'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
