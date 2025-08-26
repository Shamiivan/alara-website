"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppPage() {
  const router = useRouter();

  // Redirect to dashboard on initial load
  useEffect(() => {
    router.push("/app/dashboard");
  }, [router]);

  return null;
}