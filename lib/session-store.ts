import {
  type SessionData,
  type SessionDataStore,
} from "@auth0/nextjs-auth0/types"
import { kv } from "@vercel/kv"

const sessionStore: SessionDataStore = {
  async get(id: string): Promise<SessionData | null> {
    return await kv.get<SessionData>(id)
  },

  async set(id: string, session: SessionData): Promise<void> {
    await kv.set(id, session)
  },

  async delete(id: string): Promise<void> {
    await kv.del(id)
  },

  async deleteByLogoutToken({ sid, sub }: { sid?: string; sub?: string }): Promise<void> {
    // If a session ID is provided, delete that specific session
    if (sid) {
      await kv.del(sid)
    }

    // Note: Vercel KV doesn't support pattern matching or queries by value.
    // For `sub` (user subject) based deletion, we would need to either:
    // 1. Maintain a separate user-to-session mapping
    // 2. Use a different storage approach
    // 3. Accept this limitation

    // For now, we'll only handle sid-based deletion
    // If you need sub-based deletion, consider implementing a user-session index
    if (sub && !sid) {
      console.warn(
        "deleteByLogoutToken: sub-based session deletion not implemented for Vercel KV"
      )
      // Could implement by maintaining a user session index in KV
      // or scanning all sessions (not efficient)
    }
  },
}

export default sessionStore
