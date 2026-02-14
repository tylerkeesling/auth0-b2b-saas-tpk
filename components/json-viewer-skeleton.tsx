import { Skeleton } from '@/components/ui/skeleton'

export function JsonViewerSkeleton() {
  return (
    <div className="space-y-2.5 rounded-lg bg-[#272822] p-4">
      <Skeleton className="h-3.5 w-8 bg-white/10" />
      <Skeleton className="ml-4 h-3.5 w-3/5 bg-white/10" />
      <Skeleton className="ml-4 h-3.5 w-2/5 bg-white/10" />
      <Skeleton className="ml-4 h-3.5 w-4/5 bg-white/10" />
      <Skeleton className="ml-4 h-3.5 w-1/2 bg-white/10" />
      <Skeleton className="ml-4 h-3.5 w-3/4 bg-white/10" />
      <Skeleton className="ml-4 h-3.5 w-2/5 bg-white/10" />
      <Skeleton className="h-3.5 w-8 bg-white/10" />
    </div>
  )
}
