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

  // Set the single Sol system as current
  useEffect(() => {
    if (starSystems.length > 0) {
      setCurrentSystem(starSystems[0])
    }
  }, [starSystems, setCurrentSystem])

  return (
    <group>
      {starSystems.map((system) => (
        <Star key={system.id} system={system} />
      ))}
    </group>
  )
}