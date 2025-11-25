import { DashboardShell } from '@/components/dashboard-shell'

export default function SavedSearchesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}


