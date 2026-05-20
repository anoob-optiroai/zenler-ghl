import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import zenlerRoutes from './routes/zenler'
import ghlRoutes from './routes/ghl'
import { startWorker } from './queue'

const app = Fastify({ logger: true })

async function bootstrap() {
  await app.register(cors, { origin: true })

  // Webhook routes
  await app.register(zenlerRoutes, { prefix: '/wh/zenler' })
  await app.register(ghlRoutes, { prefix: '/wh/ghl' })

  // Health check
  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

  // Start BullMQ worker
  startWorker()

  const port = parseInt(process.env.PORT || '3001')
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`Worker running on port ${port}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
