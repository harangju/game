import { create } from 'zustand'

export interface StarSystem {
  id: string
  name: string
  x: number
  y: number
  z: number
  planets: Planet[]
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
  playerPosition: [0, 0, 3000],
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
    const numPlanets = Math.floor(Math.random() * 5) + 4 // 4-8 planets
    const rockyColors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E']
    const gasColors = ['#4169E1', '#9370DB', '#FF6347', '#FFD700']
    const innerCount = Math.floor(numPlanets / 2)

    const generatedPlanets: Planet[] = []

    for (let i = 0; i < numPlanets; i++) {
      let orbitRadius, planetRadius, color, isInner

      if (i < innerCount) {
        // Inner rocky planets
        isInner = true
        orbitRadius = (4 + i * 3) * 50 // 200, 350, 500, ...
        planetRadius = 0.5 + Math.random()
        color = rockyColors[i % rockyColors.length]
      } else {
        // Outer gas giants
        isInner = false
        const outerIndex = i - innerCount
        orbitRadius = (20 + outerIndex * 8) * 50 // 1000, 1400, 1800, ...
        planetRadius = 2.5 + Math.random() * 1.5
        color = gasColors[(i - innerCount) % gasColors.length]
      }

      // Generate resource nodes
      const resources: ResourceNode[] = []
      const numResources = Math.floor(Math.random() * 8) + 3

      for (let j = 0; j < numResources; j++) {
        const resourceAngle = Math.random() * Math.PI * 2
        const resourceRadius = Math.random() * 8
        const resourceX = Math.cos(resourceAngle) * resourceRadius
        const resourceZ = Math.sin(resourceAngle) * resourceRadius
        const resourceY = (Math.random() - 0.5) * 2

        // Bias resources by planet type
        let type: 'mineral' | 'energy'
        if (isInner) {
          type = Math.random() < 0.7 ? 'mineral' : 'energy'
        } else {
          type = Math.random() < 0.3 ? 'mineral' : 'energy'
        }

        resources.push({
          id: `resource-sol-${i}-${j}`,
          type,
          x: resourceX,
          y: resourceY,
          z: resourceZ,
          amount: Math.floor(Math.random() * 50) + 10,
          depleted: false
        })
      }

      generatedPlanets.push({
        id: `planet-sol-${i}`,
        name: `Sol ${String.fromCharCode(65 + i)}`,
        systemId: 'sol',
        orbitIndex: i,
        radius: planetRadius,
        color,
        resources
      })
    }

    const solSystem: StarSystem = {
      id: 'sol',
      name: 'Sol',
      x: 0,
      y: 0,
      z: 0,
      planets: generatedPlanets
    }

    set({ 
      starSystems: [solSystem],
      currentSystem: solSystem 
    })
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