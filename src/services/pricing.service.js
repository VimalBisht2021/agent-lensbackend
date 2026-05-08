const AITool = require("../models/AITool");

const {
  analyzeOptimization,
} = require("../algorithms/insights.algorithm");

/*
|--------------------------------------------------------------------------
| Hybrid Optimization Insights
| Step 1: Pareto + statistical analysis (instant)
| Step 2: Groq enhances with recommendations (optional)
|--------------------------------------------------------------------------
*/

const generateOptimizationInsights =
  async (analytics) => {
    const allTools = await AITool.find();

    const report = await analyzeOptimization(
      analytics,
      allTools
    );

    return {
      ...report,
      source: "algorithm",
    };
  };

module.exports = {
  generateOptimizationInsights,
};