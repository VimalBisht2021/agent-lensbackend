class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static success(res, message, data, statusCode = 200) {
    return res.status(statusCode).json(
      new ApiResponse(statusCode, message, data)
    );
  }

  static created(res, message, data) {
    return ApiResponse.success(res, message, data, 201);
  }

  static error(res, message, statusCode = 500) {
    return res.status(statusCode).json(
      new ApiResponse(statusCode, message)
    );
  }
}

module.exports = ApiResponse;
