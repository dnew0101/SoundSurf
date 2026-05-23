import { useNavigate } from 'react-router-dom'
import useStore from '@/shared/store'

export default function TrackEnd() {
  const navigate = useNavigate()
  const score = useStore((s) => s.score)
  const resetGame = useStore((s) => s.resetGame)

  const handlePlayAgain = () => {
    resetGame()
    navigate('/')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#7B61FF',
          letterSpacing: 2,
        }}
      >
        Track Complete
      </div>

      <div
        style={{
          fontSize: 20,
          color: '#94A3B8',
        }}
      >
        Score: <span style={{ color: '#33E0D7', fontWeight: 700 }}>{score}</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <button
          onClick={handlePlayAgain}
          style={{
            padding: '12px 32px',
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
            background: '#7B61FF',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Play Again
        </button>

        <button
          style={{
            padding: '12px 32px',
            fontSize: 16,
            fontWeight: 600,
            color: '#94A3B8',
            background: 'transparent',
            border: '1px solid #334155',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          See Scores
        </button>
      </div>
    </div>
  )
}
