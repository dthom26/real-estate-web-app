import { body, validationResult } from 'express-validator';

// Validation rules for creating/updating a property
export const propertyValidation = [
    body('image')
        .trim()
        .notEmpty().withMessage('Image is required')
        .isString().withMessage('Image must be a string'),
    
    body('alt')
        .trim()
        .notEmpty().withMessage('Alt text is required')
        .isString().withMessage('Alt text must be a string'),
    
    body('price')
        .trim()
        .notEmpty().withMessage('Price is required')
        .isString().withMessage('Price must be a string'),
    
    body('link')
        .trim()
        .notEmpty().withMessage('Link is required')
        .isURL().withMessage('Link must be a valid URL'),
    
    body('bedrooms')
        .optional()
        .isInt({ min: 0 }).withMessage('Bedrooms must be a positive number'),
    
    body('bathrooms')
        .optional()
        .isInt({ min: 0 }).withMessage('Bathrooms must be a positive number'),
    
    body('sqft')
        .optional()
        .isString(),
    
    body('address')
        .optional()
        .trim()
        .isString(),
    
    body('order')
        .optional()
        .isInt({ min: 0 }).withMessage('Order must be a positive number'),
    
    body('status')
        .optional()
        .isIn(['draft', 'published']).withMessage('Status must be draft or published')
];

// Middleware to check validation results
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                statusCode: 400,
                fields: errors.array()
            }
        });
    }
    next();
};