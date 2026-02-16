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

const router = express.Router();

// GET /api/services - Get all services
router.get("/", getAllServices);

// POST /api/services - Create new service
router.post("/", serviceValidation, handleValidationErrors, createService);

// GET /api/services/:id - Get single service by ID
router.get("/:id", getServiceById);

// PUT /api/services/:id - Update service by ID
router.put("/:id", serviceValidation, handleValidationErrors, updateService);

// DELETE /api/services/:id - Delete service by ID
router.delete("/:id", deleteService);

export default router;
