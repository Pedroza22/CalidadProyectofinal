import { forwardRef, HTMLAttributes } from "react"

type CardProps = HTMLAttributes<HTMLDivElement>

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className = "", ...props }, ref) {
  return <div ref={ref} className={`rounded-2xl border bg-white/5 dark:bg-black/20 ${className}`} {...props} />
})

type CardContentProps = HTMLAttributes<HTMLDivElement>

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent({ className = "", ...props }, ref) {
  return <div ref={ref} className={className} {...props} />
})

