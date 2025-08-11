"use client"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/spinner"

interface SubmitButtonProps {
  children: React.ReactNode
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SubmitButton({
  children,
  disabled = false,
  variant,
  size,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      variant={variant}
      size={size}
      className={className}
    >
      {pending && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
