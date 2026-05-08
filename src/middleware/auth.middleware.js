const ApiError = require("../utils/ApiError");

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!process.env.API_SECRET_KEY) {
    return next();
  }

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return next(
      ApiError.badRequest("Invalid or missing API key")
    );
  }

  next();
};

module.exports = { apiKeyAuth };
