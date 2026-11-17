import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import ErrorBoundary from './ErrorBoundary'

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="mx-auto min-h-screen max-w-md border-x border-line bg-bg pb-20">
      {/* key: reset boundary saat pindah halaman */}
      <ErrorBoundary key={pathname}>
        <Outlet />
      </ErrorBoundary>
      <BottomNav />
    </div>
  )
}
