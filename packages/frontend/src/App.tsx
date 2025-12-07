import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import GameScene from './components/GameScene'
import UI from './components/UI'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: '#000011' }}
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
      <UI />
    </div>
  )
}

export default App