/*
|--------------------------------------------------------------------------
| Statistical Optimization & Health Score Algorithm
|--------------------------------------------------------------------------
| Pareto analysis, underutilization detection, cost efficiency,
| and composite health scoring — no AI calls.
|--------------------------------------------------------------------------
*/

const { detectSemanticOverlaps } = require("../ai-providers/groq.provider");

/*
|--------------------------------------------------------------------------
| Optimization Analysis (Pareto + Frequency + Underutilization)
|--------------------------------------------------------------------------
*/

const analyzeOptimization = async (
  analytics,
  allTools
) => {
  const toolUsageMap = {};
  const taskMap = {};
  let totalCost = 0;

  analytics.forEach((entry) => {
    totalCost += entry.estimatedCost;
    taskMap[entry.task] =
      (taskMap[entry.task] || 0) + 1;

    entry.toolsUsed.forEach((tool) => {
      toolUsageMap[tool] =
        (toolUsageMap[tool] || 0) + 1;
    });
  });

  const insights = [];
  const redundancies = [];
  const costSavings = [];
  const actions = [];

  /*
  |--- Pareto Analysis (80/20 Rule) ---|
  */
  const sortedTools = Object.entries(
    toolUsageMap
  ).sort((a, b) => b[1] - a[1]);

  const totalUsage = sortedTools.reduce(
    (sum, [, count]) => sum + count,
    0
  );

  let cumulativeUsage = 0;
  const paretoTools = [];

  sortedTools.forEach(([tool, count]) => {
    cumulativeUsage += count;
    const percentage =
      (cumulativeUsage / totalUsage) * 100;

    if (percentage <= 80) {
      paretoTools.push(tool);
    }
  });

  if (paretoTools.length > 0) {
    insights.push(
      `Pareto Principle: ${paretoTools.join(", ")} account for 80% of all AI usage — focus optimization here`
    );
  }

  /*
  |--- Underutilization Detection ---|
  */
  const subscribedToolNames = allTools.map(
    (t) => t.name
  );
  const usedToolNames = Object.keys(
    toolUsageMap
  );

  const unusedTools =
    subscribedToolNames.filter(
      (name) => !usedToolNames.includes(name)
    );

  if (unusedTools.length > 0) {
    insights.push(
      `${unusedTools.length} tools in catalog are never used: ${unusedTools.slice(0, 5).join(", ")}`
    );
  }

  // Low-usage tools (used but barely)
  sortedTools.forEach(([tool, count]) => {
    const usagePercent =
      (count / totalUsage) * 100;
    if (usagePercent < 5 && count > 0) {
      insights.push(
        `${tool} is underutilized (${usagePercent.toFixed(1)}% of usage) — evaluate if subscription is justified`
      );
    }
  });

  /*
  |--- Cost Efficiency Analysis ---|
  */
  const avgCostPerWorkflow =
    analytics.length > 0
      ? totalCost / analytics.length
      : 0;

  if (avgCostPerWorkflow > 30) {
    costSavings.push(
      `Average cost per workflow is $${avgCostPerWorkflow.toFixed(2)} — consider routing simple tasks to free/cheaper models`
    );
  }

  // Find expensive tools that could be replaced
  const toolPriceMap = {};
  allTools.forEach((t) => {
    toolPriceMap[t.name] = t.monthlyPrice;
  });

  sortedTools.forEach(([tool, count]) => {
    const price = toolPriceMap[tool] || 0;
    if (price >= 20 && count < 3) {
      costSavings.push(
        `${tool} costs $${price}/month but was only used ${count} times — low ROI`
      );
    }
  });

  /*
  |--- Open Source Opportunities ---|
  */
  const openSourceTools = allTools.filter(
    (t) => t.openSource
  );
  const paidUsedTools = sortedTools
    .map(([name]) => name)
    .filter(
      (name) =>
        (toolPriceMap[name] || 0) > 0
    );

  if (
    paidUsedTools.length > 0 &&
    openSourceTools.length > 0
  ) {
    costSavings.push(
      `Open-source alternatives available: ${openSourceTools.map((t) => t.name).join(", ")} — could replace some paid tools for simpler tasks`
    );
  }

  /*
  |--- Overlap Redundancies ---|
  */
  const usedToolObjects = allTools.filter(
    (t) => usedToolNames.includes(t.name)
  );

  const utilizationRates = {};
  const totalWorkflows = analytics.length;
  usedToolNames.forEach(toolName => {
      utilizationRates[toolName] = totalWorkflows > 0 ? (toolUsageMap[toolName] || 0) / totalWorkflows : 1;
  });

  const overlaps = await detectSemanticOverlaps(
    usedToolObjects,
    utilizationRates
  );

  overlaps.forEach((o) => {
    redundancies.push(o.recommendation);
  });

  /*
  |--- Action Items ---|
  */
  if (redundancies.length > 0) {
    actions.push(
      "Consolidate overlapping tool subscriptions"
    );
  }
  if (costSavings.length > 0) {
    actions.push(
      "Review underperforming subscriptions for ROI"
    );
  }
  if (paretoTools.length <= 2) {
    actions.push(
      "Diversify AI tool usage — over-reliance on few tools creates risk"
    );
  }

  return {
    insights,
    redundancies,
    costSavingOpportunities: costSavings,
    recommendedActions: actions,
    totalWorkflowExecutions:
      analytics.length,
    totalEstimatedSpend: totalCost,
    avgCostPerWorkflow:
      Math.round(avgCostPerWorkflow * 100) /
      100,
    toolUsageMap,
    taskDistribution: taskMap,
    paretoTools,
  };
};

/*
|--------------------------------------------------------------------------
| Composite Health Score Algorithm
|--------------------------------------------------------------------------
| Formula:
|   healthScore = 100
|     - (overlapPenalty)
|     - (wastePenalty)
|     - (riskPenalty)
|     + (diversityBonus)
|     + (ethicalBonus)
|--------------------------------------------------------------------------
*/

const calculateHealthScore = async ({
  organizations,
  analytics,
  allTools,
}) => {
  let score = 100;
  const risks = [];
  const recommendations = [];

  const toolUsageMap = {};
  let totalSpend = 0;

  analytics.forEach((entry) => {
    totalSpend += entry.estimatedCost;
    entry.toolsUsed.forEach((tool) => {
      toolUsageMap[tool] =
        (toolUsageMap[tool] || 0) + 1;
    });
  });

  const usedToolNames = Object.keys(
    toolUsageMap
  );
  const usedTools = allTools.filter((t) =>
    usedToolNames.includes(t.name)
  );

  /*
  |--- Overlap Penalty (up to -20) ---|
  */
  const utilizationRates = {};
  const totalWorkflows = analytics.length;
  usedToolNames.forEach(toolName => {
      utilizationRates[toolName] = totalWorkflows > 0 ? (toolUsageMap[toolName] || 0) / totalWorkflows : 1;
  });

  const overlaps = await detectSemanticOverlaps(
    usedTools,
    utilizationRates
  );
  
  const overlapPenalty = Math.min(
    overlaps.length * 7,
    20
  );
  score -= overlapPenalty;

  if (overlaps.length > 0) {
    risks.push(
      `${overlaps.length} tool overlap(s) detected — potential subscription waste`
    );
  }

  /*
  |--- Spend Risk (up to -15) ---|
  */
  const avgCost =
    analytics.length > 0
      ? totalSpend / analytics.length
      : 0;

  if (avgCost > 40) {
    score -= 15;
    risks.push(
      "Average cost per workflow is very high ($" +
        avgCost.toFixed(2) +
        ")"
    );
  } else if (avgCost > 25) {
    score -= 8;
    risks.push(
      "Average cost per workflow is above optimal ($" +
        avgCost.toFixed(2) +
        ")"
    );
  }

  /*
  |--- Diversity Bonus (up to +10) ---|
  */
  const uniqueCategories = new Set(
    usedTools.map((t) => t.category)
  );
  const diversityBonus = Math.min(
    uniqueCategories.size * 3,
    10
  );
  score += diversityBonus;

  if (uniqueCategories.size < 2) {
    risks.push(
      "Low tool diversity — over-reliance on single category"
    );
  }

  /*
  |--- Ethical Bonus (up to +10) ---|
  */
  const avgEthical =
    usedTools.length > 0
      ? usedTools.reduce(
          (sum, t) =>
            sum + (t.ethicalScore || 0),
          0
        ) / usedTools.length
      : 0;

  const ethicalBonus = Math.round(
    avgEthical / 10
  );
  score += ethicalBonus;

  if (avgEthical < 65) {
    risks.push(
      "Low average ethical score across AI tools — review data privacy practices"
    );
  }

  /*
  |--- Carbon Risk (up to -10) ---|
  */
  const avgCarbon =
    usedTools.length > 0
      ? usedTools.reduce(
          (sum, t) =>
            sum + (t.carbonPerRequest || 0),
          0
        ) / usedTools.length
      : 0;

  if (avgCarbon > 5) {
    score -= 10;
    risks.push(
      "High carbon footprint — consider greener AI alternatives"
    );
  } else if (avgCarbon > 3) {
    score -= 5;
  }

  /*
  |--- Clamp Score ---|
  */
  score = Math.max(0, Math.min(100, score));

  /*
  |--- Recommendations ---|
  */
  if (overlaps.length > 0)
    recommendations.push(
      "Consolidate overlapping subscriptions"
    );
  if (avgCost > 25)
    recommendations.push(
      "Implement cost-aware routing for simple tasks"
    );
  if (uniqueCategories.size < 3)
    recommendations.push(
      "Diversify tool portfolio across more categories"
    );
  if (avgEthical < 70)
    recommendations.push(
      "Prioritize tools with higher ethical and privacy scores"
    );
  if (avgCarbon > 3)
    recommendations.push(
      "Adopt low-carbon AI tools for routine tasks"
    );

  const estimatedSavings = Math.round(
    totalSpend * 0.15 +
      overlaps.length * 10
  );

  // Key metrics
  const sortedUsage = Object.entries(
    toolUsageMap
  ).sort((a, b) => b[1] - a[1]);

  return {
    healthScore: Math.round(score),
    totalOrganizations:
      organizations.length,
    totalWorkflowExecutions:
      analytics.length,
    totalAISpend: totalSpend,
    estimatedSavings,
    risks,
    recommendations,
    toolUsageMap,
    keyMetrics: {
      avgCostPerWorkflow:
        Math.round(avgCost * 100) / 100,
      mostUsedTool:
        sortedUsage[0]?.[0] || "N/A",
      leastUsedTool:
        sortedUsage[sortedUsage.length - 1]?.[0] ||
        "N/A",
      toolDiversity: uniqueCategories.size,
      avgEthicalScore:
        Math.round(avgEthical),
      avgCarbonPerRequest:
        Math.round(avgCarbon * 100) / 100,
    },
  };
};

module.exports = {
  analyzeOptimization,
  calculateHealthScore,
};
