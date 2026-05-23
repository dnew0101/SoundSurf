// App.js (or your main wrapper)
import { useState } from 'react'
import GameCanvas from './components/GameCanvas'
import { loadAndParseAudio } from './utils/audioLoader'
import useStore from './shared/store'
import { AudioUploader } from './components/AudioUploader'

export default function App() {
  const [loading, setLoading] = useState(false)
  const isLoaded = useStore((s) => s.isLoaded)

  const handleStartTest = async () => {
    setLoading(true)
    try {
      // Because the file is in the public folder, we fetch it from the root path
      await loadAndParseAudio('/test-song.mp3')
    } catch (err) {
      console.error("Failed to load audio:", err)
    }
    setLoading(false)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      
    <AudioUploader />
      
      {/* <GameCanvas />

      {!isLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          flexDirection: 'column'
        }}>
          <button 
            onClick={handleStartTest} 
            disabled={loading}
            style={{
              padding: '20px 40px',
              fontSize: '24px',
              cursor: loading ? 'wait' : 'pointer',
              background: loading ? '#555' : '#1db954',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Analyzing Track...' : 'Play Test Song'}
          </button>
        </div>
      )}
      
      {isLoaded && <TestHUD />} 
      */}
    </div>
  )
}

// Simple HUD to verify your hit detection is working
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