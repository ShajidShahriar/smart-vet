import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    jobTitle: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },

    // ai engine config (set from settings page)
    apiKey: { type: String, default: "" },
    model: { type: String, default: "gemini-2.0-flash" },
    strictness: { type: Number, default: 2, min: 1, max: 4 },

    // preferences
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    notifHighScore: { type: Boolean, default: true },
    notifLowCredits: { type: Boolean, default: true },
    notifWeeklyDigest: { type: Boolean, default: false },

    // usage tracking
    creditsUsed: { type: Number, default: 0 },
    creditsTotal: { type: Number, default: 10 },
}, {
    timestamps: true,
});

// reuse existing model during hot reload, otherwise create fresh
const User = models.User || model("User", UserSchema);

export default User;
