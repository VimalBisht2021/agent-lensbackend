const Organization =
  require("../models/Organization");

const {
  analyzeSpend,
} = require("../analytics/spend.analytics");

const getAllOrganizations =
  async (req, res) => {
    try {
      const organizations =
        await Organization.find().sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        message:
          "Organizations fetched successfully",
        data: organizations,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const createOrganization =
  async (req, res) => {
    try {
      const organization =
        await Organization.create(
          req.body
        );

      return res.status(201).json({
        success: true,
        message:
          "Organization created successfully",
        data: organization,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const getOrganizationOverview =
  async (req, res) => {
    try {
      const { id } = req.params;

      const organization =
        await Organization.findById(id);

      if (!organization) {
        return res.status(404).json({
          success: false,
          message:
            "Organization not found",
        });
      }

      const spendInsights =
        await analyzeSpend(
          organization.subscriptions
        );

      return res.status(200).json({
        success: true,
        message:
          "Organization overview fetched successfully",
        data: {
          organization,
          spendInsights,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  getAllOrganizations,
  createOrganization,
  getOrganizationOverview,
};