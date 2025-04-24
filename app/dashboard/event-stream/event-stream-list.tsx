"use client"

import { useState, useTransition } from "react"
import { AlertCircle, ChevronDown, ChevronRight, RefreshCw } from "lucide-react"

import { EventsTable } from "@/lib/definitions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EventStreamList({
  initialData,
}: {
  initialData: {
    events: EventsTable[]
  }
}) {
  const [events, setEvents] = useState<EventsTable[]>(initialData.events)
  const [isPending, startTransition] = useTransition()
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const toggleEventExpansion = (eventId: string) => {
    const newExpandedEvents = new Set(expandedEvents)
    if (newExpandedEvents.has(eventId)) {
      newExpandedEvents.delete(eventId)
    } else {
      newExpandedEvents.add(eventId)
    }
    setExpandedEvents(newExpandedEvents)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (e) {
      return dateString || "Unknown date"
    }
  }

  return (
    <div className="">
      {isPending ? (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="ml-auto h-3 w-[100px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No webhook events found matching your criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.map((event) => (
                  <div key={event.id} className="transition-all duration-200">
                    <div
                      className={`flex cursor-pointer items-center justify-between p-4 hover:bg-muted ${
                        expandedEvents.has(event.id) ? "bg-muted" : ""
                      }`}
                      onClick={() => toggleEventExpansion(event.id)}
                    >
                      <div className="flex items-center space-x-4">
                        {expandedEvents.has(event.id) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium">{event.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(event.time?.toString() || "")}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{event.a0stream}</Badge>
                    </div>

                    {expandedEvents.has(event.id) && (
                      <div className="border-t border-border bg-muted p-4">
                        <pre className="overflow-x-auto rounded-md border bg-card p-4 text-card-foreground text-xs">
                          <code>{JSON.stringify(event.data, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
