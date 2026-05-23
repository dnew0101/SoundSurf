import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import GameCanvas from './components/GameCanvas'
import Menu from './components/UI/menu'
import AudioUploader from './components/AudioUploader'
import useStore from './shared/store'

function AppRoutes() {
  const isLoaded = useStore((s) => s.isLoaded)
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded) navigate('/game')
  }, [isLoaded, navigate])

  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/upload" element={<AudioUploader />} />
      <Route path="/game" element={<GameCanvas />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}
