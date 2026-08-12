import { Routes, Route, useLocation, Navigate } from 'react-router'
import { useEffect } from 'react'
import Home from './pages/Home'
import Survey from './pages/Survey'
import Toolbox from './pages/Toolbox'
import TabBar from './components/TabBar'

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/toolbox" element={<Toolbox />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
    </div>
  )
}
