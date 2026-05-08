const { z } = require("zod");
const { BUDGET_TYPES, PRIORITY_TYPES, POLICY_ACTIONS } = require("../utils/constants");

const validateWorkflowSchema = z.object({
  task: z
    .string({ required_error: "Task is required" })
    .min(3, "Task must be at least 3 characters"),

  budget: z.enum(BUDGET_TYPES).optional().default("medium"),

  priority: z.enum(PRIORITY_TYPES).optional().default("quality"),

  organizationPolicy: z.object({
    restrictedTools: z.array(z.string()).optional().default([]),
    maxMonthlyBudget: z.number().min(0),
  }),
});

const simulatePolicySchema = z.object({
  currentSubscriptions: z
    .array(z.string())
    .min(1, "At least one subscription is required"),

  scenario: z.object({
    action: z.enum(POLICY_ACTIONS),
    tool: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

module.exports = { validateWorkflowSchema, simulatePolicySchema };
