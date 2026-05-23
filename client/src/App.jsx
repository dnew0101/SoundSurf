import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import GameCanvas from './components/GameCanvas'
import Menu from './components/UI/menu'
import AudioUploader from './components/AudioUploader'
import useStore from './shared/store'

const API_BASE = '/api/spotify'

/** Handles the Spotify OAuth redirect — exchanges the code for tokens. */
function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setSpotifyAuth = useStore((s) => s.setSpotifyAuth)
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError('No authorization code received')
      return
    }

    let cancelled = false

    const exchange = async () => {
      // Fetch config to get the exact registered redirectUri for token exchange
      const configRes = await fetch(`${API_BASE}/config`)
      const config = await configRes.json()

      const res = await fetch(`${API_BASE}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri: config.redirectUri }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Token exchange failed')
      }
      const tokens = await res.json()
      if (!cancelled) {
        setSpotifyAuth(tokens)
        navigate('/', { replace: true })
      }
    }

    exchange().catch((e) => {
      if (!cancelled) setError(e.message)
    })

    return () => { cancelled = true }
  }, [searchParams, navigate, setSpotifyAuth])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b0502] text-white">
        <div className="text-center space-y-4">
          <p className="text-red-400">Authentication failed: {error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#33E0D7] text-black rounded-md font-semibold"
          >
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-[#0b0502] text-white">
      <p className="text-slate-400">Signing in with Spotify...</p>
    </div>
  )
}

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
      <Route path="/callback" element={<OAuthCallback />} />
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