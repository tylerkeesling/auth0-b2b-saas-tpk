"use server"

import { managementClient } from "@/lib/auth0-manage"
import { appClient } from "@/lib/auth0"
import { GetLogsRequest } from "auth0"

export interface LogEntry {
  log_id: string
  date: string
  type: string
  description: string
  user_id?: string
  user_name?: string
  client_id?: string
  client_name?: string
  ip?: string
  location_info?: {
    country_code?: string
    country_name?: string
    city_name?: string
    latitude?: string
    longitude?: string
  }
  details?: Record<string, unknown>
}

export interface GetLogsParams {
  userId: string
  page?: number
  perPage?: number
  type?: string
  fromDate?: string
  toDate?: string
}

export interface GetLogsResult {
  logs: LogEntry[]
  hasMore: boolean
  error?: string
}

const VALID_LOG_TYPES = new Set([
  "s", "f", "fp", "fu", "ss", "fs", "slo", "flo",
  "seacft", "svr", "fvr", "scpn", "fcpn", "api",
  "oidc_backchannel_logout_succeeded",
])

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function getLogs({
  userId,
  page = 0,
  perPage = 10,
  type,
  fromDate,
  toDate,
}: GetLogsParams): Promise<GetLogsResult> {
  try {
    // Verify the session and ensure the user can only fetch their own logs
    const session = await appClient.getSession()
    if (!session || session.user.sub !== userId) {
      return { logs: [], hasMore: false, error: "Unauthorized" }
    }

    // Sanitize userId to prevent Lucene query injection
    const safeUserId = userId.replace(/"/g, '\\"')
    let query = `user_id:"${safeUserId}"`

    if (type && type !== "all") {
      if (!VALID_LOG_TYPES.has(type)) {
        return { logs: [], hasMore: false, error: "Invalid log type" }
      }
      query += ` AND type:${type}`
    }

    if (fromDate) {
      if (!ISO_DATE_RE.test(fromDate)) {
        return { logs: [], hasMore: false, error: "Invalid from date" }
      }
      query += ` AND date:[${fromDate} TO *]`
    }

    if (toDate) {
      if (!ISO_DATE_RE.test(toDate)) {
        return { logs: [], hasMore: false, error: "Invalid to date" }
      }
      query += ` AND date:[* TO ${toDate}]`
    }

    // Use search-based pagination (page/per_page) which respects query filters
    // Note: Limited to 1,000 results total, but this is fine for user logs
    // Request one extra to detect if there are more pages
    const params: GetLogsRequest = {
      q: query,
      sort: "date:-1",
      page,
      per_page: perPage + 1,
    }

    const response = await managementClient.logs.getAll(params)

    const allLogs = response.data

    // Check if there are more results by seeing if we got more than requested
    const hasMore = allLogs.length > perPage
    const logs = hasMore ? allLogs.slice(0, perPage) : allLogs

    return {
      logs: logs as LogEntry[],
      hasMore,
    }
  } catch (error) {
    console.error("Error fetching logs:", error)
    return {
      logs: [],
      hasMore: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching logs",
    }
  }
}
