import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ghlApiKey, ghlLocationId } = await req.json()

  let ghlValid = false

  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/locations/${ghlLocationId}`,
      {
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
        },
      }
    )
    ghlValid = res.ok
  } catch {
    ghlValid = false
  }

  return NextResponse.json({ ghlValid })
}
