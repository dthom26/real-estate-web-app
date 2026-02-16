import { body, validationResult } from "express-validator";

// Validation rules for updating about content (singleton - only PUT)
export const aboutValidation = [
  body("header")
    .trim()
    .notEmpty()
    .withMessage("Header is required")
    .isString()
    .withMessage("Header must be a string")
    .isLength({ max: 200 })
    .withMessage("Header must be less than 200 characters"),

  body("textContent")
    .trim()
    .notEmpty()
    .withMessage("Text content is required")
    .isString()
    .withMessage("Text content must be a string")
    .isLength({ min: 10 })
    .withMessage("Text content must be at least 10 characters"),

  body("image")
    .optional()
    .trim()
    .isString()
    .withMessage("Image must be a string"),

  body("buttonText")
    .optional()
    .trim()
    .isString()
    .withMessage("Button text must be a string")
    .isLength({ max: 50 })
    .withMessage("Button text must be less than 50 characters"),

  body("buttonLink")
    .optional()
    .trim()
    .isString()
    .withMessage("Button link must be a string"),
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
