const mongoose = require("mongoose");

const organizationSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      industry: {
        type: String,
        trim: true,
      },

      organizationSize: {
        type: String,

        enum: [
          "startup",
          "small",
          "medium",
          "enterprise",
        ],

        default: "startup",
      },

      subscriptions: [
        {
          type: String,
        },
      ],

      monthlyAISpend: {
        type: Number,
        default: 0,
      },

      aiGoals: [
        {
          type: String,
        },
      ],

      teams: [
  {
    name: {
      type: String,
      required: true,
    },

    aiTools: [
      {
        type: String,
      },
    ],

    monthlyBudget: {
      type: Number,
      default: 0,
    },

    restrictedTools: [
      {
        type: String,
      },
    ],

    workflowsExecuted: {
      type: Number,
      default: 0,
    },
  },
],
    },
    {
      timestamps: true,
    }
  );

organizationSchema.index({
  name: 1,
});

module.exports =
  mongoose.model(
    "Organization",
    organizationSchema
  );