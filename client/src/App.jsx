import { useState } from 'react'
import GameCanvas from './components/GameCanvas'
import Menu from './components/UI/menu'
import { loadAndParseAudio } from './utils/audioLoader'
import useStore from './shared/store'

export default function App() {
  const [loading, setLoading] = useState(false)
  const isLoaded = useStore((s) => s.isLoaded)
  const startGame = useStore((s) => s.startGame)

  const handleStartTest = async () => {
    setLoading(true)
    try {
      await loadAndParseAudio('/test-song.mp3')
    } catch (err) {
      console.error("Failed to load audio:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      {startGame ? <GameCanvas /> : <Menu />}
      {isLoaded && <TestHUD />}
    </div>
  )
}

function TestHUD() {
  const score = useStore((s) => s.score)
  const hitStreak = useStore((s) => s.hitStreak)
  
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 10,
      color: '#0ff',
      fontFamily: 'monospace',
      fontSize: '24px'
    }}>
      <div>SCORE: {score}</div>
      <div>STREAK: {hitStreak}</div>
    </div>
  )
}