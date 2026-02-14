'use client'

import dynamic from 'next/dynamic'

import { TokenDecodeResult } from '@/lib/token-utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { JsonViewerSkeleton } from '@/components/json-viewer-skeleton'

const JsonViewer = dynamic(() => import('@/components/json-viewer'), {
  ssr: false,
  loading: () => <JsonViewerSkeleton />,
})

export function TokenCard({
  title,
  description,
  result,
}: {
  title: string
  description: React.ReactNode
  result: TokenDecodeResult
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-1.5">
          {result.success ? (
            <JsonViewer data={result.payload} />
          ) : (
            <p className="text-muted-foreground text-sm">{result.error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
