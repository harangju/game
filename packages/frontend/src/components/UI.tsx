import { useGameStore } from '../stores/gameStore'

export default function UI() {
  const { currentSystem } = useGameStore()

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '14px',
      pointerEvents: 'none'
    }}>
      <div>System: {currentSystem?.name || 'Unknown'}</div>
      <div>Position: {currentSystem ? `${currentSystem.x.toFixed(1)}, ${currentSystem.y.toFixed(1)}, ${currentSystem.z.toFixed(1)}` : '0, 0, 0'}</div>
    </div>
  )
}