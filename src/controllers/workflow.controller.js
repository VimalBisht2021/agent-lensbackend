const {
  generateRecommendation,
} = require("../recommendation-engine/engine");

const {
  validateWorkflowPolicies,
  simulatePolicyImpact,
} = require("../services/governance.service");

const validateWorkflow =
  async (req, res) => {
    try {
      const {
        task,
        budget,
        priority,
        organizationPolicy,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | Generate Dynamic Workflow
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
      | Governance Validation
      |--------------------------------------------------------------------------
      */

      const complianceReport =
        validateWorkflowPolicies({
          workflow:
            recommendation.orchestrationFlow,
          organizationPolicy,
          estimatedCost:
            recommendation.estimatedCostUSD,
        });

      return res.status(200).json({
        success: true,
        message:
          "Workflow governance validation completed",
        data: {
          recommendation,
          complianceReport,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const simulatePolicy =
  async (req, res) => {
    try {
      const {
        currentSubscriptions,
        scenario,
      } = req.body;

      const simulation =
        simulatePolicyImpact({
          currentSubscriptions,
          scenario,
        });

      return res.status(200).json({
        success: true,
        message:
          "Policy simulation completed successfully",
        data: simulation,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  validateWorkflow,
  simulatePolicy,
};