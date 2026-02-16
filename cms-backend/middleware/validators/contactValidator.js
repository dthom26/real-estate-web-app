import { body, validationResult } from "express-validator";

// Validation rules for updating contact content (singleton - only PUT)
export const contactValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isString()
    .withMessage("Phone must be a string")
    .matches(/^[\d\s\-\(\)\+]+$/)
    .withMessage("Phone must contain only numbers and valid separators"),

  body("address")
    .optional()
    .trim()
    .isString()
    .withMessage("Address must be a string")
    .isLength({ max: 300 })
    .withMessage("Address must be less than 300 characters"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
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
