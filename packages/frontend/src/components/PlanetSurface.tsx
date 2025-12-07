import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Mesh, PlaneGeometry, Vector3 } from 'three'
import { useGameStore, ResourceNode } from '../stores/gameStore'

export default function PlanetSurface() {
  const { currentPlanet, surfacePosition, setSurfacePosition, addToInventory, robots, updateRobotPosition, updateRobotTask, assignRobotToResource } = useGameStore()
  const terrainRef = useRef<Mesh>(null)
  const { camera, scene } = useThree()
  const [harvestingNodes, setHarvestingNodes] = useState<Set<string>>(new Set())
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null)

  // Generate heightmap-based terrain
  const terrainGeometry = useMemo(() => {
    if (!currentPlanet) return null

    const size = 100
    const segments = 64
    const geometry = new PlaneGeometry(size, size, segments, segments)

    // Generate heightmap
    const vertices = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const z = vertices[i + 2]

      // Simple noise-based heightmap
      const height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 +
                    Math.sin(x * 0.05) * Math.cos(z * 0.05) * 5 +
                    (Math.random() - 0.5) * 0.5

      vertices[i + 1] = height
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  }, [currentPlanet])

  // Harvest a resource node or assign robot to it
  const handleResourceClick = (resource: ResourceNode) => {
    if (selectedRobotId) {
      // Assign selected robot to this resource
      assignRobotToResource(selectedRobotId, resource.id)
      setSelectedRobotId(null)
      return
    }

    // Regular harvesting
    if (resource.depleted || harvestingNodes.has(resource.id)) return

    setHarvestingNodes(prev => new Set(prev).add(resource.id))

    // Simulate harvesting time
    setTimeout(() => {
      const harvestAmount = Math.min(10, resource.amount)
      addToInventory(resource.type, harvestAmount)

      // Mark as depleted if fully harvested
      if (harvestAmount >= resource.amount) {
        resource.depleted = true
      } else {
        resource.amount -= harvestAmount
      }

      setHarvestingNodes(prev => {
        const newSet = new Set(prev)
        newSet.delete(resource.id)
        return newSet
      })
    }, 1000) // 1 second harvesting time
  }

  // Select robot for assignment
  const handleRobotClick = (robotId: string) => {
    setSelectedRobotId(selectedRobotId === robotId ? null : robotId)
  }

  // Robot AI logic
  useFrame((state, delta) => {
    if (!currentPlanet) return

    const now = Date.now()

    robots.forEach(robot => {
      if (robot.task === 'gathering' && robot.assignedResourceId) {
        const resource = currentPlanet.resources.find(r => r.id === robot.assignedResourceId)
        if (!resource || resource.depleted) {
          // Resource depleted or gone, return to idle
          updateRobotTask(robot.id, 'idle')
          return
        }

        // Move towards resource
        const dx = resource.x - robot.x
        const dz = resource.z - robot.z
        const distance = Math.sqrt(dx * dx + dz * dz)

        if (distance > 0.5) {
          // Move towards resource
          const speed = 2 * delta
          const newX = robot.x + (dx / distance) * speed
          const newZ = robot.z + (dz / distance) * speed
          updateRobotPosition(robot.id, newX, resource.y, newZ)
        } else {
          // At resource, harvest periodically
          if (now - robot.lastHarvestTime > 2000) { // Harvest every 2 seconds
            const harvestAmount = Math.min(robot.efficiency, resource.amount)
            addToInventory(resource.type, harvestAmount)
            resource.amount -= harvestAmount

            if (resource.amount <= 0) {
              resource.depleted = true
              updateRobotTask(robot.id, 'idle')
            }
          }
        }
      }
    })
  })

  // Update camera position for surface view - third person behind player
  useFrame(() => {
    if (currentPlanet) {
      // Third-person camera: behind and above player, looking forward
      const cameraHeight = 8
      const cameraDistance = 12
      camera.position.set(
        surfacePosition[0] - cameraDistance * 0.3,
        surfacePosition[1] + cameraHeight,
        surfacePosition[2] + cameraDistance
      )
      // Look ahead of player, not directly at them
      camera.lookAt(
        surfacePosition[0],
        surfacePosition[1] + 2,
        surfacePosition[2] - 5
      )
    }
  })

  if (!currentPlanet || !terrainGeometry) return null

  return (
    <group>
      {/* Sky/Atmosphere */}
      <mesh>
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial color="#1a1a2e" side={2} /> {/* Back side, dark blue sky */}
      </mesh>

      {/* Terrain - more visible with better material */}
      <mesh ref={terrainRef} geometry={terrainGeometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#3d6b2d" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Ground plane for better visibility */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>

      {/* Resource nodes */}
      {currentPlanet.resources.map((resource) => {
        const isHarvesting = harvestingNodes.has(resource.id)
        const isDepleted = resource.depleted
        const isTargeted = selectedRobotId !== null

        return (
          <group key={resource.id} position={[resource.x, resource.y + 1, resource.z]}>
            <mesh
              onClick={() => handleResourceClick(resource)}
              scale={isHarvesting ? [1.5, 1.5, 1.5] : isTargeted ? [1.3, 1.3, 1.3] : [1, 1, 1]}
            >
              <boxGeometry args={[1.2, 2.5, 1.2]} />
              <meshStandardMaterial
                color={
                  isDepleted ? '#666666' :
                  isHarvesting ? '#ffffff' :
                  resource.type === 'mineral' ? '#8B4513' : '#FFD700'
                }
                emissive={
                  isDepleted ? '#000000' :
                  resource.type === 'mineral' ? '#4a2513' : '#ffaa00'
                }
                emissiveIntensity={isDepleted ? 0 : 0.4}
                transparent={isHarvesting || isTargeted}
                opacity={isHarvesting ? 0.8 : isTargeted ? 0.9 : 1}
              />
            </mesh>
            {/* Glow effect for visibility */}
            {!isDepleted && (
              <pointLight
                position={[0, 1.5, 0]}
                intensity={resource.type === 'energy' ? 1 : 0.3}
                color={resource.type === 'mineral' ? '#8B4513' : '#FFD700'}
                distance={resource.type === 'energy' ? 8 : 5}
              />
            )}
            {/* Indicator ring on ground */}
            {!isDepleted && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[0.8, 1.2, 16]} />
                <meshBasicMaterial 
                  color={resource.type === 'mineral' ? '#8B4513' : '#FFD700'} 
                  transparent 
                  opacity={0.5} 
                />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Player representation on surface - clearer avatar */}
      <group position={surfacePosition}>
        {/* Body */}
        <mesh position={[0, 1, 0]}>
          <capsuleGeometry args={[0.4, 1.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#444444" emissiveIntensity={0.3} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        {/* Light above player */}
        <pointLight
          position={[0, 2.5, 0]}
          intensity={0.5}
          color="#ffffff"
          distance={5}
        />
      </group>

      {/* Robots */}
      {robots.map((robot) => {
        const isSelected = selectedRobotId === robot.id
        return (
          <group key={robot.id}>
            <mesh
              position={[robot.x, robot.y + 0.3, robot.z]}
              onClick={() => handleRobotClick(robot.id)}
              scale={isSelected ? [1.5, 1.5, 1.5] : [1, 1, 1]}
            >
              <boxGeometry args={[0.6, 1, 0.6]} />
              <meshLambertMaterial
                color={
                  isSelected ? '#ffffff' :
                  robot.task === 'idle' ? '#888888' :
                  robot.task === 'gathering' ? '#00ff00' :
                  '#ffff00'
                }
              />
            </mesh>
            {/* Add small light for selected robots */}
            {isSelected && (
              <pointLight
                position={[robot.x, robot.y + 1, robot.z]}
                intensity={0.5}
                color="#ffffff"
                distance={2}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}