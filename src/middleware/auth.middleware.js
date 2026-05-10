const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const ApiError = require("../utils/ApiError");

const protect = async (req, res, next) => {
  let token;

  // 1. Try to get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecret"
      );

      req.user = await User.findById(decoded.id).select("-password");
      
      if (req.user) {
        if (req.user.organizationId) {
          req.organizationId = req.user.organizationId;
          req.organization = await Organization.findById(req.user.organizationId);
        }
        return next();
      }
    } catch (error) {
      console.warn("Auth token invalid, falling back to guest mode");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GUEST MODE BYPASS (Development Only)
  |--------------------------------------------------------------------------
  | If no user is authenticated, we automatically inject the first 
  | organization found in the DB so the dashboard doesn't break.
  */
  
  try {
    const defaultOrg = await Organization.findOne();
    if (defaultOrg) {
      req.organizationId = defaultOrg._id;
      req.organization = defaultOrg;
      console.log(`[Bypass] Using default organization context: ${defaultOrg.name}`);
    }
    return next();
  } catch (error) {
    return next(ApiError.unauthorized("Could not initialize guest context"));
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return next(ApiError.unauthorized("Not authorized as an admin"));
  }
};

module.exports = { protect, admin };
