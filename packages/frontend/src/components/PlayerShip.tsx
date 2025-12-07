import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { useGameStore } from '../stores/gameStore'

export default function PlayerShip() {
  const meshRef = useRef<Mesh>(null)
  const { playerPosition } = useGameStore()
  const [previousPosition] = useState(new Vector3(...playerPosition))
  const [velocity] = useState(new Vector3())

  useFrame((state) => {
    if (meshRef.current) {
      const currentPos = new Vector3(...playerPosition)

      // Calculate velocity
      velocity.copy(currentPos).sub(previousPosition)
      previousPosition.copy(currentPos)

      // Position the ship slightly behind and below the camera
      const shipOffset = new Vector3(0, -2, 5)
      shipOffset.applyEuler(meshRef.current.rotation)
      meshRef.current.position.copy(currentPos).add(shipOffset)

      // Rotate ship based on velocity
      if (velocity.length() > 0.1) {
        const targetRotation = Math.atan2(velocity.x, velocity.z)
        meshRef.current.rotation.y = targetRotation
      }

      // Add some floating animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.05

      // Add engine glow effect by scaling
      const speed = velocity.length()
      const scale = 1 + speed * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.5, 2, 8]} />
      <meshStandardMaterial color="#00ffff" emissive="#002222" />
    </mesh>
  )
}