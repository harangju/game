import { useGameStore } from '../stores/gameStore'

export default function UI() {
  const { currentSystem, gameMode, currentPlanet, surfacePosition, inventory, returnToSpace, createRobot, robots, upgradeRobot } = useGameStore()

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
      {gameMode === 'space' ? (
        <>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            SPACE EXPLORATION
          </div>
          <div>System: {currentSystem?.name || 'Unknown'}</div>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(0, 255, 255, 0.1)', borderRadius: '5px', border: '1px solid #00ffff' }}>
            <div style={{ fontSize: '14px', color: '#00ffff', fontWeight: 'bold', marginBottom: '5px' }}>
              🚀 CONTROLS:
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.6' }}>
              <div>• <strong>WASD</strong> - Move forward/back/left/right</div>
              <div>• <strong>Shift</strong> - Move faster</div>
              <div>• <strong>Right-click + drag</strong> - Look around</div>
              <div>• <strong>Left-click planets</strong> - Land on planet</div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            PLANETARY SURFACE
          </div>
          <div>Planet: {currentPlanet?.name || 'Unknown'}</div>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(0, 255, 0, 0.1)', borderRadius: '5px', border: '1px solid #00ff00' }}>
            <div style={{ fontSize: '14px', color: '#00ff00', fontWeight: 'bold', marginBottom: '8px' }}>
              🪨 WHAT YOU'RE SEEING:
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.8' }}>
              <div>• <strong style={{color: '#ffffff'}}>White figure</strong> = You (the player)</div>
              <div>• <strong style={{color: '#8B4513'}}>Brown glowing boxes</strong> = Minerals (click to harvest)</div>
              <div>• <strong style={{color: '#FFD700'}}>Yellow glowing boxes</strong> = Energy crystals (click to harvest)</div>
              <div>• <strong style={{color: '#888888'}}>Grey boxes</strong> = Robots (click to select, then click resource to assign)</div>
            </div>
            <div style={{ fontSize: '12px', color: '#00ff00', fontWeight: 'bold', marginTop: '10px', marginBottom: '5px' }}>
              🎮 CONTROLS:
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.6' }}>
              <div>• <strong>WASD</strong> - Move around</div>
              <div>• <strong>Space</strong> - Move up</div>
              <div>• <strong>Shift</strong> - Move down</div>
              <div>• <strong>Click resources</strong> - Harvest them</div>
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={returnToSpace}
              style={{
                padding: '5px 10px',
                backgroundColor: '#444',
                color: 'white',
                border: '1px solid #666',
                borderRadius: '3px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                fontSize: '12px',
                marginRight: '5px'
              }}
            >
              Return to Space
            </button>
            <button
              onClick={() => createRobot(surfacePosition[0], surfacePosition[1], surfacePosition[2])}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: '2px solid #4CAF50',
                borderRadius: '5px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🤖 Create Robot ({robots.length})
            </button>
          </div>
        </>
      )}

      {/* Inventory */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Inventory</div>
        <div>Minerals: {inventory.minerals}</div>
        <div>Energy: {inventory.energy}</div>
      </div>

      {/* Robot Management */}
      {robots.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          maxHeight: '250px',
          overflowY: 'auto',
          border: '2px solid #333'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#00ff00' }}>
            🤖 Robots - Click robot then resource to assign!
          </div>
          {robots.map((robot) => {
            const upgradeCost = robot.efficiency * 10
            const canAfford = inventory.minerals >= upgradeCost

            return (
              <div key={robot.id} style={{
                marginBottom: '8px',
                padding: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '12px' }}>
                  {robot.name} - Eff: {robot.efficiency}
                </div>
                <div style={{ fontSize: '11px', color: '#ccc' }}>
                  {robot.task}
                </div>
                <button
                  onClick={() => upgradeRobot(robot.id)}
                  disabled={!canAfford}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: canAfford ? '#2d5016' : '#666',
                    color: 'white',
                    border: canAfford ? '2px solid #4CAF50' : '2px solid #888',
                    borderRadius: '4px',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    marginTop: '4px',
                    fontWeight: 'bold'
                  }}
                >
                  ⬆️ Upgrade ({upgradeCost} 💎)
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}