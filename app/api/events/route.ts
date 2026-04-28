import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { z } from 'zod'

// Define Zod schema matching EventTable
const eventSchema = z.object({
  id: z.string(),
  type: z.string(),
  source: z.string(),
  specversion: z.string(),
  time: z.string(),
  a0stream: z.string(),
  a0tenant: z.string(),
  data: z.record(z.string(), z.any()),
})

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expectedToken = process.env.EVENT_STREAM_API_TOKEN

  if (
    !authHeader ||
    !authHeader.startsWith('Bearer ') ||
    authHeader.slice(7) !== expectedToken
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const event = eventSchema.parse(body)

    await sql`
      INSERT INTO webhook_events (
        id, type, source, specversion, time, a0stream, a0tenant, data
      ) VALUES (
        ${event.id},
        ${event.type},
        ${event.source},
        ${event.specversion},
        ${event.time},
        ${event.a0stream},
        ${event.a0tenant},
        ${JSON.stringify(event.data)}
      )
    `

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
