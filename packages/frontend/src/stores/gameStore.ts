import { create } from 'zustand'

export interface StarSystem {
  id: string
  name: string
  x: number
  y: number
  z: number
  planets: number
}

export interface GameState {
  currentSystem: StarSystem | null
  playerPosition: [number, number, number]
  starSystems: StarSystem[]
  setCurrentSystem: (system: StarSystem | null) => void
  setPlayerPosition: (position: [number, number, number]) => void
  generateStarSystems: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  currentSystem: null,
  playerPosition: [0, 0, 0],
  starSystems: [],

  setCurrentSystem: (system) => set({ currentSystem: system }),
  setPlayerPosition: (position) => set({ playerPosition: position }),

  generateStarSystems: () => {
    const systems: StarSystem[] = []
    const numSystems = 50

    for (let i = 0; i < numSystems; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = (Math.random() - 0.5) * 2000
      const planets = Math.floor(Math.random() * 8) + 1

      systems.push({
        id: `system-${i}`,
        name: `System ${i + 1}`,
        x,
        y,
        z,
        planets
      })
    }

    set({ starSystems: systems })
  }
}))