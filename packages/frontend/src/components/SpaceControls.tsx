import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Euler } from 'three'
import { useGameStore } from '../stores/gameStore'

export default function SpaceControls() {
  const { camera } = useThree()
  const { setPlayerPosition } = useGameStore()

  const keysRef = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false
  })

  const mouseRef = useRef({
    x: 0,
    y: 0,
    isLocked: false
  })

  const velocityRef = useRef(new Vector3())
  const directionRef = useRef(new Vector3())

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code.toLowerCase()) {
        case 'keyw':
          keysRef.current.w = true
          break
        case 'keya':
          keysRef.current.a = true
          break
        case 'keys':
          keysRef.current.s = true
          break
        case 'keyd':
          keysRef.current.d = true
          break
        case 'shiftleft':
        case 'shiftright':
          keysRef.current.shift = true
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code.toLowerCase()) {
        case 'keyw':
          keysRef.current.w = false
          break
        case 'keya':
          keysRef.current.a = false
          break
        case 'keys':
          keysRef.current.s = false
          break
        case 'keyd':
          keysRef.current.d = false
          break
        case 'shiftleft':
        case 'shiftright':
          keysRef.current.shift = false
          break
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseRef.current.isLocked) return

      const sensitivity = 0.002
      mouseRef.current.x -= event.movementX * sensitivity
      mouseRef.current.y -= event.movementY * sensitivity

      mouseRef.current.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseRef.current.y))
    }

    const handleClick = () => {
      document.body.requestPointerLock()
    }

    const handlePointerLockChange = () => {
      mouseRef.current.isLocked = document.pointerLockElement !== null
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [])

  useFrame((state, delta) => {
    const speed = keysRef.current.shift ? 50 : 25

    // Calculate movement direction
    directionRef.current.set(0, 0, 0)

    if (keysRef.current.w) directionRef.current.z -= 1
    if (keysRef.current.s) directionRef.current.z += 1
    if (keysRef.current.a) directionRef.current.x -= 1
    if (keysRef.current.d) directionRef.current.x += 1

    // Normalize and scale by speed
    if (directionRef.current.length() > 0) {
      directionRef.current.normalize()
      directionRef.current.multiplyScalar(speed * delta)
    }

    // Apply camera rotation to movement
    directionRef.current.applyEuler(new Euler(0, mouseRef.current.x, 0))

    // Update velocity with damping
    velocityRef.current.lerp(directionRef.current, 0.1)

    // Update camera position
    camera.position.add(velocityRef.current)

    // Update camera rotation
    camera.rotation.set(mouseRef.current.y, mouseRef.current.x, 0, 'YXZ')

    // Update player position in store
    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z])
  })

  return null
}