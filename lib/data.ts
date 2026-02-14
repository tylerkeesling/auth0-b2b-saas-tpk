import { sql } from '@vercel/postgres'

import { EventsTable } from './definitions'

export async function getEvents(): Promise<EventsTable[]> {
  try {
    const { rows } =
      await sql<EventsTable>`SELECT * FROM webhook_events ORDER BY time DESC LIMIT 25`
    return rows
  } catch (error) {
    console.error('Error fetching events:', error)
    throw new Error('Failed to fetch events')
  }
}
