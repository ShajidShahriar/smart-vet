import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date, default: null }, // NextAuth
    image: { type: String, default: "" },         // NextAuth
    jobTitle: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },

    // ai engine config (set from settings page)
    apiKey: { type: String, default: "" },
    model: { type: String, default: "gemini-2.5-flash" },
    strictness: { type: Number, default: 50, min: 0, max: 100 },

    // preferences
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    notifHighScore: { type: Boolean, default: true },
    notifLowCredits: { type: Boolean, default: true },
    notifWeeklyDigest: { type: Boolean, default: false },

    // usage tracking
    creditsUsed: { type: Number, default: 0 },
    creditsTotal: { type: Number, default: 10 },
    
    // Stripe references and subscription tier
    subscriptionTier: { type: String, enum: ['free', 'premium'], default: 'free' },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    stripeSubscriptionStatus: { type: String, default: null },
    creditsResetAt: { type: Date, default: Date.now }, // for monthly credit refresh
}, {
    timestamps: true,
});

// reuse existing model during hot reload, otherwise create fresh
const User = models.User || model("User", UserSchema);

export default User;
