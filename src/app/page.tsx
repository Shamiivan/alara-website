"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Hero from "@/components/landing/Hero"
import Problem from "@/components/landing/Problem"
import Features from "@/components/landing/Features"
import DemoSection from "@/components/landing/DemoSection"
import WhoThisIsFor from "@/components/landing/WhoThisIsFor"
import Vision from "@/components/landing/Vision"
import WhatWereBuilding from "@/components/landing/WhatWereBuilding"
import HowItWorks from "@/components/landing/HowItWorks"
import { useRoutes } from "@/lib/useRoutes"

export default function Home() {
  const { isLoading, shouldRedirect, redirectTo } = useRoutes()
  const router = useRouter()

  useEffect(() => {
    // Handle redirects based on route configuration
    if (!isLoading && shouldRedirect && redirectTo) {
      router.push(redirectTo)
    }
  }, [shouldRedirect, redirectTo, isLoading, router])

  // If still loading auth state, render nothing or a loading indicator
  if (isLoading) {
    return null // Or return a loading spinner
  }

  // Show the landing page
  return (
    <div className="font-sans items-center justify-items-center">
      <main className="flex flex-col">
        <Hero />
        <Problem />
        <WhatWereBuilding />
        <HowItWorks />
      </main>
    </div>
  );
}
