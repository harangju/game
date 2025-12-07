import { Elysia } from 'elysia'

const app = new Elysia()
  .get('/', () => 'Game Server Running')
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .listen(4000)

console.log(`🚀 Game server running at http://localhost:${app.server?.port}`)

export type App = typeof app