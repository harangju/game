# Game

## Tech stack

Core:

- Frontend: React + React Three Fiber (R3F), Three.js/WebGL, Zustand for lightweight state (player positions, UI)
- Backend: Bun, Elysia, Socket.io
- Database: Postgres or Firestore for persistence. Memorystore for sessions/caching
- Auth: Firebase Auth or Better Auth, JWT with bun
- Scaling: Colyseus on Bun for authoritative logic (anti-cheat, physics), offload heavy sim to workers

GCP Deployment:

- Servers: Cloud Run (serverless containers) for Bun app—use official Bun Docker image (oven/bun). Auto-scales to 1000s of players; deploy via gcloud run deploy.
- Game Servers: Agones (GCP Game Servers) for managed fleets—containerize Bun/Colyseus, allocate VMs dynamically for low-latency zones.
- Networking: Global Load Balancer + Cloud CDN for assets; Pub/Sub for async events (e.g., notifications).
- Storage: Cloud Storage for 3D models/textures/sounds.
- Monitoring: Cloud Monitoring/Logging; start with free tier (~$300/month for small MMO).

## Game desiderata

1. Persistence of effort: The effort players invest in skills, items, and progress persists across sessions, creating a lasting world that rewards dedication in the full MMO.
2. Social interaction: Players can engage with others through collaborative play, competitive combat, and economic systems, fostering community and dynamic multiplayer experiences.
3. Low barrier to entry: Onboard players quickly with minimal setup (e.g., no downloads, instant play via browser), but scale depth for long-term engagement. This counters web friction and leverages Bun's speed for fast loads.
4. Balanced risk-reward: Actions (e.g., combat, trades) carry meaningful stakes, but losses feel fair and recoverable. Prevents frustration in persistent worlds; ties into anti-cheat via Colyseus.
5. Modular progression: Players build skills/items that compound over time, but allow flexible paths (solo vs. group). Supports economic interactions without forcing grind.
6. Global accessibility: Optimize for diverse devices/networks (e.g., mobile-friendly controls, offline caching for assets via CDN). Essential for scaling on GCP without alienating regions.
7. Transparent economy: Resources and trades operate on clear, auditable rules (e.g., no hidden inflation). Builds trust in multiplayer systems like Socket.io events.
8. Inclusive engagement: Hardcore players receive rewards for deep investment through advanced challenges and progression, while casual players find value in brief sessions, balancing commitment levels without alienating either group.
9. Flexible session management: Enable seamless pop-in/pop-out play, supporting short bursts (minutes) or marathon sessions (hours), with automatic persistence to maintain progress across interruptions.

## Mechanics Overview

### Chill Exploration (Space & Planetary)
- **Space**: Players pilot a ship through procedural star systems, scanning for planets and anomalies. Idle scout drones auto-map sectors offline, queuing discoveries.
- **Planetary**: Land and roam biomes with simple controls, discovering resources and critters. Robots patrol to flag points of interest.
- Ties to desiderata: Modular progression via unlocks; flexible sessions for quick scans or deep dives. Optimized with procedural generation in Three.js.

### Resource Collection (Chill Grind + Idle Automation)
- **Manual**: Point-and-click harvesting with ambient yields and mini-interactions.
- **Idle Robots**: Assign tasks to robots (e.g., gather resources on a planet). They work offline, depositing to inventory. Upgrades scale efficiency.
- Ties to desiderata: Inclusive for casual manual play or hardcore fleets; balanced risks with recoverable events. Backend timers simulate offline progress.

### Creative Base Building
- Voxel/grid-based editor for placing modules from resources. Decorate and automate (e.g., robot bays, gardens that grow idly).
- Bases evolve passively offline. Share blueprints socially.
- Ties to desiderata: Persistence of effort; creative freedom without grind.

### Aura Mechanic (Offline Suspension & Protection)
- **Default**: Bases and robots suspend safely offline; activities queue progress (e.g., idle yields wait on login).
- **Zones**: Safe zones (zero risk); frontiers (optional stakes like minor NPC events or visitor opt-ins, no destruction).
- Aura decays slowly in frontiers, nudging logins without penalties. Transparent logs for all activity.
- Ties to desiderata: Supports flexible sessions; prevents frustration with default safety.

### Energy & Resource Economy
- **Solar Power Limitation**: Players generate energy from solar collectors on bases/ships, capping daily actions (e.g., scout deployments, builds). Excess energy stores in batteries; shortages pause idle robots until recharged.
- **Upgrades & Dyson Sphere Goal**: Collect rare materials (e.g., iridium from asteroids, silicates from planets) to upgrade collectors. Long-term progression: Assemble Dyson sphere segments around stars for unlimited energy, enabling massive fleets and mega-builds.
- **Collection**: Manual or robot-automated gathering from procedural planets/asteroid belts. Energy costs scale with task size (e.g., 10E for a quick scan, 100E for deep mining).
- **Ties to Desiderata**: Modular progression via upgrades; balanced limits encourage strategic idle play without frustration. Transparent tracking of energy/materials; inclusive for casual recharges or hardcore sphere construction.
- **Optimization**: Simple energy tick system in backend (Bun timers); R3F visuals for collectors (particle effects for flow).

### Social & Trading Systems
- **Social Hubs**: Persistent space stations serving as cozy gathering spots (procedural but AC-like intimacy). Players visit for casual interactions: emotes, chats, and co-op planning (e.g., joint expeditions).
- **Barter Trading**: Player-driven economy via direct swaps in hubs—no currency to maintain chill vibe. Trade resources, robot designs, or collected items with mutual consent; transparent logs prevent scams (escrow system).
- **Idle Vending**: Set up automated kiosks with your bots to "vend" extras offline, yielding passive trades when visitors browse. Opt-in for group features like shared energy pools for collaborative tasks.
- **Ties to Desiderata**: Fosters social interaction (2) and transparent economy (7) without pressure; inclusive for casual browsing or hardcore alliances. Optimized with Socket.io for real-time sync in hubs.


