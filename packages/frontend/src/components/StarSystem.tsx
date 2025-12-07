import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import Star from './Star'
import { useThree } from '@react-three/fiber'

export default function StarSystem() {
  const { starSystems, generateStarSystems, setCurrentSystem } = useGameStore()
  const { camera } = useThree()

  useEffect(() => {
    generateStarSystems()
  }, [generateStarSystems])

  // Find the closest star system to the camera
  useEffect(() => {
    if (starSystems.length === 0) return

    const closest = starSystems.reduce((closest, system) => {
      const distance = Math.sqrt(
        Math.pow(system.x - camera.position.x, 2) +
        Math.pow(system.y - camera.position.y, 2) +
        Math.pow(system.z - camera.position.z, 2)
      )
      const closestDistance = Math.sqrt(
        Math.pow(closest.x - camera.position.x, 2) +
        Math.pow(closest.y - camera.position.y, 2) +
        Math.pow(closest.z - camera.position.z, 2)
      )
      return distance < closestDistance ? system : closest
    })

    setCurrentSystem(closest)
  }, [starSystems, camera.position, setCurrentSystem])

  return (
    <group>
      {starSystems.map((system) => (
        <Star key={system.id} system={system} />
      ))}
    </group>
  )
}