import { useMemo } from 'react'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export default function Starfield() {
  const starPositions = useMemo(() => {
    const positions = new Float32Array(10000 * 3)

    for (let i = 0; i < 10000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4000
    }

    return positions
  }, [])

  return (
    <Points positions={starPositions}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={2}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  )
}