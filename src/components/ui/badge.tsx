import { HTMLAttributes } from "react"

type BadgeProps = HTMLAttributes<HTMLSpanElement>

export function Badge({ className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold border ${className}`}
      {...props}
    />
  )
}

