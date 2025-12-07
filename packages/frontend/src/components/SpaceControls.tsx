import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useGameStore } from '../stores/gameStore'

export default function SpaceControls() {
  const { camera } = useThree()
  const { setPlayerPosition, gameMode } = useGameStore()

  // Only active in space mode
  if (gameMode !== 'space') return null

  const keysRef = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false
  })

  const mouseRef = useRef({
    yaw: 0,
    pitch: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0
  })

  const velocityRef = useRef(new Vector3())

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

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 2) { // Right click
        event.preventDefault()
        mouseRef.current.isDragging = true
        mouseRef.current.lastX = event.clientX
        mouseRef.current.lastY = event.clientY
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        mouseRef.current.isDragging = false
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseRef.current.isDragging) return

      const deltaX = event.clientX - mouseRef.current.lastX
      const deltaY = event.clientY - mouseRef.current.lastY

      const sensitivity = 0.003
      mouseRef.current.yaw -= deltaX * sensitivity
      mouseRef.current.pitch -= deltaY * sensitivity

      // Clamp pitch
      mouseRef.current.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseRef.current.pitch))

      mouseRef.current.lastX = event.clientX
      mouseRef.current.lastY = event.clientY
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  useFrame((state, delta) => {
    // Update camera rotation from mouse
    camera.rotation.order = 'YXZ'
    camera.rotation.y = mouseRef.current.yaw
    camera.rotation.x = mouseRef.current.pitch

    // Calculate movement direction relative to camera
    const forward = new Vector3(0, 0, -1)
    const right = new Vector3(1, 0, 0)
    const up = new Vector3(0, 1, 0)

    forward.applyQuaternion(camera.quaternion)
    right.applyQuaternion(camera.quaternion)
    up.applyQuaternion(camera.quaternion)

    // Build movement vector
    const moveDir = new Vector3(0, 0, 0)
    if (keysRef.current.w) moveDir.add(forward)
    if (keysRef.current.s) moveDir.sub(forward)
    if (keysRef.current.a) moveDir.sub(right)
    if (keysRef.current.d) moveDir.add(right)

    // Normalize and apply speed
    if (moveDir.length() > 0) {
      moveDir.normalize()
      const speed = keysRef.current.shift ? 50 : 25
      moveDir.multiplyScalar(speed * delta)
    }

    // Apply movement with smooth damping
    velocityRef.current.lerp(moveDir, 0.2)
    camera.position.add(velocityRef.current)

    // Update player position in store
    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z])
  })

  return null
}