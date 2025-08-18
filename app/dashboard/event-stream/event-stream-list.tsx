"use client"

import { useState, useTransition } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { EventsTable } from "@/lib/definitions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EventStreamList({
  initialData,
}: {
  initialData: { events: EventsTable[] }
}) {
  const [events, setEvents] = useState<EventsTable[]>(initialData.events)
  const [isPending, startTransition] = useTransition()
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  interface EventItemProps {
    event: EventsTable
    isExpanded: boolean
    onToggle: (eventId: string) => void
  }

  function EventItem({ event, isExpanded, onToggle }: EventItemProps) {
    const formatDate = (dateString: string | Date | null | undefined) => {
      if (!dateString) return "Unknown date"
      try {
        const date = new Date(dateString)
        return date.toLocaleString()
      } catch {
        return "Invalid date"
      }
    }

    return (
      <div className="transition-all duration-200">
        <div
          className={`hover:bg-muted flex cursor-pointer items-center justify-between p-4 ${
            isExpanded ? "bg-muted" : ""
          }`}
          onClick={() => onToggle(event.id)}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`Toggle details for ${event.type} event`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onToggle(event.id)
            }
          }}
        >
          <div className="flex items-center space-x-4">
            {isExpanded ? (
              <ChevronDown
                className="text-muted-foreground h-5 w-5"
                aria-hidden="true"
              />
            ) : (
              <ChevronRight
                className="text-muted-foreground h-5 w-5"
                aria-hidden="true"
              />
            )}
            <div>
              <div className="font-medium">{event.type}</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(event.time)}
              </div>
            </div>
          </div>
          <Badge variant="outline">{event.a0stream}</Badge>
        </div>

        {isExpanded && (
          <div className="border-border bg-muted border-t p-4">
            <pre className="bg-card text-card-foreground overflow-x-auto rounded-md border p-4 text-xs">
              <code>{JSON.stringify(event.data, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {isPending ? (
        <Card>
          <CardContent className="p-6">
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
        <Card className="py-0">
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center">
                <p>No webhook events found matching your criteria.</p>
              </div>
            ) : (
              <div className="divide-border divide-y">
                {events.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    isExpanded={expandedEvents.has(event.id)}
                    onToggle={toggleEventExpansion}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
