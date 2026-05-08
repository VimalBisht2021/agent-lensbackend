const UsageAnalytics =
  require("../models/UsageAnalytics");

const trackWorkflowExecution =
  async ({
    task,
    toolsUsed,
    optimalTool,
    estimatedCost,
    priority,
    budget,
    organizationId,
    teamName,
  }) => {
    try {
      const analytics =
        await UsageAnalytics.create({
          task,

          toolsUsed,

          optimalTool,

          estimatedCost,

          priority,

          budget,
          teamName,

          organizationId,
        });

      return analytics;
    } catch (error) {
      console.error(
        "Analytics Tracking Error:",
        error.message
      );
    }
  };

module.exports = {
  trackWorkflowExecution,
};