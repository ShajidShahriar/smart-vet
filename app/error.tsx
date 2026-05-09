"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Unhandled error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--body-bg)] p-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Something went wrong</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                    An unexpected error occurred. This has been logged automatically.
                </p>
                <button
                    onClick={reset}
                    className="px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity shadow-lg"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
