// Error handler middleware

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
  console.error(err.stack);
  }

  let statusCode = 500;
  let message = "An unexpected error occurred";

  // Handle specific error types (e.g., validation errors, not found errors)

  // 1. Mongoose Validation Error (missing required fields, wrong types)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }
  // 2. Mongoose CastError (invalid MongoDB ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // 3. MongoDB Duplicate Key Error (trying to create duplicate unique field)
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
    // TODO: Extract which field is duplicate
  }

  // 4. Custom error with statusCode property
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }


  const response = {
  success: false,
  error: {
    message: message,
    statusCode: statusCode,
    },
  };

// Add stack trace in development only
  if (process.env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
