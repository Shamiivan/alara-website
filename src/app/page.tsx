"use client"
import Hero from "@/components/landing/Hero"
import Problem from "@/components/landing/Problem"
import Features from "@/components/landing/Features"
import DemoSection from "@/components/landing/DemoSection"
import WhoThisIsFor from "@/components/landing/WhoThisIsFor"
import Vision from "@/components/landing/Vision"
import WhatWereBuilding from "@/components/landing/WhatWereBuilding"
import HowItWorks from "@/components/landing/HowItWorks"

export default function Home() {
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
