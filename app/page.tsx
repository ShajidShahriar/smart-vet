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
            className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-lg"
            style={{ animation: "bootFloat 2s ease-in-out infinite" }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44A2.5 2.5 0 0 1 2 17.5v-.5a2 2 0 0 1 2-2h1a2 2 0 0 0 2-2V9.5A2.5 2.5 0 0 1 9.5 2Z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44A2.5 2.5 0 0 0 22 17.5v-.5a2 2 0 0 0-2-2h-1a2 2 0 0 1-2-2V9.5A2.5 2.5 0 0 0 14.5 2Z" />
            </svg>
          </div>

          {/* Scanning bars */}
          <div className="flex items-end gap-[3px] h-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-[var(--accent)]"
                style={{
                  animation: "bootBar 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                  height: "6px",
                }}
              />
            ))}
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
