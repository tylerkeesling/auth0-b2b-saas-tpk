import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/" className="w-full">
            <Button className="w-full">
              Go to Homepage <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
