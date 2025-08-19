"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConvexAuth } from "convex/react"
import Hero from "@/components/landing/Hero"
import Problem from "@/components/landing/Problem"
import Features from "@/components/landing/Features"
import DemoSection from "@/components/landing/DemoSection"
import WhoThisIsFor from "@/components/landing/WhoThisIsFor"
import Vision from "@/components/landing/Vision"
import WhatWereBuilding from "@/components/landing/WhatWereBuilding"
import HowItWorks from "@/components/landing/HowItWorks"

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after authentication status is confirmed (not loading)
    // and the user is authenticated
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  // If still loading auth state, render nothing or a loading indicator
  if (isLoading) {
    return null // Or return a loading spinner
  }

  // If not authenticated, show the landing page
  return (
    <div className="font-sans items-center justify-items-center">
      <main className="flex flex-col">
        {/* {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)} */}
        <Hero />
        <Problem />
        <WhatWereBuilding />
        <HowItWorks />
      </main>
    </div>
  );
}
