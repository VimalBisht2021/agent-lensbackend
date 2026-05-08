const express = require("express");

const router = express.Router();

const {
  validateWorkflow,
  simulatePolicy,
} = require("../controllers/workflow.controller");

router.post(
  "/validate",
  validateWorkflow
);
router.post(
  "/simulate-policy",
  simulatePolicy
);
module.exports = router;