"use client";

import { useSession } from "next-auth/react";
import Dashboard from "@/components/Dashboard";
import SignInView from "@/components/SignInView";

export default function Home() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--body-bg)] relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            animation: "bootPulse 2.5s ease-in-out infinite",
          }}
        />

        <div className="relative flex flex-col items-center gap-6 z-10">
          {/* Logo mark */}
          <div
            className="flex items-center justify-center"
            style={{ animation: "bootFloat 2s ease-in-out infinite" }}
          >
            <img src="/smartvet-dark.png" alt="Smart-Vet" className="h-14 dark:hidden" />
            <img src="/smartvet-light.png" alt="Smart-Vet" className="h-14 hidden dark:block" />
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center mt-2">
            <div className="loader h-8 transform scale-50 origin-top"></div>
          </div>
        </div>

        <style>{`
          @keyframes bootPulse {
            0%, 100% { transform: scale(0.8); opacity: 0.15; }
            50% { transform: scale(1.1); opacity: 0.3; }
          }
          @keyframes bootFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes bootBar {
            0%, 100% { height: 6px; opacity: 0.4; }
            50% { height: 20px; opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <SignInView />;
  }

  return <Dashboard />;
}
