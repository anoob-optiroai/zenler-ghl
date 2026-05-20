import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma'
import { getQueue } from '../queue'

const zenlerRoutes: FastifyPluginAsync = async (app) => {
  // Zenler sends POST to /wh/zenler/:token
  app.post<{ Params: { token: string } }>('/:token', async (request, reply) => {
    const { token } = request.params
    const payload = request.body as any

    // Lookup connection by webhook token
    const connection = await prisma.connection.findFirst({
      where: { zenlerWebhookToken: token, isActive: true },
    })

    if (!connection) {
      return reply.status(404).send({ error: 'Connection not found' })
    }

    // Detect event type from Zenler payload
    const eventKey = detectZenlerEvent(payload)

    if (!eventKey) {
      // Log unrecognised payloads so we can see what Zenler is sending
      console.log('[zenler] unrecognised payload — raw body:', JSON.stringify(payload))
      return reply.status(200).send({ received: true, note: 'Unknown event type — ignored' })
    }

    // Create log entry
    const log = await prisma.eventLog.create({
      data: {
        connectionId: connection.id,
        eventKey,
        direction: 'ZENLER_TO_GHL',
        status: 'PENDING',
        payload,
      },
    })

    // Enqueue for processing
    await getQueue().add(
      eventKey,
      {
        connectionId: connection.id,
        eventKey,
        direction: 'ZENLER_TO_GHL',
        payload,
        logId: log.id,
      },
      { jobId: log.id }
    )

    return reply.send({ received: true, logId: log.id, eventKey })
  })
}

// Zenler webhook payload event detection
function detectZenlerEvent(payload: any): string | null {
  const type = payload.event || payload.type || payload.event_type

  const mapping: Record<string, string> = {
    'user_registered': 'user.registered',
    'new_enrollment': 'enrollment.created',
    'enrollment_created': 'enrollment.created',
    'enrollment_cancelled': 'enrollment.cancelled',
    'lesson_completed': 'lesson.completed',
    'course_completed': 'course.completed',
    'payment_received': 'payment.received',
    'payment_success': 'payment.received',
    'payment_failed': 'payment.failed',
    'subscription_cancelled': 'subscription.cancelled',
    'certificate_issued': 'certificate.issued',
    'quiz_passed': 'quiz.passed',
  }

  return mapping[type] || null
}

export default zenlerRoutes
