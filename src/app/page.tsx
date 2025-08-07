"use client"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import DemoSection from "@/components/landing/DemoSection"
import WhoThisIsFor from "@/components/landing/WhoThisIsFor"
import Vision from "@/components/landing/Vision"

export default function Home() {
  return (
    <div className="font-sans items-center justify-items-center">
      <main className="flex flex-col">
        {/* {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)} */}
        <Hero />
        <Vision />
        <Features />
        <DemoSection />
        <WhoThisIsFor />
      </main>
    </div>
  );
}
