const express = require("express");

const router = express.Router();

const {
  createOrganization,

  getOrganizationOverview,
} = require("../controllers/organization.controller");

router.post(
  "/",
  createOrganization
);

router.get(
  "/:id",
  getOrganizationOverview
);

module.exports = router;