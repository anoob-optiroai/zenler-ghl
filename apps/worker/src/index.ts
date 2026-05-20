// v1.0.1 — prisma generate at startup
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import zenlerRoutes from './routes/zenler'
import ghlRoutes from './routes/ghl'
import { initQueue, startWorker } from './queue'

const app = Fastify({ logger: true })

// Track queue/worker readiness
let queueReady = false

async function bootstrap() {
  await app.register(cors, { origin: true })

  // ── Health check registered FIRST so Railway healthcheck passes
  //    immediately after the HTTP server binds, even before Redis connects
  app.get('/health', async () => ({
    status: 'ok',
    queue: queueReady ? 'connected' : 'connecting',
    ts: new Date().toISOString(),
  }))

  // Webhook routes
  await app.register(zenlerRoutes, { prefix: '/wh/zenler' })
  await app.register(ghlRoutes, { prefix: '/wh/ghl' })

  // ── Start HTTP server BEFORE connecting to Redis
  const port = parseInt(process.env.PORT || '3001')
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`Worker HTTP server running on port ${port}`)

  // ── Connect to Redis + start BullMQ AFTER server is already up
  //    so a slow/missing Redis doesn't block the healthcheck
  try {
    await initQueue()
    startWorker()
    queueReady = true
    console.log('Queue connected and worker started')
  } catch (err) {
    console.error('Queue init failed (webhooks still accepted, will retry on restart):', err)
  }
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err)
  process.exit(1)
})
