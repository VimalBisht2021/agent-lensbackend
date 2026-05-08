const mongoose = require("mongoose");

const aiToolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    provider: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "chat",
        "coding",
        "research",
        "image",
        "video",
        "agent",
        "workflow",
        "content",
        "audio",
        "presentation",
        "security",
        "devops",
        "data",
        "cloud",
      ],
      required: true,
    },

    pricingType: {
      type: String,
      enum: ["free", "freemium", "paid", "api"],
      required: true,
    },

    monthlyPrice: {
      type: Number,
      default: 0,
    },

    contextWindow: {
      type: Number,
      default: 0,
    },

    strengths: [
      {
        type: String,
      },
    ],

    weaknesses: [
      {
        type: String,
      },
    ],

    bestFor: [
      {
        type: String,
      },
    ],

    websiteUrl: {
      type: String,
    },

    apiAvailable: {
      type: Boolean,
      default: false,
    },

    openSource: {
      type: Boolean,
      default: false,
    },

    popularityScore: {
      type: Number,
      default: 0,
    },

    carbonPerRequest: {
      type: Number,
      default: 0,
    },

    waterPerRequest: {
      type: Number,
      default: 0,
    },

    energyRating: {
      type: String,
      enum: ["low", "medium", "high", "very-high"],
      default: "medium",
    },

    ethicalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    dataPrivacy: {
      type: String,
      enum: ["strong", "moderate", "weak"],
      default: "moderate",
    },
  },
  {
    timestamps: true,
  }
);


aiToolSchema.index({ category: 1 });

aiToolSchema.index({ provider: 1 });

module.exports = mongoose.model("AITool", aiToolSchema);