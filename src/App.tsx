import { Routes, Route, useLocation, Navigate } from 'react-router'
import { useEffect } from 'react'
import Home from './pages/Home'
import Survey from './pages/Survey'
import Toolbox from './pages/Toolbox'
import Dashboard from './pages/Dashboard'
import TabBar from './components/TabBar'
import AnnouncementModal from './components/AnnouncementModal'

export default function App() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/dashboard'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={`min-h-screen bg-gray-50 ${isDashboard ? '' : 'pb-16'}`}>
      {!isDashboard && <AnnouncementModal />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/toolbox" element={<Toolbox />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isDashboard && <TabBar />}
    </div>
  )
}
