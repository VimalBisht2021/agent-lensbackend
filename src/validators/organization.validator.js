const { z } = require("zod");
const { ORG_SIZES } = require("../utils/constants");

const createOrganizationSchema = z.object({
  name: z
    .string({ required_error: "Organization name is required" })
    .min(2, "Name must be at least 2 characters"),

  industry: z.string().optional(),

  organizationSize: z.enum(ORG_SIZES).optional().default("startup"),

  subscriptions: z.array(z.string()).optional().default([]),

  monthlyAISpend: z.number().min(0).optional().default(0),

  aiGoals: z.array(z.string()).optional().default([]),

  teams: z
    .array(
      z.object({
        name: z.string({ required_error: "Team name is required" }),
        aiTools: z.array(z.string()).optional().default([]),
        monthlyBudget: z.number().min(0).optional().default(0),
        restrictedTools: z.array(z.string()).optional().default([]),
        workflowsExecuted: z.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
});

module.exports = { createOrganizationSchema };
