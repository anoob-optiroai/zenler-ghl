import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import { processEvent } from './processor'

// Lazily initialised — not created at module load time
// so a missing REDIS_URL never crashes the process before the HTTP server starts
let connection: IORedis | null = null
let eventQueue: Queue | null = null

export async function initQueue(): Promise<void> {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set')
  }

  connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  // Surface connection errors as logs, not unhandled crashes
  connection.on('error', (err) => {
    console.error('Redis connection error:', err.message)
  })

  connection.on('connect', () => {
    console.log('Redis connected')
  })

  // Wait until Redis is ready before creating the queue
  await new Promise<void>((resolve, reject) => {
    connection!.once('ready', resolve)
    connection!.once('error', reject)
    // Give Redis 10 s to connect
    setTimeout(() => reject(new Error('Redis connection timeout (10s)')), 10_000)
  })

  eventQueue = new Queue('events', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    },
  })
}

export function getQueue(): Queue {
  if (!eventQueue) throw new Error('Queue not initialised — call initQueue() first')
  return eventQueue
}

export function startWorker() {
  if (!connection) throw new Error('Redis not connected — call initQueue() first')

  const worker = new Worker(
    'events',
    async (job: Job) => {
      await processEvent(job.data)
    },
    {
      connection,
      concurrency: 5,
    }
  )

  worker.on('completed', (job) => {
    console.log(`✓ ${job.data.eventKey} [${job.data.direction}]`)
  })

  worker.on('failed', (job, err) => {
    console.error(`✗ ${job?.data?.eventKey} — ${err.message}`)
  })

  console.log('BullMQ worker started')
  return worker
}
