const AITool = require("../models/AITool");

const {
  generateToolRanking,
} = require("../algorithms/scoring.algorithm");

const {
  generateAIReasoning,
} = require("../ai-providers/groq.provider");

/*
|--------------------------------------------------------------------------
| Hybrid Recommendation Engine
| Step 1: Algorithm scores & ranks tools (instant, deterministic)
| Step 2: Groq AI explains the reasoning (enhancement)
|--------------------------------------------------------------------------
*/

const generateRecommendation = async ({
  task,
  budget,
  priority,
}) => {
  const availableTools =
    await AITool.find();

  if (availableTools.length === 0) {
    return {
      success: false,
      message:
        "No AI tools in database. Run seed first.",
    };
  }

  /*
  |--- Step 1: Algorithmic Scoring (always works) ---|
  */

  const ranking = generateToolRanking(
    availableTools,
    task,
    budget,
    priority
  );

  if (
    !ranking.orchestrationFlow ||
    ranking.orchestrationFlow.length === 0
  ) {
    return {
      success: false,
      message:
        "Could not find suitable tools for this task",
    };
  }

  /*
  |--- Step 2: AI Explanation (optional enhancement) ---|
  */

  let aiReasoning = null;

  try {
    const tools =
      ranking.orchestrationFlow.map(
        (s) => s.tool
      );

    aiReasoning = await generateAIReasoning({
      task,
      tools,
      budget,
      priority,
    });
  } catch (error) {
    console.error(
      "AI reasoning skipped:",
      error.message
    );
  }

  return {
    success: true,
    workflow: task,
    orchestrationFlow:
      ranking.orchestrationFlow,
    estimatedCostUSD: ranking.estimatedCostUSD,
    reasoning:
      aiReasoning ||
      `Workflow generated using weighted multi-criteria scoring across ${availableTools.length} tools.`,
    optimizationNote: `Primary category: ${ranking.taskAnalysis.primaryCategory}. Budget: ${budget}. Priority: ${priority}.`,
    taskAnalysis: ranking.taskAnalysis,
    allScores: ranking.allScores,
    source: aiReasoning
      ? "algorithm+groq"
      : "algorithm-only",
  };
};

module.exports = {
  generateRecommendation,
};