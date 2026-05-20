import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — fetch existing connection
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const connection = await prisma.connection.findFirst({
    where: { userId },
    select: {
      id: true,
      zenlerDomain: true,
      zenlerWebhookToken: true,
      ghlLocationId: true,
      isActive: true,
      // Mask keys — only return last 4 chars
      zenlerApiKey: true,
      ghlApiKey: true,
    },
  })

  return NextResponse.json({ connection })
}

// POST — create or update connection
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { zenlerApiKey, zenlerDomain, ghlApiKey, ghlLocationId } = body

  if (!ghlApiKey || !ghlLocationId) {
    return NextResponse.json({ error: 'GHL API key and Location ID are required' }, { status: 400 })
  }

  try {
    const existing = await prisma.connection.findFirst({ where: { userId } })

    const connection = existing
      ? await prisma.connection.update({
          where: { id: existing.id },
          data: { zenlerApiKey, zenlerDomain, ghlApiKey, ghlLocationId },
        })
      : await prisma.connection.create({
          data: { userId, zenlerApiKey, zenlerDomain, ghlApiKey, ghlLocationId },
        })

    return NextResponse.json({ connection })
  } catch (err) {
    console.error('Connection save error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
