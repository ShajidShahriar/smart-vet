"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function SignInView() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-black p-4 relative overflow-hidden">

            {/* Background decoration matching the dashboard aesthetic */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gray-900/5 dark:bg-white/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gray-500/5 blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-white/10 shadow-lg p-8 md:p-10 text-center"
            >
                <div className="flex justify-center mb-8">
                    <img src="/smartvet-dark.png" alt="Smart-Vet" className="h-10 dark:hidden" />
                    <img src="/smartvet-light.png" alt="Smart-Vet" className="h-10 hidden dark:block" />
                </div>

                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome to SmartVet</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                    The AI-powered resume screening platform. <br />
                    Sign in to analyze candidates and manage jobs.
                </p>

                <button
                    onClick={() => signIn("google")}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-md text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] transition-all"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                    Continue with Google
                </button>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        By continuing, you acknowledge that this is a demo application properly secured with Auth.js
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
