const ApiError = require("../utils/ApiError");
const Organization = require("../models/Organization");

const organizationScope = async (req, res, next) => {
  const organizationId = req.headers["x-organization-id"];

  // If no org ID, we allow the request but flag it as unscoped
  // The controllers will then decide whether to return global data or empty data
  if (!organizationId) {
    req.organizationId = null;
    return next();
  }

  try {
    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
       // If an ID was provided but doesn't exist, it's a bad request
       return next(ApiError.badRequest("Invalid Organization ID"));
    }

    req.organizationId = organizationId;
    req.organization = organization;
    next();
  } catch (error) {
    return next(ApiError.badRequest("Malformed Organization ID"));
  }
};

module.exports = organizationScope;
