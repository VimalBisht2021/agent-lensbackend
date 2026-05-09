const express = require("express");

const router = express.Router();

const {
  validateWorkflow,
  simulatePolicy,
  getWorkflows,
  getWorkflowById,
} = require("../controllers/workflow.controller");

/*
|--------------------------------------------------------------------------
| Workflow Routes
|--------------------------------------------------------------------------
*/

// List all saved workflows (with optional ?organizationId=&status=&page=&limit=)
router.get("/", getWorkflows);

// Get a single workflow by ID
router.get("/:id", getWorkflowById);

// Validate & save a new workflow
router.post("/validate", validateWorkflow);

// Simulate a policy change impact
router.post("/simulate-policy", simulatePolicy);

module.exports = router;