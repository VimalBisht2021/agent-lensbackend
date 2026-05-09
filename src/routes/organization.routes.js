const express = require("express");

const router = express.Router();

const {
  getAllOrganizations,
  createOrganization,
  getOrganizationOverview,
} = require("../controllers/organization.controller");

router.get(
  "/",
  getAllOrganizations
);

router.post(
  "/",
  createOrganization
);

router.get(
  "/:id",
  getOrganizationOverview
);

module.exports = router;