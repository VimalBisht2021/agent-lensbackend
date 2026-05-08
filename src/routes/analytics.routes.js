const express = require("express");

const router = express.Router();

const {
  getSpendAnalytics,

  getUsageAnalytics,

  getOptimizationInsights,
  getTeamAnalytics,
  getExecutiveInsights,
  getCarbonAnalytics,
} = require("../controllers/analytics.controller");

router.post(
  "/spend",
  getSpendAnalytics
);

router.get(
  "/team/:teamName",
  getTeamAnalytics
);

router.get(
  "/executive",
  getExecutiveInsights
);

router.get(
  "/usage",
  getUsageAnalytics
);

router.get(
  "/optimization",
  getOptimizationInsights
);

router.get(
  "/carbon",
  getCarbonAnalytics
);

module.exports = router;