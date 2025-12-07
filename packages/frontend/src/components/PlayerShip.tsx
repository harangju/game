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
    const offset = new Vector3(0, -1.8, -3) // Closer for visibility, subtle float
    offset.applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).add(offset)

    // Rotate ship to match camera direction
    groupRef.current.rotation.copy(camera.rotation)

    // Add subtle floating animation
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.02 // Subtle float
  })

  return (
    <group ref={groupRef}>
      {/* Main ship body - smaller */}
      <mesh>
        <boxGeometry args={[0.6, 0.25, 1.5]} />
        <meshStandardMaterial color="#00aaff" metalness={0.9} roughness={0.1} emissive="#002244" emissiveIntensity={0.3} />
      </mesh>

      {/* Ship nose/cone (front) - smaller */}
      <mesh position={[0, 0, -0.9]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00aaff" emissiveIntensity={1} />
      </mesh>

      {/* Engine exhaust glow (back) */}
      <mesh position={[0, 0, 1.8]}>
        <cylinderGeometry args={[0.15, 0.5, 0.3]} />
        <meshBasicMaterial color="#0088ff" transparent opacity={0.9} />
      </mesh>

      {/* Wing details - smaller */}
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.6, 0.075, 0.25]} />
        <meshStandardMaterial color="#0066aa" emissive="#003366" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.6, 0.075, 0.25]} />
        <meshStandardMaterial color="#0066aa" emissive="#003366" emissiveIntensity={0.2} />
      </mesh>

      {/* Engine glow effect - adjusted */}
      <pointLight
        position={[0, 0, 0.75]}
        intensity={1}
        color="#00ffff"
        distance={6}
      />
      
      {/* Additional glow around ship */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.25}
        color="#00aaff"
        distance={4}
      />
    </group>
  )
}