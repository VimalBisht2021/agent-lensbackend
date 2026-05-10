const {
  generateRecommendation,
} = require("../recommendation-engine/engine");

const {
  selectOptimalTool,
} = require("../services/orchestration.service");

const {
  trackWorkflowExecution,
} = require("../services/analytics.service");

const {
  generateAIReasoning,
} = require("../ai-providers/groq.provider");

const getRecommendation = async (
  req,
  res
) => {
  try {
    const {
      task,
      budget,
      priority,
      teamName,
    } = req.body;

    const organizationId = req.organizationId || req.body.organizationId;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!task) {
      return res.status(400).json({
        success: false,
        message:
          "Task is required",
      });
    }

    if (
      organizationId &&
      !teamName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "teamName is required for organization workflows",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Dynamic Workflow Recommendation
    |--------------------------------------------------------------------------
    */

    const recommendation =
      await generateRecommendation({
        task,
        budget,
        priority,
      });

    if (!recommendation.success) {
      return res.status(400).json({
        success: false,
        message:
          recommendation.message,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Tools
    |--------------------------------------------------------------------------
    */

    const tools =
      recommendation.orchestrationFlow.map(
        (step) => step.tool
      );

    /*
    |--------------------------------------------------------------------------
    | Select Optimal Tool
    |--------------------------------------------------------------------------
    */

    const optimalTool =
      await selectOptimalTool({
        tools,
        priority,
        budget,
      });

    /*
    |--------------------------------------------------------------------------
    | Generate AI Reasoning (Groq)
    |--------------------------------------------------------------------------
    */

    let aiReasoning =
      "AI reasoning unavailable.";

    try {
      aiReasoning =
        await generateAIReasoning({
          task,
          tools,
          budget,
          priority,
        });
    } catch (error) {
      console.error(
        "Groq AI reasoning failed:",
        error.message
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Track Workflow Execution
    |--------------------------------------------------------------------------
    */

    await trackWorkflowExecution({
      task,

      toolsUsed: tools,

      optimalTool:
        optimalTool.tool,

      estimatedCost:
        recommendation.estimatedCostUSD,

      priority,

      budget,

      organizationId,

      teamName,
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message:
        "Recommendation generated successfully",

      data: {
        ...recommendation,

        optimalTool,

        aiReasoning,
      },
    });
  } catch (error) {
    console.error(
      "Recommendation Controller Error:",
      error.message
    );

    return res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
};

module.exports = {
  getRecommendation,
};