import express from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import {
  serviceValidation,
  handleValidationErrors,
} from "../middleware/validators/serviceValidator.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/services - Get all services (PUBLIC)
router.get("/", getAllServices);

// POST /api/services - Create new service (PROTECTED)
router.post(
  "/",
  authenticateToken,
  serviceValidation,
  handleValidationErrors,
  createService,
);

// GET /api/services/:id - Get single service by ID (PUBLIC)
router.get("/:id", getServiceById);

// PUT /api/services/:id - Update service by ID (PROTECTED)
router.put(
  "/:id",
  authenticateToken,
  serviceValidation,
  handleValidationErrors,
  updateService,
);

// DELETE /api/services/:id - Delete service by ID (PROTECTED)
router.delete("/:id", authenticateToken, deleteService);

export default router;
