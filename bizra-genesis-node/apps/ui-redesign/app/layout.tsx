import type { Metadata } from "next"
import { Inter, Playfair_Display, Amiri } from 'next/font/google'
import "./globals.css"
import { AnalyticsProvider } from "@/components/real-time-analytics"
import { ProgressiveEnhancementProvider } from "@/components/progressive-enhancement"
import { PerformanceMonitor } from "@/components/performance-monitoring"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const amiri = Amiri({ weight: ["400", "700"], subsets: ["arabic"], variable: "--font-amiri" })

export const metadata: Metadata = {
  title: "BIZRA | Genesis 2025 - World Class Vision",
  description: "From the Seed to the Tree. The Genesis Vision of BIZRA.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} ${amiri.variable} font-sans bg-[#050B14] text-[#F8F6F1] antialiased overflow-x-hidden`}>
        <ProgressiveEnhancementProvider>
          <AnalyticsProvider>
            {children}
            <PerformanceMonitor />
          </AnalyticsProvider>
        </ProgressiveEnhancementProvider>
      </body>
    </html>
  )
}
