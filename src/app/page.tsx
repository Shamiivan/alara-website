"use client"
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import DemoSection from "@/components/landing/DemoSection"
import WhoThisIsFor from "@/components/landing/WhoThisIsFor"
import Vision from "@/components/landing/Vision"

export default function Home() {
  const tasks = useQuery(api.tasks.get_tasks);
  return (
    <div className="font-sans items-center justify-items-center">
      <main className="flex flex-col">
        {/* {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)} */}
        <Hero />
        <Vision />
        <Features />
        <WhoThisIsFor />

      </main>
    </div>
  );
}
