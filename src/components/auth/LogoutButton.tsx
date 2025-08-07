"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "subtle" | "icon";
  className?: string;
}

export function LogoutButton({
  variant = "default",
  className = ""
}: LogoutButtonProps) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // Redirect to login page after successful logout
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  // Render different variants
  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`text-muted-foreground hover:text-foreground ${className}`}
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === "subtle") {
    return (
      <Button
        variant="ghost"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`text-muted-foreground hover:text-foreground ${className}`}
      >
        {isLoggingOut ? "Signing out..." : "Sign out"}
      </Button>
    );
  }

  // Default variant
  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      {isLoggingOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}