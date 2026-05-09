import mongoose, { Schema, models, model } from "mongoose";

const ScanSchema = new Schema({
    // links back to the job this resume was scanned against
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    // user ownership
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    fileUrl: { type: String }, // url to the file in blob storage
    candidateName: { type: String, default: "" },
    score: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Pass", "Fail"], default: "Pending" },
    summary: { type: String },
    breakdown: {
        skillsMatch: { score: Number, max: Number, comment: String },
        experience: { score: Number, max: Number, comment: String },
        projectsLinks: { score: Number, max: Number, comment: String },
        security: { flagged: Boolean, comment: String },
    },
    category: { type: String, default: "" },
    promptHash: { type: String, index: true },
}, {
    timestamps: true,
});

// force model recompilation in dev to catch schema changes
if (process.env.NODE_ENV === "development") {
    delete models.Scan;
}

const Scan = models.Scan || model("Scan", ScanSchema);

export default Scan;
