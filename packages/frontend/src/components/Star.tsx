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
    if (distance < 500) return 25
    if (distance < 1500) return 20
    if (distance < 3000) return 15
    if (distance < 5000) return 10
    if (distance < 10000) return 5
    return 2
  }, [distance])

  const showPlanets = distance < 10000

  // Use pre-generated planets from the system
  const planets = useMemo(() => {
    if (!showPlanets || !system.planets) return []
    return system.planets
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
      {/* Sun light - brighter */}
      <pointLight
        position={[0, 0, 0]}
        intensity={10}
        color="#ffff88"
        distance={10000}
      />

      {/* Planets (only show when close) */}
      {showPlanets && (
        <group>
          {planets.map((planet) => {
            // Pre-calculated positions from generation
            const angle = (planet.orbitIndex / system.planets.length) * Math.PI * 2
            const radius = planet.orbitIndex < system.planets.length / 2 
              ? (4 + planet.orbitIndex * 3) * 10 
              : (20 + (planet.orbitIndex - Math.floor(system.planets.length / 2)) * 8) * 10
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
                    emissive={planet.color}
                    emissiveIntensity={isHovered ? 2 : 1}
                    roughness={planet.orbitIndex < system.planets.length / 2 ? 0.9 : 0.3}
                    metalness={planet.orbitIndex < system.planets.length / 2 ? 0.1 : 0.4}
                  />
                </mesh>
                {/* Planet light - local glow */}
                <pointLight
                  position={[0, 0, 0]}
                  intensity={planet.orbitIndex < system.planets.length / 2 ? 0.5 : 1.5} // Dimmer for rocky, brighter for gas
                  color={planet.color}
                  distance={Math.max(planet.radius * 20, 50)}
                />
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