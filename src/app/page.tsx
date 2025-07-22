"use client"
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Hero from "@/components/landing/Hero"
export default function Home() {
  const tasks = useQuery(api.tasks.get_tasks);
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
        <Hero />
      </main>
    </div>
  );
}
