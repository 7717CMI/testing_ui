import { DashboardShell } from '@/components/dashboard-shell'

export default function IntentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}


