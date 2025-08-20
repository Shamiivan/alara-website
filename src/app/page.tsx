"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Hero from "@/components/landing/Hero"
import Problem from "@/components/landing/Problem"
import WhatWereBuilding from "@/components/landing/WhatWereBuilding"
import HowItWorks from "@/components/landing/HowItWorks"

export default function Home() {
  const router = useRouter()
  // If still loading auth state, render nothing or a loading indicator
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
