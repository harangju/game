import { create } from 'zustand'

export interface StarSystem {
  id: string
  name: string
  x: number
  y: number
  z: number
  planets: number
}

export interface Planet {
  id: string
  name: string
  systemId: string
  orbitIndex: number
  radius: number
  color: string
  resources: ResourceNode[]
}

export interface ResourceNode {
  id: string
  type: 'mineral' | 'energy'
  x: number
  y: number
  z: number
  amount: number
  depleted: boolean
}

export interface Robot {
  id: string
  name: string
  x: number
  y: number
  z: number
  task: 'idle' | 'gathering' | 'returning'
  efficiency: number
  assignedResourceId?: string
  lastHarvestTime: number
}

export type GameMode = 'space' | 'planetary'

export interface Inventory {
  minerals: number
  energy: number
}

export interface GameState {
  // Space navigation
  currentSystem: StarSystem | null
  playerPosition: [number, number, number]
  starSystems: StarSystem[]

  // Planetary mode
  gameMode: GameMode
  currentPlanet: Planet | null
  planets: Planet[]
  surfacePosition: [number, number, number]

  // Resources
  inventory: Inventory

  // Robots
  robots: Robot[]

  // Offline progress
  lastVisitTime: number

  // Actions
  setCurrentSystem: (system: StarSystem | null) => void
  setPlayerPosition: (position: [number, number, number]) => void
  generateStarSystems: () => void
  landOnPlanet: (planet: Planet) => void
  returnToSpace: () => void
  setSurfacePosition: (position: [number, number, number]) => void
  addToInventory: (type: keyof Inventory, amount: number) => void

  // Robot actions
  createRobot: (x: number, y: number, z: number) => void
  assignRobotToResource: (robotId: string, resourceId: string) => void
  updateRobotPosition: (robotId: string, x: number, y: number, z: number) => void
  updateRobotTask: (robotId: string, task: Robot['task']) => void
  upgradeRobot: (robotId: string) => void

  // Offline progress
  processOfflineProgress: () => void
}

// Process offline progress on store creation
const processOfflineProgressOnLoad = () => {
  setTimeout(() => {
    get().processOfflineProgress()
  }, 100) // Small delay to ensure store is fully initialized
}

export const useGameStore = create<GameState>((set, get) => ({
  // Space navigation
  currentSystem: null,
  playerPosition: [0, 0, 0],
  starSystems: [],

  // Planetary mode
  gameMode: 'space',
  currentPlanet: null,
  planets: [],
  surfacePosition: [0, 0, 0],

  // Resources
  inventory: (() => {
    try {
      const saved = localStorage.getItem('game-inventory')
      return saved ? JSON.parse(saved) : { minerals: 0, energy: 0 }
    } catch {
      return { minerals: 0, energy: 0 }
    }
  })(),

  // Robots
  robots: (() => {
    try {
      const saved = localStorage.getItem('game-robots')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })(),

  // Offline progress
  lastVisitTime: (() => {
    try {
      const saved = localStorage.getItem('game-lastVisit')
      return saved ? parseInt(saved) : Date.now()
    } catch {
      return Date.now()
    }
  })(),

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
  },

  landOnPlanet: (planet) => {
    set({
      gameMode: 'planetary',
      currentPlanet: planet,
      surfacePosition: [0, 2, 0] // Start on the surface
    })
  },

  returnToSpace: () => {
    set({
      gameMode: 'space',
      currentPlanet: null,
      surfacePosition: [0, 0, 0]
    })
  },

  setSurfacePosition: (position) => set({ surfacePosition: position }),

  addToInventory: (type, amount) => {
    set((state) => {
      const newInventory = {
        ...state.inventory,
        [type]: state.inventory[type] + amount
      }
      localStorage.setItem('game-inventory', JSON.stringify(newInventory))
      return { inventory: newInventory }
    })
  },

  createRobot: (x, y, z) => {
    set((state) => {
      const newRobots = [...state.robots, {
        id: `robot-${Date.now()}`,
        name: `Robot ${state.robots.length + 1}`,
        x,
        y,
        z,
        task: 'idle',
        efficiency: 1,
        lastHarvestTime: Date.now()
      }]
      localStorage.setItem('game-robots', JSON.stringify(newRobots))
      return { robots: newRobots }
    })
  },

  assignRobotToResource: (robotId, resourceId) => {
    set((state) => ({
      robots: state.robots.map(robot =>
        robot.id === robotId
          ? { ...robot, assignedResourceId: resourceId, task: 'gathering' }
          : robot
      )
    }))
  },

  updateRobotPosition: (robotId, x, y, z) => {
    set((state) => ({
      robots: state.robots.map(robot =>
        robot.id === robotId
          ? { ...robot, x, y, z }
          : robot
      )
    }))
  },

  updateRobotTask: (robotId, task) => {
    set((state) => {
      const newRobots = state.robots.map(robot =>
        robot.id === robotId
          ? { ...robot, task }
          : robot
      )
      localStorage.setItem('game-robots', JSON.stringify(newRobots))
      return { robots: newRobots }
    })
  },

  upgradeRobot: (robotId) => {
    const robot = get().robots.find(r => r.id === robotId)
    if (!robot) return

    const upgradeCost = robot.efficiency * 10 // 10 minerals per efficiency level
    if (get().inventory.minerals < upgradeCost) return

    set((state) => {
      const newInventory = {
        ...state.inventory,
        minerals: state.inventory.minerals - upgradeCost
      }
      localStorage.setItem('game-inventory', JSON.stringify(newInventory))

      const newRobots = state.robots.map(r =>
        r.id === robotId
          ? { ...r, efficiency: r.efficiency + 1 }
          : r
      )
      localStorage.setItem('game-robots', JSON.stringify(newRobots))

      return { inventory: newInventory, robots: newRobots }
    })
  },

  processOfflineProgress: () => {
    const now = Date.now()
    const timeDiff = now - get().lastVisitTime

    if (timeDiff < 60000) return // Only process if offline for more than 1 minute

    const offlineHours = timeDiff / (1000 * 60 * 60)
    let totalOfflineGains = { minerals: 0, energy: 0 }

    // Simulate robot activity during offline time
    get().robots.forEach(robot => {
      if (robot.task === 'gathering' && robot.assignedResourceId) {
        // Find the assigned planet and resource
        const planet = get().planets.find(p =>
          p.resources.some(r => r.id === robot.assignedResourceId)
        )
        if (planet) {
          const resource = planet.resources.find(r => r.id === robot.assignedResourceId)
          if (resource && !resource.depleted) {
            // Calculate offline harvest (robot efficiency * hours offline * harvest rate)
            const offlineHarvest = Math.min(
              Math.floor(robot.efficiency * offlineHours * 10), // 10 per hour per efficiency
              resource.amount
            )

            if (resource.type === 'mineral') {
              totalOfflineGains.minerals += offlineHarvest
            } else {
              totalOfflineGains.energy += offlineHarvest
            }

            resource.amount -= offlineHarvest
            if (resource.amount <= 0) {
              resource.depleted = true
            }
          }
        }
      }
    })

    // Add offline gains to inventory
    if (totalOfflineGains.minerals > 0 || totalOfflineGains.energy > 0) {
      get().addToInventory('minerals', totalOfflineGains.minerals)
      get().addToInventory('energy', totalOfflineGains.energy)

      // Show offline progress message (we'll add this to UI later)
      console.log(`Offline progress: +${totalOfflineGains.minerals} minerals, +${totalOfflineGains.energy} energy`)
    }

    set({ lastVisitTime: now })
    localStorage.setItem('game-lastVisit', now.toString())
  }
}))

// Process offline progress when store is created
processOfflineProgressOnLoad()