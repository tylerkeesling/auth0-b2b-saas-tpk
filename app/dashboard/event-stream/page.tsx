import { getEvents } from '@/lib/data'
import { PageHeader } from '@/components/page-header'

import EventStreamList from './event-stream-list'

export default async function WebhookEventsPage() {
  const events = await getEvents()

  return (
    <>
      <PageHeader
        title="Webhook Events"
        description="View and manage webhook event deliveries for your project."
      />
      <EventStreamList initialData={{ events: events }} />
    </>
  )
}
