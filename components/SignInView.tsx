"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function SignInView() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--body-bg)] p-4 relative overflow-hidden">

            {/* Background decoration matching the dashboard aesthetic */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--accent)]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-xl p-8 md:p-10 text-center"
            >
                <div className="flex justify-center mb-8">
                    <img src="/smart-vet-logo.svg" alt="Smart-Vet" className="w-32 h-32" />
                </div>

                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Welcome to SmartVet</h1>
                <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
                    The AI-powered resume screening platform. <br />
                    Sign in to analyze candidates and manage jobs.
                </p>

                <button
                    onClick={() => signIn("google")}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold bg-[var(--text-primary)] text-[var(--body-bg)] hover:opacity-90 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                    Continue with Google
                </button>

                <div className="mt-8 pt-6 border-t border-[var(--card-border)]">
                    <p className="text-xs text-[var(--text-secondary)]">
                        By continuing, you acknowledge that this is a demo application properly secured with Auth.js
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
