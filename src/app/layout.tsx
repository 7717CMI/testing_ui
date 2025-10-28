import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"
import { CallModal } from "@/components/call-modal"
import { AIAssistant } from "@/components/ai-assistant-chat"
import { OnboardingTour } from "@/components/onboarding-tour"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Healthcare Intelligence Platform | Data-as-a-Service",
  description: "Next-generation healthcare data intelligence platform for hospitals, clinics, and healthcare providers.",
  keywords: ["healthcare", "data", "intelligence", "hospitals", "clinics", "analytics"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
          <CallModal />
          <AIAssistant />
          <OnboardingTour />
        </Providers>
      </body>
    </html>
  )
}
