import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { StarSystem, Planet, ResourceNode } from '../stores/gameStore'
import { useGameStore } from '../stores/gameStore'

interface StarProps {
  system: StarSystem
}

export default function Star({ system }: StarProps) {
  const meshRef = useRef<Mesh>(null)
  const { camera } = useThree()

  const distance = useMemo(() => {
    return new Vector3(system.x, system.y, system.z).distanceTo(camera.position)
  }, [system.x, system.y, system.z, camera.position])

  // Level of Detail: Different rendering based on distance
  const size = useMemo(() => {
    if (distance < 100) return 2
    if (distance < 300) return 1.5
    if (distance < 600) return 1
    return 0.5
  }, [distance])

  const showPlanets = distance < 500

  // Generate planets for this system
  const planets = useMemo(() => {
    if (!showPlanets) return []

    const generatedPlanets: Planet[] = []
    const colors = ['#8B4513', '#228B22', '#4169E1', '#DC143C', '#FFD700', '#FF6347', '#9370DB', '#32CD32']

    for (let i = 0; i < system.planets; i++) {
      const angle = (i / system.planets) * Math.PI * 2
      const radius = 5 + i * 2
      const planetRadius = 2 + Math.random() * 1.5

      // Generate resource nodes on this planet
      const resources: ResourceNode[] = []
      const numResources = Math.floor(Math.random() * 8) + 3

      for (let j = 0; j < numResources; j++) {
        const resourceAngle = Math.random() * Math.PI * 2
        const resourceRadius = Math.random() * 8
        const resourceX = Math.cos(resourceAngle) * resourceRadius
        const resourceZ = Math.sin(resourceAngle) * resourceRadius
        const resourceY = (Math.random() - 0.5) * 2 // Small height variation

        resources.push({
          id: `resource-${system.id}-${i}-${j}`,
          type: Math.random() > 0.5 ? 'mineral' : 'energy',
          x: resourceX,
          y: resourceY,
          z: resourceZ,
          amount: Math.floor(Math.random() * 50) + 10,
          depleted: false
        })
      }

      generatedPlanets.push({
        id: `planet-${system.id}-${i}`,
        name: `${system.name} ${String.fromCharCode(65 + i)}`,
        systemId: system.id,
        orbitIndex: i,
        radius: planetRadius,
        color: colors[i % colors.length],
        resources
      })
    }

    return generatedPlanets
  }, [system, showPlanets])

  useFrame(() => {
    if (meshRef.current) {
      // Gentle pulsing effect
      const scale = 1 + Math.sin(Date.now() * 0.001 + system.x) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })

  const { landOnPlanet } = useGameStore()
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)

  const handlePlanetClick = (planet: Planet) => {
    landOnPlanet(planet)
  }

  return (
    <group position={[system.x, system.y, system.z]}>
      {/* Star */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color="#ffff88" />
      </mesh>

      {/* Planets (only show when close) */}
      {showPlanets && (
        <group>
          {planets.map((planet) => {
            const angle = (planet.orbitIndex / system.planets) * Math.PI * 2
            const radius = 5 + planet.orbitIndex * 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const isHovered = hoveredPlanet === planet.id

            return (
              <group key={planet.id} position={[x, 0, z]}>
                <mesh
                  onClick={() => handlePlanetClick(planet)}
                  onPointerOver={() => setHoveredPlanet(planet.id)}
                  onPointerOut={() => setHoveredPlanet(null)}
                  scale={isHovered ? 1.2 : 1}
                >
                  <sphereGeometry args={[planet.radius, 12, 12]} />
                  <meshStandardMaterial 
                    color={isHovered ? '#ffffff' : planet.color}
                    emissive={isHovered ? planet.color : '#000000'}
                    emissiveIntensity={isHovered ? 0.5 : 0}
                  />
                </mesh>
                {/* Hover indicator ring */}
                {isHovered && (
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[planet.radius * 1.3, planet.radius * 1.5, 32]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                  </mesh>
                )}
              </group>
            )
          })}
        </group>
      )}
    </group>
  )
}