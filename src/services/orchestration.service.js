const AITool = require("../models/AITool");

const selectOptimalTool = async ({
  tools,
  priority,
  budget,
}) => {
  let bestTool = null;
  let bestScore = -1;

  const dbTools = await AITool.find({ name: { $in: tools } });

  dbTools.forEach((tool) => {
    // Generate REAL metrics dynamically based on the DB schema!
    const quality = Math.min(10, (tool.popularityScore / 10)); // 0-10
    const speed = Math.min(10, (tool.contextWindow / 20000) || 5); // 0-10 based on context size
    const cost = tool.monthlyPrice === 0 ? 10 : Math.max(1, 10 - (tool.monthlyPrice / 10)); // 0-10 based on cheapness

    const scores = {
      quality: Math.round(quality * 10) / 10,
      speed: Math.round(speed * 10) / 10,
      cost: Math.round(cost * 10) / 10,
    };

    let totalScore = 0;

    /*
    |--------------------------------------------------------------------------
    | Priority Weighting
    |--------------------------------------------------------------------------
    */

    if (priority === "quality") {
      totalScore += scores.quality * 2;
    }

    if (priority === "speed") {
      totalScore += scores.speed * 2;
    }

    /*
    |--------------------------------------------------------------------------
    | Budget Optimization
    |--------------------------------------------------------------------------
    */

    if (budget === "low") {
      totalScore += scores.cost * 2;
    }

    totalScore += scores.quality + scores.speed + scores.cost;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestTool = {
        tool: tool.name,
        scores,
        totalScore: Math.round(totalScore * 10) / 10,
      };
    }
  });

  return bestTool;
};

module.exports = {
  selectOptimalTool,
};