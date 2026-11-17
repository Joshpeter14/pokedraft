import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import RosterList from './pages/RosterList'
import RosterDetail from './pages/RosterDetail'
import TeamList from './pages/TeamList'
import TeamDetail from './pages/TeamDetail'
import TeamForm from './pages/TeamForm'
import Battle from './pages/Battle'
import BattleSelect from './pages/BattleSelect'
import Profile from './pages/Profile'

// Tautan lama /team/:id/battle diarahkan ke tab Battle.
function LegacyBattleRedirect() {
  const { id } = useParams()
  return <Navigate to={`/battle/${id}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/roster" replace />} />
          <Route path="/roster" element={<RosterList />} />
          <Route path="/roster/:id" element={<RosterDetail />} />
          <Route path="/team" element={<TeamList />} />
          <Route path="/team/new" element={<TeamForm />} />
          <Route path="/team/:id" element={<TeamDetail />} />
          <Route path="/team/:id/edit" element={<TeamForm />} />
          <Route path="/battle" element={<BattleSelect />} />
          <Route path="/battle/:id" element={<Battle />} />
          <Route path="/team/:id/battle" element={<LegacyBattleRedirect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/roster" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
