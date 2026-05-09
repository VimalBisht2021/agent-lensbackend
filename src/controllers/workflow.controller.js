const {
  generateRecommendation,
} = require("../recommendation-engine/engine");

const {
  validateWorkflowPolicies,
  simulatePolicyImpact,
} = require("../services/governance.service");

const Workflow = require("../models/Workflow");
const UsageAnalytics = require("../models/UsageAnalytics");
const Organization = require("../models/Organization");

/*
|--------------------------------------------------------------------------
| POST /api/workflows/validate
| Validates & saves a workflow. Accepts an optional organizationId to
| fetch the real org policy from the DB instead of a raw object in body.
|--------------------------------------------------------------------------
*/

const validateWorkflow = async (req, res) => {
  try {
    const {
      task,
      budget,
      priority,
      organizationId,
      teamName,
      organizationPolicy: inlinePolicy,
    } = req.body;

    if (!task || !budget || !priority) {
      return res.status(400).json({
        success: false,
        message:
          "task, budget, and priority are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Step 1: Resolve Organization Policy
    | Use organizationId → fetch from DB. Fall back to inlinePolicy or defaults.
    |--------------------------------------------------------------------------
    */

    let organizationPolicy = inlinePolicy || {
      restrictedTools: [],
      maxMonthlyBudget: Infinity,
    };

    let resolvedOrg = null;

    if (organizationId) {
      resolvedOrg = await Organization.findById(organizationId);

      if (!resolvedOrg) {
        return res.status(404).json({
          success: false,
          message: "Organization not found",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Build org policy from the Organization's own data
      |--------------------------------------------------------------------------
      */

      const team = teamName
        ? resolvedOrg.teams.find(
            (t) => t.name === teamName
          )
        : null;

      organizationPolicy = {
        restrictedTools:
          team?.restrictedTools ||
          [],
        maxMonthlyBudget:
          team?.monthlyBudget ||
          resolvedOrg.monthlyAISpend ||
          Infinity,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Step 2: Generate AI Recommendation
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
        message: recommendation.message,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Step 3: Governance Validation
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

    /*
    |--------------------------------------------------------------------------
    | Step 4: Persist workflow to DB
    |--------------------------------------------------------------------------
    */

    const savedWorkflow = await Workflow.create({
      task,
      budget,
      priority,
      organizationId: resolvedOrg?._id,
      teamName,
      orchestrationFlow:
        recommendation.orchestrationFlow,
      estimatedCostUSD:
        recommendation.estimatedCostUSD,
      reasoning: recommendation.reasoning,
      optimizationNote:
        recommendation.optimizationNote,
      source: recommendation.source,
      complianceReport,
      status: "validated",
    });

    /*
    |--------------------------------------------------------------------------
    | Step 5: Track usage analytics
    |--------------------------------------------------------------------------
    */

    await UsageAnalytics.create({
      task,
      toolsUsed: recommendation.orchestrationFlow.map(
        (s) => s.tool
      ),
      optimalTool:
        recommendation.orchestrationFlow[0]?.tool,
      estimatedCost:
        recommendation.estimatedCostUSD,
      priority,
      budget,
      organizationId: resolvedOrg?._id,
      teamName,
    });

    /*
    |--------------------------------------------------------------------------
    | Increment team workflowsExecuted counter (if org + team exist)
    |--------------------------------------------------------------------------
    */

    if (resolvedOrg && teamName) {
      await Organization.updateOne(
        {
          _id: resolvedOrg._id,
          "teams.name": teamName,
        },
        {
          $inc: {
            "teams.$.workflowsExecuted": 1,
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Workflow validated and saved successfully",
      data: {
        workflowId: savedWorkflow._id,
        recommendation,
        complianceReport,
        organizationPolicy,
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
| POST /api/workflows/simulate-policy
|--------------------------------------------------------------------------
*/

const simulatePolicy = async (req, res) => {
  try {
    const {
      currentSubscriptions,
      scenario,
    } = req.body;

    const simulation = simulatePolicyImpact({
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

/*
|--------------------------------------------------------------------------
| GET /api/workflows
| List all saved workflows with optional filters
|--------------------------------------------------------------------------
*/

const getWorkflows = async (req, res) => {
  try {
    const {
      organizationId,
      status,
      limit = 20,
      page = 1,
    } = req.query;

    const filter = {};
    if (organizationId)
      filter.organizationId = organizationId;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [workflows, total] = await Promise.all([
      Workflow.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("organizationId", "name industry"),
      Workflow.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Workflows fetched successfully",
      data: {
        workflows,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
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
| GET /api/workflows/:id
|--------------------------------------------------------------------------
*/

const getWorkflowById = async (req, res) => {
  try {
    const { id } = req.params;

    const workflow = await Workflow.findById(id).populate(
      "organizationId",
      "name industry organizationSize"
    );

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workflow fetched successfully",
      data: workflow,
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
  getWorkflows,
  getWorkflowById,
};