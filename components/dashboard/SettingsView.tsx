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
function Section({ index, icon: Icon, title, badge, children }: { index: number; icon: React.ElementType; title: string; badge?: string; children: React.ReactNode }) {
    return (
        <motion.div
            custom={index}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            layoutId={`settings-section-${index}`}
        >
            <div className="flex items-center gap-2.5 mb-4">
                <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
                {badge && (
                    <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 bg-transparent">
                        {badge}
                    </span>
                )}
            </div>
            {children}
        </motion.div>
    );
}


export default function SettingsView() {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        fetch('/api/user/profile')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUserData(data.user);
            })
            .catch(err => console.error("Failed to fetch user data:", err));
    }, []);

    return (
        <div className="space-y-8 max-w-3xl">
            <Section index={0} icon={User} title="Profile & Account">
                <ProfileContent />
            </Section>
            <Section index={1} icon={CreditCard} title="Subscription & Usage">
                <SubscriptionContent userData={userData} />
            </Section>
            <Section index={2} icon={Cpu} title="API & AI Engine">
                <ApiEngineContent userData={userData} />
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
            setJobTitle((session.user as Record<string, string>).jobTitle || "Hiring Manager");
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
            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sign in to SmartVet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    Create an account to save your preferences, track usage, and manage your profile across devices.
                </p>
                <button
                    onClick={() => signIn("google")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                    Continue with Google
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-6">
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                    <label
                        onDrop={handleAvatarDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all shrink-0 ${isDragOver
                            ? "border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800"
                            : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:bg-gray-800/50"
                            }`}
                    >
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile Picture</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Drag & drop or click. PNG, JPG up to 2MB.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111] text-sm text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:border-gray-500 focus:ring-2 focus:ring-gray-300 dark:ring-gray-700 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Job Title</label>
                        <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111] text-sm text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:border-gray-500 focus:ring-2 focus:ring-gray-300 dark:ring-gray-700 transition-all" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Email Address</label>
                        <input type="email" value={email} disabled className="w-full px-4 py-2.5 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111]/50 text-sm text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed" />
                    </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                    <button onClick={() => signOut()} className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors inline-flex items-center gap-1.5">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-md text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-opacity disabled:opacity-70">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>


            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-red-300 dark:border-red-900/30 p-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-red-500">Danger Zone</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Permanently delete your account. This cannot be undone.</p>
                </div>
                <button disabled className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold bg-red-600 text-white opacity-60 cursor-not-allowed shrink-0 border border-red-700">
                    <Trash2 className="w-4 h-4" /> Delete Account (Soon)
                </button>
            </div>
        </div>
    );
}


function SubscriptionContent({ userData }: { userData: any }) {
    const [isUpgrading, setIsUpgrading] = useState(false);

    const creditsUsed = userData?.creditsUsed ?? 0;
    const creditsTotal = userData?.creditsTotal ?? 10;
    const isPremium = userData?.subscriptionTier === 'premium';
    const pct = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;

    async function handleUpgrade() {
        setIsUpgrading(true);
        try {
            const res = await fetch('/api/billing/checkout', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned:", data);
                setIsUpgrading(false);
            }
        } catch (e) {
            console.error("Failed to start checkout:", e);
            setIsUpgrading(false);
        }
    }

    async function handleManageSubscription() {
        setIsUpgrading(true);
        try {
            const res = await fetch('/api/billing/portal', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No portal URL returned:", data);
                setIsUpgrading(false);
            }
        } catch (e) {
            console.error("Failed to start portal:", e);
            setIsUpgrading(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Current Plan</h3>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-white/20">
                        {isPremium ? "Pro Tier" : "Free Tier"}
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-6">
                    <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{creditsTotal === 100 ? "100" : creditsTotal}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold mt-0.5">Monthly Credits</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">3</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold mt-0.5">Active Jobs</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">1</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold mt-0.5">Team Member</p>
                    </div>
                </div>


                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">API Credits Used</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{creditsUsed}/{creditsTotal}</span>
                </div>
                <div className="w-full bg-gray-50 dark:bg-[#111] h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 bg-gray-900 dark:bg-white`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">{Math.max(0, creditsTotal - creditsUsed)} credits remaining. Resets monthly.</p>
            </div>


            {isPremium ? (
                <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Manage Subscription</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update payment method or cancel your Pro subscription.</p>
                    </div>
                    <button onClick={handleManageSubscription} disabled={isUpgrading} className="px-5 py-2.5 rounded-md text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-opacity shrink-0 disabled:opacity-70 w-[200px] flex justify-center items-center">
                        {isUpgrading ? "Redirecting..." : "Manage Subscription"}
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Need more power?</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Upgrade to Pro for unlimited credits, priority AI, and team collaboration.</p>
                    </div>
                    <button onClick={handleUpgrade} disabled={isUpgrading} className="px-5 py-2.5 rounded-md text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-opacity shrink-0 disabled:opacity-70 w-[200px] flex justify-center items-center">
                        {isUpgrading ? "Redirecting..." : "Upgrade Plan"}
                    </button>
                </div>
            )}
        </div>
    );
}


function ApiEngineContent({ userData }: { userData: any }) {
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

            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Bring Your Own Key (BYOK)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Your key is stored securely and never shared.</p>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Gemini API Key</label>
                <div className="relative">
                    <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-4 py-2.5 pr-12 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111] text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:text-gray-400/60 outline-none focus:border-gray-400 dark:border-gray-500 focus:ring-2 focus:ring-gray-300 dark:ring-gray-700 transition-all font-mono"
                    />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">Get your key from <span className="text-gray-900 dark:text-white font-medium">Google AI Studio</span></p>
            </div>

            {/* grouped together because they both affect ai behavior */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-6 space-y-6">

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Grading Strictness</label>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold bg-transparent border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white`}>
                            {strictnessLabel}
                        </span>
                    </div>
                    <input type="range" min={0} max={100} value={strictness} onChange={(e) => setStrictness(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-50 dark:bg-[#111] accent-gray-900 dark:accent-white" />
                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        <span>Lenient</span><span>Balanced</span><span>Strict</span><span>Ruthless</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center gap-3">
                {saved && <span className="text-xs font-semibold text-gray-900 dark:text-white animate-in fade-in slide-in-from-right-2">Settings Saved!</span>}
                <button onClick={handleSave} className="px-5 py-2.5 rounded-md text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-opacity">Save Configuration</button>
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

            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Theme</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Choose your preferred appearance.</p>
                <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${theme === opt.id
                                ? "border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800"
                                : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:border-gray-500/50 bg-gray-50 dark:bg-[#111]"
                                }`}
                        >
                            <opt.icon className={`w-5 h-5 ${theme === opt.id ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`} />
                            <span className={`text-xs font-semibold ${theme === opt.id ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>


            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-6">
                <div className="flex items-center gap-3 mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-transparent border border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400">COMING SOON</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Control which events trigger notifications.</p>
                <div className="space-y-4 opacity-60 pointer-events-none">
                    <CheckboxRow checked={notifHighScore} onChange={setNotifHighScore} disabled={true} label="High score alert" desc="Email when a resume scores 90%+" />
                    <CheckboxRow checked={notifLowCredits} onChange={setNotifLowCredits} disabled={true} label="Low credits warning" desc="Notify when API credits drop below 20%" />
                    <CheckboxRow checked={notifWeeklySummary} onChange={setNotifWeeklySummary} disabled={true} label="Weekly digest" desc="Receive a summary of all scans each Monday" />
                </div>
            </div>

            <div className="flex justify-end">
                <button disabled className="px-5 py-2.5 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed">Save Preferences</button>
            </div>
        </div>
    );
}


function CheckboxRow({ checked, onChange, label, desc, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string; disabled?: boolean }) {
    return (
        <label className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer group"}`} onClick={(e) => { if (disabled) e.preventDefault(); else onChange(!checked); }}>
            <div className="pt-0.5">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? "bg-gray-900 dark:bg-white border-gray-400 dark:border-gray-500" : "border-gray-200 dark:border-white/10"} ${!disabled && !checked && "group-hover:border-gray-400 dark:border-gray-500/50"}`}>
                    {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
        </label>
    );
}
