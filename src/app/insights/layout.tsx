import { AIAssistant } from "@/components/shared/ai-assistant"

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <AIAssistant />
    </>
  )
}

