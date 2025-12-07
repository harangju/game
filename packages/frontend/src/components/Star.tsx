import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { StarSystem } from '../stores/gameStore'

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

  const showPlanets = distance < 200

  useFrame(() => {
    if (meshRef.current) {
      // Gentle pulsing effect
      const scale = 1 + Math.sin(Date.now() * 0.001 + system.x) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group position={[system.x, system.y, system.z]}>
      {/* Star */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color="#ffff88" />
      </mesh>

      {/* Planet markers (only show when close) */}
      {showPlanets && (
        <group>
          {Array.from({ length: system.planets }, (_, i) => {
            const angle = (i / system.planets) * Math.PI * 2
            const radius = 5 + i * 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius

            return (
              <mesh key={i} position={[x, 0, z]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#4444ff" />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}