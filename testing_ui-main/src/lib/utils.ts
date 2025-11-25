import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, options?: { relative?: boolean }): string {
  if (!date) return ""
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return ""
    }
    if (options?.relative) {
      return formatDistanceToNow(dateObj, { addSuffix: true })
    }
    return format(dateObj, "MMM d, yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}








