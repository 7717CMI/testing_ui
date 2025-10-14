import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
        secondary:
          "bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300",
        success:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        warning:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        destructive:
          "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        outline: "text-foreground border border-input",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

