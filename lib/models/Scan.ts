import mongoose, { Schema, models, model } from "mongoose";

const ScanSchema = new Schema({
    // links back to the job this resume was scanned against
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    filename: { type: String, required: true },
    candidateName: { type: String, default: "" },
    score: { type: Number, required: true },
    status: { type: String, enum: ["Pass", "Fail"], required: true },
    category: { type: String, default: "" },
}, {
    timestamps: true,
});

const Scan = models.Scan || model("Scan", ScanSchema);

export default Scan;
