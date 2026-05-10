const express = require("express");

const router = express.Router();

const {
  getAllOrganizations,
  createOrganization,
  getOrganizationOverview,
  updateOrganization,
} = require("../controllers/organization.controller");

router.get(
  "/",
  getAllOrganizations
);

router.post(
  "/",
  createOrganization
);

router.put(
  "/:id",
  updateOrganization
);

router.get(
  "/:id",
  getOrganizationOverview
);

module.exports = router;