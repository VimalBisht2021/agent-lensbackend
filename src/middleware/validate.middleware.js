const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return next(
      ApiError.badRequest("Validation failed", errors)
    );
  }

  req.body = result.data;
  next();
};

module.exports = validate;
