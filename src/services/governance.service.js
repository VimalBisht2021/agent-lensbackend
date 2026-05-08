const validateWorkflowPolicies = ({
  workflow,
  organizationPolicy,
  estimatedCost,
}) => {
  const violations = [];

  /*
  |--------------------------------------------------------------------------
  | Restricted Tools Check
  |--------------------------------------------------------------------------
  */

  workflow.forEach((step) => {
    if (
      organizationPolicy.restrictedTools.includes(
        step.tool
      )
    ) {
      violations.push(
        `${step.tool} is restricted by organization policy`
      );
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Budget Validation
  |--------------------------------------------------------------------------
  */

  if (
    estimatedCost >
    organizationPolicy.maxMonthlyBudget
  ) {
    violations.push(
      "Estimated workflow cost exceeds organization budget"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Final Response
  |--------------------------------------------------------------------------
  */

  return {
    compliant:
      violations.length === 0,

    violations,
  };
};

const simulatePolicyImpact = ({
  currentSubscriptions,
  scenario,
}) => {
  let projectedSpend =
    currentSubscriptions.length * 20;

  const predictions = [];

  /*
  |--------------------------------------------------------------------------
  | Remove Tool Simulation
  |--------------------------------------------------------------------------
  */

  if (
    scenario.action === "remove"
  ) {
    projectedSpend -= 20;

    predictions.push(
      `${scenario.tool} removed from organizational AI stack.`
    );

    /*
    |--------------------------------------------------------------------------
    | Workflow Impact
    |--------------------------------------------------------------------------
    */

    if (
      scenario.tool === "ChatGPT"
    ) {
      predictions.push(
        "Debugging workflows may become slower."
      );
    }

    if (
      scenario.tool === "Claude"
    ) {
      predictions.push(
        "Architecture quality may decrease for engineering teams."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Replace Tool Simulation
  |--------------------------------------------------------------------------
  */

  if (
    scenario.action === "replace"
  ) {
    predictions.push(
      `${scenario.from} replaced with ${scenario.to}.`
    );

    if (
      scenario.to === "Gemini"
    ) {
      predictions.push(
        "Research workflows may become more cost-efficient."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Budget Reduction Simulation
  |--------------------------------------------------------------------------
  */

  if (
    scenario.action ===
    "reduce_budget"
  ) {
    predictions.push(
      "Low-cost routing strategies recommended."
    );

    predictions.push(
      "High-quality workflows may be reduced."
    );
  }

  return {
    projectedSpend,

    predictions,
  };
};

module.exports = {
  validateWorkflowPolicies,
  simulatePolicyImpact,
};