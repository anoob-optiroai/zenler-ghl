import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') || 'ALL'

  const connection = await prisma.connection.findFirst({ where: { userId } })
  if (!connection) return NextResponse.json({ logs: [] })

  const where: any = { connectionId: connection.id }
  if (filter === 'SUCCESS') where.status = 'SUCCESS'
  if (filter === 'FAILED') where.status = 'FAILED'

  const logs = await prisma.eventLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ logs })
}
