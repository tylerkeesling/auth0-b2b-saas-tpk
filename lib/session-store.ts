import {
  type SessionData,
  type SessionDataStore,
} from "@auth0/nextjs-auth0/types"
import { kv } from "@vercel/kv"

// Helper function for SID indexing
const getSidIndexKey = (sid: string) => `session:sid:${sid}`

const cleanupIndexes = async (session?: SessionData | null) => {
  if (session?.internal?.sid) {
    try {
      await kv.del(getSidIndexKey(session.internal.sid))
    } catch (err) {
      console.warn(
        `Failed to cleanup SID index for ${session.internal.sid}:`,
        err
      )
    }
  }
}

const sessionStore: SessionDataStore = {
  async get(id: string): Promise<SessionData | null> {
    // console.log(`Getting session for ID: ${id}`)
    return await kv.get<SessionData>(id)
  },

  async set(id: string, session: SessionData): Promise<void> {
    // console.log(`Setting session for ID: ${id}`, session.user.sub)

    // First, get existing session to clean up old indexes if this is an update
    const existingSession = await kv.get<SessionData>(id).catch(() => null)
    if (existingSession) {
      await cleanupIndexes(existingSession)
    }

    // Store the main session data
    await kv.set(id, session)

    // Create SID index mapping
    if (session.internal?.sid) {
      // console.log(`Creating SID index: ${session.internal.sid} -> ${id}`)
      try {
        await kv.set(getSidIndexKey(session.internal.sid), id)
      } catch (err) {
        console.warn(
          `Failed to create SID index for ${session.internal.sid}:`,
          err
        )
      }
    }
  },

  async delete(id: string): Promise<void> {
    console.log(`Deleting session for ID: ${id}`)

    // Get session data before deleting to clean up indexes
    const session = await kv.get<SessionData>(id).catch(() => null)

    // Delete the main session data
    await kv.del(id)

    // Clean up indexes
    if (session) {
      await cleanupIndexes(session)
    }
  },

  async deleteByLogoutToken({
    sid,
    sub,
  }: {
    sid?: string
    sub?: string
  }): Promise<void> {
    console.log(`Backchannel logout request - SID: ${sid}, SUB: ${sub}`)

    let sessionIdsToDelete: string[] = []

    // Look up session ID by SID index
    if (sid) {
      try {
        const sessionId = await kv.get<string>(getSidIndexKey(sid))
        if (sessionId) {
          console.log(`Found session ${sessionId} for SID: ${sid}`)
          sessionIdsToDelete.push(sessionId)
        } else {
          console.warn(`No session found for SID: ${sid}`)
        }
      } catch (err) {
        console.error(`Failed to lookup session by SID ${sid}:`, err)
      }
    }

    // Delete found sessions
    for (const sessionId of sessionIdsToDelete) {
      try {
        // Get session data for index cleanup
        const session = await kv.get<SessionData>(sessionId).catch(() => null)

        // Delete main session
        await kv.del(sessionId)
        console.log(`Deleted session: ${sessionId}`)

        // Clean up indexes
        if (session) {
          await cleanupIndexes(session)
        }
      } catch (err) {
        console.error(`Failed to delete session ${sessionId}:`, err)
      }
    }

    if (sessionIdsToDelete.length === 0) {
      console.warn(
        `No sessions found to delete for logout token - SID: ${sid}, SUB: ${sub}`
      )
    } else {
      console.log(
        `Successfully processed backchannel logout for ${sessionIdsToDelete.length} session(s)`
      )
    }
  },
}

export default sessionStore
