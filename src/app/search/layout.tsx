import { AIAssistant } from "@/components/shared/ai-assistant"

export default function SearchLayout({
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

