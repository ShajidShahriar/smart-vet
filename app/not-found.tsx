import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--body-bg)] p-4">
            <div className="text-center max-w-md">
                <p className="text-7xl font-bold text-[var(--accent)] mb-4">404</p>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Page not found</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity shadow-lg inline-block"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
