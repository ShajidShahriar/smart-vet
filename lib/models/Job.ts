import mongoose, { Schema, models, model } from "mongoose";

const JobSchema = new Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Closed"], default: "Active" },
    skills: [{ type: String }],
}, {
    timestamps: true,
});

const Job = models.Job || model("Job", JobSchema);

export default Job;
