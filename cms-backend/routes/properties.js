import express from "express";
import {
  getAllProperties,
  getCarousel,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";
import {
  propertyValidation,
  handleValidationErrors,
} from "../middleware/validators/propertyValidator.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/properties - Get all properties (PUBLIC)
router.get("/", getAllProperties);

// GET /api/properties/carousel - Get featured properties for carousel (PUBLIC)
router.get("/carousel", getCarousel);

// POST /api/properties - Create new property (PROTECTED)
router.post(
  "/",
  authenticateToken,
  propertyValidation,
  handleValidationErrors,
  createProperty,
);

// GET /api/properties/:id - Get single property by ID (PUBLIC)
router.get("/:id", getPropertyById);

// PUT /api/properties/:id - Update property by ID (PROTECTED)
router.put(
  "/:id",
  authenticateToken,
  propertyValidation,
  handleValidationErrors,
  updateProperty,
);

// DELETE /api/properties/:id - Delete property by ID (PROTECTED)
router.delete("/:id", authenticateToken, deleteProperty);

export default router;
