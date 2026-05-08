const mongoose = require("mongoose");

const usageAnalyticsSchema =
  new mongoose.Schema(
    {
      task: {
        type: String,
        required: true,
      },

      toolsUsed: [
        {
          type: String,
        },
      ],

      optimalTool: {
        type: String,
      },

      estimatedCost: {
        type: Number,
        default: 0,
      },

      priority: {
        type: String,
      },

      budget: {
        type: String,
      },

      organizationId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Organization",
      },

      teamName: {
  type: String,
},

      executionTime: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

usageAnalyticsSchema.index({
  organizationId: 1,
});

usageAnalyticsSchema.index({
  task: 1,
});

module.exports = mongoose.model(
  "UsageAnalytics",
  usageAnalyticsSchema
);