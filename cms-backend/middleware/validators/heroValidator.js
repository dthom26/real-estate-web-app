import { body, validationResult } from "express-validator";

export const heroValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),

  body("subtitle")
    .trim()
    .notEmpty()
    .withMessage("Subtitle is required")
    .isString()
    .withMessage("Subtitle must be a string"),

  body("backgroundImage")
    .optional()
    .trim()
    .isString()
    .withMessage("Background image must be a string"),

  body("ctaText")
    .optional()
    .trim()
    .isString()
    .withMessage("CTA text must be a string")
    .isLength({ max: 100 })
    .withMessage("CTA text must be less than 100 characters"),

  body("ctaLink")
    .optional()
    .trim()
    .isString()
    .withMessage("CTA link must be a string"),

  body("showSearch")
    .optional()
    .isBoolean()
    .withMessage("showSearch must be a boolean"),
];

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
