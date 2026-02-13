"use client";

import { useSession } from "next-auth/react";
import Dashboard from "@/components/Dashboard";
import SignInView from "@/components/SignInView";

export default function Home() {
  const { status } = useSession();

  if (status === "loading") {
    // minimal loading state
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--body-bg)]">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <SignInView />;
  }

  return <Dashboard />;
}
