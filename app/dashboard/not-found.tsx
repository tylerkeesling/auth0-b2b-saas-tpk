import Link from 'next/link'
import { ArrowLeftIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
