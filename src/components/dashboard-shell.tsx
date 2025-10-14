'use client'

import { Navbar } from "@/components/shared/navbar"
import { ReactNode } from "react"

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Navbar />
      <main className="container py-8">
        {children}
      </main>
    </div>
  )
}


