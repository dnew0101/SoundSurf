// shared/store.js
import { create } from 'zustand'
import { createRef } from 'react'
import { calcTrackLength } from './constants'

const newGameState = {
  score: 0,
  selectedTrack: null,
  hitStreak: 0,
  streakMultiplier: 1,
  startGame: true,
  username: null,
  audioAnalysis: null,
  endGame: false,
  isLoaded: false,
  trackTargets: [],
  isPlaying: false,
  audioStartTime: null,
  trackLength: 500,
}

const useStore = create((set, get) => ({
  set,
  get,
  ...newGameState,
  router: null,
  connected: false,
  spotifyWebPlayer: null,
  selectedJamendoTrack: null,
  currentTrack: null,
  deviceId: null,
  explosions: [],
  ship: createRef(),
  currentLane: { current: 1 },
  shipProgress: { current: 0 },
  audioParams: {
    bpm: { current: 120 },
    intensityScalar: { current: 1 },
    lastKickTime: { current: 0 },
  },
  audioContext: null,
  audioBuffer: null,

  setStartGame: (val) => set({ startGame: val }),
  setUsername: (name) => set({ username: name }),
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setAudioAnalysis: (features) => set({ audioAnalysis: features }),
  setTrackLength: (len) => set({ trackLength: len }),  // ← add this

  resetHitStreak: () => set(() => ({ hitStreak: 0 })),

  setScore: () => {
    const streak = Math.floor(get().hitStreak / 10)
    const streakMultiplier = streak > 0 ? streak : 1
    set((state) => ({
      score: state.score + 10 * streakMultiplier,
      hitStreak: state.hitStreak + 1,
      streakMultiplier,
    }))
  },

  addExplosion: (positionX) => {
    set((state) => ({
      explosions: [...state.explosions, { positionX, ts: Date.now() }],
    }))
  },

  resetGame: () => set(() => ({ ...newGameState })),

  setEndGame: () => set(() => ({
    audioAnalysis: null,
    endGame: true,
    startGame: false,
  })),
}))

export default useStore