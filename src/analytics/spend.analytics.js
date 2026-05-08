const AITool = require("../models/AITool");

const {
  analyzeSubscriptionSpend,
} = require("../algorithms/overlap.algorithm");

/*
|--------------------------------------------------------------------------
| Hybrid Spend Analysis
| Step 1: Jaccard similarity + DB prices (instant, deterministic)
| Step 2: Groq explains findings (optional)
|--------------------------------------------------------------------------
*/

const analyzeSpend = async (
  subscriptions,
  usageData = []
) => {
  const allTools = await AITool.find();

  const analysis =
    await analyzeSubscriptionSpend(
      subscriptions,
      allTools,
      usageData
    );

  return {
    ...analysis,
    source: "algorithm",
  };
};

module.exports = {
  analyzeSpend,
};