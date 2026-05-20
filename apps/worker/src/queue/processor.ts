import { prisma } from '../lib/prisma'
import { handleZenlerToGhl } from '../handlers/zenler-to-ghl'
import { handleGhlToZenler } from '../handlers/ghl-to-zenler'

export interface EventJob {
  connectionId: string
  eventKey: string
  direction: 'ZENLER_TO_GHL' | 'GHL_TO_ZENLER'
  payload: any
  logId: string
}

export async function processEvent(job: EventJob) {
  const { connectionId, eventKey, direction, payload, logId } = job

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: { eventConfigs: true },
  })

  if (!connection || !connection.isActive) {
    throw new Error('Connection not found or inactive')
  }

  // Check if this event is enabled
  const config = connection.eventConfigs.find(
    (c: { eventKey: string; direction: string; isEnabled: boolean }) =>
      c.eventKey === eventKey && c.direction === direction && c.isEnabled
  )

  if (!config) {
    await prisma.eventLog.update({
      where: { id: logId },
      data: { status: 'SUCCESS', processedAt: new Date(), response: { skipped: 'event not enabled' } },
    })
    return
  }

  try {
    let response: any

    if (direction === 'ZENLER_TO_GHL') {
      response = await handleZenlerToGhl(eventKey, payload, connection)
    } else {
      response = await handleGhlToZenler(eventKey, payload, connection)
    }

    await prisma.eventLog.update({
      where: { id: logId },
      data: { status: 'SUCCESS', processedAt: new Date(), response },
    })
  } catch (err: any) {
    await prisma.eventLog.update({
      where: { id: logId },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
        errorMessage: err.message,
        retryCount: { increment: 1 },
      },
    })
    throw err // BullMQ will retry
  }
}
