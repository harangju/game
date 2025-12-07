import { useRef } from 'react'
import { Group } from 'three'
import Starfield from './Starfield'
import PlayerShip from './PlayerShip'
import StarSystem from './StarSystem'
import SpaceControls from './SpaceControls'

export default function GameScene() {
  const sceneRef = useRef<Group>(null)

  return (
    <group ref={sceneRef}>
      <Starfield />
      <PlayerShip />
      <StarSystem />
      <SpaceControls />
    </group>
  )
}