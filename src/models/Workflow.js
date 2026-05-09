const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Input
    |--------------------------------------------------------------------------
    */

    task: {
      type: String,
      required: true,
      trim: true,
    },

    budget: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    priority: {
      type: String,
      enum: ["quality", "speed", "cost"],
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    teamName: {
      type: String,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Result
    |--------------------------------------------------------------------------
    */

    orchestrationFlow: [
      {
        step: { type: Number },
        tool: { type: String },
        reason: { type: String },
        score: { type: Number },
      },
    ],

    estimatedCostUSD: {
      type: Number,
      default: 0,
    },

    reasoning: {
      type: String,
    },

    optimizationNote: {
      type: String,
    },

    source: {
      type: String,
      default: "algorithm-only",
    },

    /*
    |--------------------------------------------------------------------------
    | Compliance
    |--------------------------------------------------------------------------
    */

    complianceReport: {
      compliant: { type: Boolean, default: true },
      violations: [{ type: String }],
    },

    status: {
      type: String,
      enum: ["validated", "running", "completed", "failed"],
      default: "validated",
    },
  },
  {
    timestamps: true,
  }
);

workflowSchema.index({ organizationId: 1 });
workflowSchema.index({ status: 1 });
workflowSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Workflow", workflowSchema);
