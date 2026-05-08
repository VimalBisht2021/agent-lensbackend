const AITool = require("../models/AITool");

const {
  calculateHealthScore,
} = require("../algorithms/insights.algorithm");

/*
|--------------------------------------------------------------------------
| Hybrid Executive Insights
| Step 1: Composite health score algorithm (instant)
| Step 2: Groq adds executive summary (optional)
|--------------------------------------------------------------------------
*/

const generateExecutiveInsights = async ({
  organizations,
  analytics,
}) => {
  const allTools = await AITool.find();

  const report = await calculateHealthScore({
    organizations,
    analytics,
    allTools,
  });

  return {
    ...report,
    source: "algorithm",
  };
};

module.exports = {
  generateExecutiveInsights,
};