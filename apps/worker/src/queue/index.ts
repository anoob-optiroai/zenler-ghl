import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import { processEvent } from './processor'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

export const eventQueue = new Queue('events', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
})

export function startWorker() {
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
    console.log(`✓ Event processed: ${job.data.eventKey} [${job.data.direction}]`)
  })

  worker.on('failed', (job, err) => {
    console.error(`✗ Event failed: ${job?.data?.eventKey}`, err.message)
  })

  console.log('BullMQ worker started')
  return worker
}
