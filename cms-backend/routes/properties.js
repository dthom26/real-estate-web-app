import express from "express";
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";

const router = express.Router();

// GET /api/properties - Get all properties
router.get("/", getAllProperties);

// POST /api/properties - Create new property
router.post("/", createProperty);

// GET /api/properties/:id - Get single property by ID
router.get("/:id", getPropertyById);

// PUT /api/properties/:id - Update property by ID
router.put("/:id", updateProperty);

// DELETE /api/properties/:id - Delete property by ID
router.delete("/:id", deleteProperty);

export default router;
