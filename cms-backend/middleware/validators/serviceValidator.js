import { body, validationResult } from "express-validator";

// Validation rules for creating/updating a service
export const serviceValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("image")
    .optional()
    .trim()
    .isString()
    .withMessage("Image must be a string"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive number"),

  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be draft or published"),
];

// Middleware to check validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        statusCode: 400,
        fields: errors.array(),
      },
    });
  }
  next();
};
