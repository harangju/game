import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { useGameStore } from '../stores/gameStore'

export default function PlayerShip() {
  const groupRef = useRef<Group>(null)
  const { camera } = useThree()
  const { playerPosition, gameMode } = useGameStore()

  // Only show in space mode
  if (gameMode !== 'space') return null

  useFrame((state) => {
    if (!groupRef.current) return

    // Position ship in bottom lower-middle of screen (hover view)
    // Centered horizontally, lower vertically, forward enough to be visible
    const offset = new Vector3(0, -3.5, -4) // Centered, lower, forward
    offset.applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).add(offset)

    // Rotate ship to match camera direction
    groupRef.current.rotation.copy(camera.rotation)

    // Add subtle floating animation
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.1
  })

  return (
    <group ref={groupRef}>
      {/* Main ship body - bigger and brighter */}
      <mesh>
        <boxGeometry args={[1.2, 0.5, 3]} />
        <meshStandardMaterial color="#00aaff" metalness={0.9} roughness={0.1} emissive="#002244" emissiveIntensity={0.3} />
      </mesh>

      {/* Ship nose/cone (front) - brighter */}
      <mesh position={[0, 0, -1.8]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00aaff" emissiveIntensity={1} />
      </mesh>

      {/* Engine exhaust glow (back) */}
      <mesh position={[0, 0, 1.8]}>
        <cylinderGeometry args={[0.15, 0.5, 0.3]} />
        <meshBasicMaterial color="#0088ff" transparent opacity={0.9} />
      </mesh>

      {/* Wing details - more visible */}
      <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[1.2, 0.15, 0.5]} />
        <meshStandardMaterial color="#0066aa" emissive="#003366" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[1.2, 0.15, 0.5]} />
        <meshStandardMaterial color="#0066aa" emissive="#003366" emissiveIntensity={0.2} />
      </mesh>

      {/* Engine glow effect - brighter */}
      <pointLight
        position={[0, 0, 2.4]}
        intensity={2}
        color="#00ffff"
        distance={12}
      />
      
      {/* Additional glow around ship */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5}
        color="#00aaff"
        distance={8}
      />
    </group>
  )
}