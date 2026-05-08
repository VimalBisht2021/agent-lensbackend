const {
  analyzeSpend,
} = require("../analytics/spend.analytics");

const UsageAnalytics =
  require("../models/UsageAnalytics");

const {
  generateOptimizationInsights,
} = require("../services/pricing.service");

const Organization =
  require("../models/Organization");

const {
  generateExecutiveInsights,
} = require("../analytics/organization.analytics");

const getSpendAnalytics = async (
  req,
  res
) => {
  try {
    const { subscriptions } = req.body;

    const usageData = await UsageAnalytics.find();

    const analytics =
      await analyzeSpend(subscriptions, usageData);

    return res.status(200).json({
      success: true,
      message:
        "Spend analytics generated successfully",
      data: analytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getExecutiveInsights =
  async (req, res) => {
    try {
      const organizations =
        await Organization.find();

      const analytics =
        await UsageAnalytics.find();

      const executiveInsights =
        await generateExecutiveInsights({
          organizations,
          analytics,
        });

      return res.status(200).json({
        success: true,
        message:
          "Executive insights generated successfully",
        data: executiveInsights,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const getUsageAnalytics =
  async (req, res) => {
    try {
      const analytics =
        await UsageAnalytics.find()
          .sort({ createdAt: -1 })
          .limit(20);

      return res.status(200).json({
        success: true,
        message:
          "Usage analytics fetched successfully",
        data: analytics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const getOptimizationInsights =
  async (req, res) => {
    try {
      const analytics =
        await UsageAnalytics.find();

      const optimizationReport =
        await generateOptimizationInsights(
          analytics
        );

      return res.status(200).json({
        success: true,
        message:
          "Optimization insights generated successfully",
        data: optimizationReport,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const getTeamAnalytics =
  async (req, res) => {
    try {
      const { teamName } = req.params;

      const analytics =
        await UsageAnalytics.find({
          teamName,
        });

      /*
      |--------------------------------------------------------------------------
      | Team Spend
      |--------------------------------------------------------------------------
      */

      const totalSpend = analytics.reduce(
        (acc, curr) =>
          acc + curr.estimatedCost,
        0
      );

      /*
      |--------------------------------------------------------------------------
      | Team Tool Usage
      |--------------------------------------------------------------------------
      */

      const toolUsage = {};

      analytics.forEach((entry) => {
        entry.toolsUsed.forEach((tool) => {
          toolUsage[tool] =
            (toolUsage[tool] || 0) + 1;
        });
      });

      return res.status(200).json({
        success: true,
        message:
          "Team analytics fetched successfully",
        data: {
          teamName,
          totalWorkflows: analytics.length,
          totalSpend,
          toolUsage,
          analytics,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Carbon Footprint Analytics
|--------------------------------------------------------------------------
*/

const AITool = require("../models/AITool");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getCarbonAnalytics =
  async (req, res) => {
    try {
      const analytics =
        await UsageAnalytics.find();

      const tools = await AITool.find();

      const toolMetricsMap = {};
      tools.forEach((t) => {
        toolMetricsMap[t.name] = {
          carbonPerRequest: t.carbonPerRequest,
          waterPerRequest: t.waterPerRequest || 0,
          energyRating: t.energyRating,
        };
      });

      let totalCarbon = 0;
      let totalWater = 0;
      const metricsByTool = {};

      analytics.forEach((entry) => {
        entry.toolsUsed.forEach((tool) => {
          const metrics = toolMetricsMap[tool] || { carbonPerRequest: 0, waterPerRequest: 0 };
          totalCarbon += metrics.carbonPerRequest;
          totalWater += metrics.waterPerRequest;

          if (!metricsByTool[tool]) {
            metricsByTool[tool] = { carbon: 0, water: 0 };
          }
          metricsByTool[tool].carbon += metrics.carbonPerRequest;
          metricsByTool[tool].water += metrics.waterPerRequest;
        });
      });

      const prompt = `You are a sustainability analyst for AI infrastructure. Analyze this organization's AI carbon and water footprint. Note: Video and Image generation tools require massive amounts of water for datacenter cooling compared to text tools.

Total CO2 Emissions: ${totalCarbon}g CO2
Total Water Consumed: ${totalWater} ml
Total Workflows: ${analytics.length}

Metrics by Tool (Carbon in grams, Water in milliliters):
${JSON.stringify(metricsByTool, null, 2)}

Tool Energy Ratings:
${JSON.stringify(
  tools.map((t) => ({
    name: t.name,
    category: t.category,
    energyRating: t.energyRating,
    carbonPerRequest: t.carbonPerRequest,
    waterPerRequest: t.waterPerRequest,
  })),
  null,
  2
)}

Provide sustainability analysis with:
1. Environmental impact assessment (focus on the water cooling impact of image/video tools if high)
2. Which tools are most carbon and water-intensive
3. Greener alternatives
4. Reduction strategies

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "impactLevel": "low/medium/high",
  "treesNeeded": 0,
  "litersOfWaterWasted": 0,
  "waterImpactAnalysis": "string explaining the damage caused by the image/video generations",
  "greenAlternatives": ["suggestion1"],
  "reductionStrategies": ["strategy1"],
  "sustainabilityScore": 0
}`;

      const completion =
        await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        });

      const text =
        completion.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const aiReport = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : {};

      return res.status(200).json({
        success: true,
        message:
          "Carbon analytics generated successfully",
        data: {
          totalCarbonGrams: totalCarbon,
          totalWaterConsumedMl: totalWater,
          totalWorkflows: analytics.length,
          avgCarbonPerWorkflow:
            analytics.length > 0
              ? totalCarbon / analytics.length
              : 0,
          avgWaterPerWorkflow:
            analytics.length > 0
              ? totalWater / analytics.length
              : 0,
          metricsByTool,
          ...aiReport,
          source: "algorithm+groq",
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  getSpendAnalytics,
  getUsageAnalytics,
  getOptimizationInsights,
  getTeamAnalytics,
  getExecutiveInsights,
  getCarbonAnalytics,
};