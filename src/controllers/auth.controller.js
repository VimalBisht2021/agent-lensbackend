const User = require("../models/User");
const Organization = require("../models/Organization");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "supersecret", {
    expiresIn: "30d",
  });
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, organizationName, industry } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(ApiError.badRequest("User already exists"));
    }

    // Create a default organization for the new user
    const organization = await Organization.create({
      name: organizationName || `${name}'s Organization`,
      industry: industry || "Other",
      subscriptions: [],
      teams: [{ name: "General", monthlyBudget: 0 }]
    });

    const user = await User.create({
      name,
      email,
      password,
      organizationId: organization._id,
      role: "admin",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return next(ApiError.unauthorized("Invalid email or password"));
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login };
