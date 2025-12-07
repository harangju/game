import { useRef } from 'react'
import { Group } from 'three'
import Starfield from './Starfield'
import PlayerShip from './PlayerShip'
import StarSystem from './StarSystem'
import SpaceControls from './SpaceControls'
import PlanetSurface from './PlanetSurface'
import PlanetControls from './PlanetControls'
import { useGameStore } from '../stores/gameStore'

export default function GameScene() {
  const sceneRef = useRef<Group>(null)
  const { gameMode } = useGameStore()

  return (
    <group ref={sceneRef}>
      {/* Lighting for space scene */}
      {gameMode === 'space' && (
        <>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
        </>
      )}

      {/* Lighting for planetary scene */}
      {gameMode === 'planetary' && (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
        </>
      )}

      {gameMode === 'space' ? (
        <>
          <Starfield />
          <PlayerShip />
          <StarSystem />
          <SpaceControls />
        </>
      ) : (
        <>
          <PlanetSurface />
          <PlanetControls />
        </>
      )}
    </group>
  )
}