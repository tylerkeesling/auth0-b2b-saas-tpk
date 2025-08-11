import { cn } from "@/lib/utils"

type Props = React.HTMLAttributes<HTMLSpanElement>

export function Code({ className, children, ...props }: Props) {
  return (
    <span
      className={cn(
        "bg-secondary text-secondary-foreground rounded-md px-1 py-0.5 font-mono text-xs",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
