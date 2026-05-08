const { z } = require("zod");
const { BUDGET_TYPES, PRIORITY_TYPES } = require("../utils/constants");

const recommendationSchema = z.object({
  task: z
    .string({ required_error: "Task is required" })
    .min(3, "Task must be at least 3 characters"),

  budget: z.enum(BUDGET_TYPES).optional().default("medium"),

  priority: z.enum(PRIORITY_TYPES).optional().default("quality"),

  organizationId: z.string().optional(),

  teamName: z.string().optional(),
});

module.exports = { recommendationSchema };
