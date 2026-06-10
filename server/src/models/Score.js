import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    applicant: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true
    },
    result: {
      default_probability: Number,
      risk_tier: String,
      decision: String,
      model_version: String,
      response_time_ms: Number
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  { timestamps: true }
);

scoreSchema.index({ createdAt: -1 });
scoreSchema.index({ "result.risk_tier": 1 });
scoreSchema.index({ "result.decision": 1 });

export const Score = mongoose.model("Score", scoreSchema);
