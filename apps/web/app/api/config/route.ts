import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const connection = await prisma.connection.findFirst({ where: { userId } })

  if (!connection) {
    return NextResponse.json({ hasConnection: false, configs: [] })
  }

  const configs = await prisma.eventConfig.findMany({
    where: { connectionId: connection.id },
  })

  return NextResponse.json({ hasConnection: true, configs })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { configs } = await req.json()

  const connection = await prisma.connection.findFirst({ where: { userId } })
  if (!connection) {
    return NextResponse.json({ error: 'No connection found. Set up connection first.' }, { status: 400 })
  }

  // Upsert all event configs
  await Promise.all(
    configs.map((c: { eventKey: string; direction: string; isEnabled: boolean }) =>
      prisma.eventConfig.upsert({
        where: {
          connectionId_eventKey_direction: {
            connectionId: connection.id,
            eventKey: c.eventKey,
            direction: c.direction as any,
          },
        },
        update: { isEnabled: c.isEnabled },
        create: {
          connectionId: connection.id,
          eventKey: c.eventKey,
          direction: c.direction as any,
          isEnabled: c.isEnabled,
        },
      })
    )
  )

  return NextResponse.json({ success: true })
}
