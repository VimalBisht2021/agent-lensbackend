class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }

  static unauthorized(message = "Not authorized") {
    return new ApiError(401, message);
  }
}

module.exports = ApiError;
