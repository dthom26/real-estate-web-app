import express from "express";
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";
import { propertyValidation, handleValidationErrors } from '../middleware/validators/propertyValidator.js';

const router = express.Router();

// GET /api/properties - Get all properties
router.get("/", getAllProperties);

// POST /api/properties - Create new property
router.post("/", propertyValidation, handleValidationErrors, createProperty);

// GET /api/properties/:id - Get single property by ID
router.get("/:id", getPropertyById);

// PUT /api/properties/:id - Update property by ID
router.put("/:id", propertyValidation, handleValidationErrors, updateProperty);

// DELETE /api/properties/:id - Delete property by ID
router.delete("/:id", deleteProperty);

export default router;
