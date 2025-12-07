import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../stores/gameStore'
import { useRef, useEffect } from 'react'

export default function PlanetControls() {
  const { gameMode, surfacePosition, setSurfacePosition } = useGameStore()
  const keysPressed = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.code)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (gameMode !== 'planetary') return

    const speed = 10 * delta
    const [x, y, z] = surfacePosition
    let newX = x
    let newY = y
    let newZ = z

    if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) {
      newZ -= speed
    }
    if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) {
      newZ += speed
    }
    if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) {
      newX -= speed
    }
    if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) {
      newX += speed
    }
    if (keysPressed.current.has('Space')) {
      newY += speed
    }
    if (keysPressed.current.has('ShiftLeft')) {
      newY -= speed
    }

    if (newX !== x || newY !== y || newZ !== z) {
      setSurfacePosition([newX, newY, newZ])
    }
  })

  return null
}