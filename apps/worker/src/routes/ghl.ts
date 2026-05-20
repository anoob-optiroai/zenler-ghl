import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma'
import { getQueue } from '../queue'

const ghlRoutes: FastifyPluginAsync = async (app) => {
  // GHL sends POST to /wh/ghl/:token
  app.post<{ Params: { token: string } }>('/:token', async (request, reply) => {
    const { token } = request.params
    const payload = request.body as any

    // Lookup connection by webhook token (reuse same token)
    const connection = await prisma.connection.findFirst({
      where: { zenlerWebhookToken: token, isActive: true },
    })

    if (!connection) {
      return reply.status(404).send({ error: 'Connection not found' })
    }

    const eventKey = detectGhlEvent(payload)

    if (!eventKey) {
      return reply.status(200).send({ received: true, note: 'Unknown GHL event — ignored' })
    }

    const log = await prisma.eventLog.create({
      data: {
        connectionId: connection.id,
        eventKey,
        direction: 'GHL_TO_ZENLER',
        status: 'PENDING',
        payload,
      },
    })

    await getQueue().add(
      eventKey,
      {
        connectionId: connection.id,
        eventKey,
        direction: 'GHL_TO_ZENLER',
        payload,
        logId: log.id,
      },
      { jobId: log.id }
    )

    return reply.send({ received: true, logId: log.id, eventKey })
  })
}

// GHL webhook payload event detection
function detectGhlEvent(payload: any): string | null {
  const type = payload.type || payload.event

  const mapping: Record<string, string> = {
    'ContactCreate': 'contact.created',
    'ContactUpdate': 'contact.updated',
    'ContactDelete': 'contact.deleted',
    'ContactTagUpdate': detectTagEvent(payload),
    'OpportunityCreate': 'opportunity.created',
    'OpportunityStatusUpdate': 'opportunity.status_changed',
    'OpportunityMonetaryValueUpdate': 'opportunity.status_changed',
    'TaskCreate': null,
  } as any

  if (type === 'ContactTagUpdate') {
    return detectTagEvent(payload)
  }

  return (mapping[type] as string) || null
}

function detectTagEvent(payload: any): string | null {
  const action = payload.action
  if (action === 'added' || payload.tags?.length > 0) return 'tag.added'
  if (action === 'removed') return 'tag.removed'
  return 'tag.added' // default
}

export default ghlRoutes
