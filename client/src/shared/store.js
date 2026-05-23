import { create } from 'zustand'


const useStore = create((set) => ({
    startGame: false,
    setStartGame: (val) => set({ startGame: val }),
}))

export default useStore