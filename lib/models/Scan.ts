import mongoose, { Schema, models, model } from "mongoose";

const ScanSchema = new Schema({
    // links back to the job this resume was scanned against
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    filename: { type: String, required: true },
    candidateName: { type: String, default: "" },
    score: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Pass", "Fail"], default: "Pending" },
    summary: { type: String },
    category: { type: String, default: "" },
}, {
    timestamps: true,
});

// force model recompilation in dev to catch schema changes
if (process.env.NODE_ENV === "development") {
    delete models.Scan;
}

const Scan = models.Scan || model("Scan", ScanSchema);

export default Scan;
