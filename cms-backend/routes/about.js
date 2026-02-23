import express from "express";
import {
  getAboutInfo,
  updateAboutInfo,
} from "../controllers/aboutController.js";
import {
  aboutValidation,
  handleValidationErrors,
} from "../middleware/validators/aboutValidator.js";
import { authenticateToken } from "../middleware/auth.js"; 

const router = express.Router();

// GET /api/about - Get the about info (PUBLIC)
router.get("/", getAboutInfo);

// PUT /api/about - Update the about info (PROTECTED)
router.put(
  "/",
  authenticateToken,
  aboutValidation,
  handleValidationErrors,
  updateAboutInfo,
);

export default router;
