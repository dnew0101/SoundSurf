import { create } from 'zustand'
import { createRef } from 'react'

const newGameState = {
    score: 0,
    selectedTrack: null,
    hitStreak: 0,
    streakMultiplier: 1,
    startGame: true,
    audioAnalysis: null,
    endGame: false,
}


const useStore = create((set, get) => ({
    set,
    get,
    ...newGameState,
    router: null,
    connected: false,
    spotifyWebPlayer: null,
    currentTrack: null,
    deviceId: null,
    explosions: [],
    ship: createRef(),

    setStartGame: (val) => set({ startGame: val }),

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
            explosions: [
                ...state.explosions,
                { positionX, ts: Date.now() },
            ],
        }))
    },

    resetGame: () => {
        set(() => ({ ...newGameState }))
    },

    setEndGame: () => {
        set(() => ({ audioAnalysis: null, endGame: true, startGame: false }))
    },
}))

export default useStore