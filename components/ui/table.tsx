import * as React from 'react'

import { cn } from '@/lib/utils'

function Table({ className, ref, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-auto rounded-lg">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  className,
  ref,
  ...props
}: React.ComponentProps<'thead'>) {
  return (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
  )
}

function TableBody({
  className,
  ref,
  ...props
}: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({
  className,
  ref,
  ...props
}: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        'bg-muted/50 border-t font-medium last:[&>tr]:border-b-0',
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ref, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      ref={ref}
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ref, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      ref={ref}
      className={cn(
        'text-muted-foreground h-10 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ref, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      ref={ref}
      className={cn(
        'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ref,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      ref={ref}
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
