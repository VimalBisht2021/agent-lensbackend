const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const ApiError = require("../utils/ApiError");

const protect = async (req, res, next) => {
  let token;

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
      
      if (!req.user) {
        return next(ApiError.unauthorized("User not found"));
      }

      // Inject organization context automatically from user
      if (req.user.organizationId) {
        req.organizationId = req.user.organizationId;
        req.organization = await Organization.findById(req.user.organizationId);
      }

      next();
    } catch (error) {
      return next(ApiError.unauthorized("Not authorized, token failed"));
    }
  }

  if (!token) {
    return next(ApiError.unauthorized("Not authorized, no token"));
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
