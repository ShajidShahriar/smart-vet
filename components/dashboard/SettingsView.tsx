"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, Variants } from "framer-motion";
import {
    User,
    CreditCard,
    Cpu,
    Palette,
    Upload,
    Trash2,
    Eye,
    EyeOff,
    Sun,
    Moon,
    Monitor,
    LogOut,
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// each section drops in from top, staggered by index
const sectionVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

// wraps each settings section with icon + title + drop animation
function Section({ index, icon: Icon, title, children }: { index: number; icon: React.ElementType; title: string; children: React.ReactNode }) {
    return (
        <motion.div
            custom={index}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            layoutId={`settings-section-${index}`}
        >
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
            </div>
            {children}
        </motion.div>
    );
}


export default function SettingsView() {
    return (
        <div className="space-y-8 max-w-3xl">
            <Section index={0} icon={User} title="Profile & Account">
                <ProfileContent />
            </Section>
            <Section index={1} icon={CreditCard} title="Subscription & Usage">
                <SubscriptionContent />
            </Section>
            <Section index={2} icon={Cpu} title="API & AI Engine">
                <ApiEngineContent />
            </Section>
            <Section index={3} icon={Palette} title="Preferences">
                <PreferencesContent />
            </Section>
        </div>
    );
}


function ProfileContent() {
    const { data: session, update } = useSession();
    const [fullName, setFullName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [email, setEmail] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setFullName(session.user.name || "");
            setEmail(session.user.email || "");
            setJobTitle((session.user as any).jobTitle || "Hiring Manager"); // type assertion until we extend types
            setAvatarPreview(session.user.image || null);
        }
    }, [session]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fullName,
                    jobTitle,
                    image: avatarPreview, // sending base64 or url
                }),
            });

            if (res.ok) {
                // update session client-side to reflect changes immediately
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: fullName,
                        image: avatarPreview,
                        // jobTitle // requires custom session strategy to persist in JWT/Session
                    }
                });
            }
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    if (!session) {
        return (
            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-8 text-center">
                <div className="w-16 h-16 bg-[var(--accent-light)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Sign in to SmartVet</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-sm mx-auto">
                    Create an account to save your preferences, track usage, and manage your profile across devices.
                </p>
                <button
                    onClick={() => signIn("google")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-[var(--text-primary)] text-[var(--body-bg)] hover:opacity-90 transition-all"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                    Continue with Google
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-[var(--card-border)]">
                    <label
                        onDrop={handleAvatarDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all shrink-0 ${isDragOver
                            ? "border-[var(--accent)] bg-[var(--accent-light)]"
                            : "border-[var(--card-border)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]/50"
                            }`}
                    >
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <Upload className="w-5 h-5 text-[var(--text-secondary)]" />
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                    <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Profile Picture</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Drag & drop or click. PNG, JPG up to 2MB.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--body-bg)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Job Title</label>
                        <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--body-bg)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Email Address</label>
                        <input type="email" value={email} disabled className="w-full px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--body-bg)]/50 text-sm text-[var(--text-secondary)] outline-none cursor-not-allowed" />
                    </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                    <button onClick={() => signOut()} className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors inline-flex items-center gap-1.5">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-70">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>


            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--danger)]/30 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-[var(--danger)]">Danger Zone</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Permanently delete your account. This cannot be undone.</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[var(--danger-light)] text-[var(--danger)] border border-[var(--danger)]/20 hover:bg-[var(--danger)] hover:text-white transition-all shrink-0">
                    <Trash2 className="w-4 h-4" /> Delete Account
                </button>
            </div>
        </div>
    );
}


function SubscriptionContent() {
    const creditsUsed = 7;
    const creditsTotal = 10;
    const pct = (creditsUsed / creditsTotal) * 100;

    return (
        <div className="space-y-4">
            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Current Plan</h3>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">Free Tier</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-6">
                    <div className="p-3 bg-[var(--body-bg)] rounded-lg">
                        <p className="text-xl font-bold text-[var(--text-primary)]">10</p>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-0.5">Monthly Credits</p>
                    </div>
                    <div className="p-3 bg-[var(--body-bg)] rounded-lg">
                        <p className="text-xl font-bold text-[var(--text-primary)]">3</p>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-0.5">Active Jobs</p>
                    </div>
                    <div className="p-3 bg-[var(--body-bg)] rounded-lg">
                        <p className="text-xl font-bold text-[var(--text-primary)]">1</p>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-0.5">Team Member</p>
                    </div>
                </div>


                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)] text-xs font-medium">API Credits Used</span>
                    <span className="font-bold text-sm text-[var(--text-primary)]">{creditsUsed}/{creditsTotal}</span>
                </div>
                <div className="w-full bg-[var(--body-bg)] h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? "bg-[var(--danger)]" : pct > 50 ? "bg-amber-500" : "bg-[var(--accent)]"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">{creditsTotal - creditsUsed} credits remaining. Resets March 1, 2026.</p>
            </div>


            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Need more power?</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Upgrade to Pro for unlimited credits, priority AI, and team collaboration.</p>
                </div>
                <button className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity shrink-0">Upgrade Plan</button>
            </div>
        </div>
    );
}


function ApiEngineContent() {
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [strictness, setStrictness] = useState(50);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("smartvet_config");
        if (stored) {
            const config = JSON.parse(stored);
            setApiKey(config.apiKey || "");
            setStrictness(config.strictness || 50);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem("smartvet_config", JSON.stringify({ apiKey, strictness }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const strictnessLabel = strictness <= 25 ? "Lenient" : strictness <= 50 ? "Balanced" : strictness <= 75 ? "Strict" : "Ruthless";

    return (
        <div className="space-y-4">

            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Bring Your Own Key (BYOK)</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Your key is stored securely and never shared.</p>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Gemini API Key</label>
                <div className="relative">
                    <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-4 py-2.5 pr-12 rounded-lg border border-[var(--card-border)] bg-[var(--body-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-mono"
                    />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">Get your key from <span className="text-[var(--accent)] font-medium">Google AI Studio</span></p>
            </div>

            {/* grouped together because they both affect ai behavior */}
            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 space-y-6">

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Grading Strictness</label>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${strictness > 75 ? "bg-[var(--danger-light)] text-[var(--danger)]" : strictness > 50 ? "bg-amber-50 text-amber-600" : "bg-[var(--accent-light)] text-[var(--accent)]"}`}>
                            {strictnessLabel}
                        </span>
                    </div>
                    <input type="range" min={0} max={100} value={strictness} onChange={(e) => setStrictness(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--body-bg)] accent-[var(--accent)]" />
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1 font-medium">
                        <span>Lenient</span><span>Balanced</span><span>Strict</span><span>Ruthless</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center gap-3">
                {saved && <span className="text-xs font-semibold text-[var(--success)] animate-in fade-in slide-in-from-right-2">Settings Saved!</span>}
                <button onClick={handleSave} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">Save Configuration</button>
            </div>
        </div>
    );
}


function PreferencesContent() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [notifHighScore, setNotifHighScore] = useState(true);
    const [notifLowCredits, setNotifLowCredits] = useState(true);
    const [notifWeeklySummary, setNotifWeeklySummary] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const themeOptions = [
        { id: "light", label: "Light", icon: Sun },
        { id: "dark", label: "Dark", icon: Moon },
        { id: "system", label: "System", icon: Monitor },
    ];

    return (
        <div className="space-y-4">

            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Theme</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Choose your preferred appearance.</p>
                <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${theme === opt.id
                                ? "border-[var(--accent)] bg-[var(--accent-light)]"
                                : "border-[var(--card-border)] hover:border-[var(--accent)]/50 bg-[var(--body-bg)]"
                                }`}
                        >
                            <opt.icon className={`w-5 h-5 ${theme === opt.id ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                            <span className={`text-xs font-semibold ${theme === opt.id ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>


            <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Notifications</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Control which events trigger notifications.</p>
                <div className="space-y-4">
                    <CheckboxRow checked={notifHighScore} onChange={setNotifHighScore} label="High score alert" desc="Email when a resume scores 90%+" />
                    <CheckboxRow checked={notifLowCredits} onChange={setNotifLowCredits} label="Low credits warning" desc="Notify when API credits drop below 20%" />
                    <CheckboxRow checked={notifWeeklySummary} onChange={setNotifWeeklySummary} label="Weekly digest" desc="Receive a summary of all scans each Monday" />
                </div>
            </div>

            <div className="flex justify-end">
                <button className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">Save Preferences</button>
            </div>
        </div>
    );
}


function CheckboxRow({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group" onClick={() => onChange(!checked)}>
            <div className="pt-0.5">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--card-border)] group-hover:border-[var(--accent)]/50"}`}>
                    {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
            </div>
        </label>
    );
}
