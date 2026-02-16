import { body, validationResult } from "express-validator";

// Validation rules for creating/updating a review
export const reviewValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ max: 100 })
    .withMessage("Name must be less than 100 characters"),

  body("title")
    .optional()
    .trim()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment is required")
    .isString()
    .withMessage("Comment must be a string")
    .isLength({ min: 10 })
    .withMessage("Comment must be at least 10 characters"),

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
