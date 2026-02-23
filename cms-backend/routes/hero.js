import express from "express";
import { getHero, updateHero } from "../controllers/heroController.js";
import {
  heroValidation,
  handleValidationErrors,
} from "../middleware/validators/heroValidator.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/hero - Get the hero info (PUBLIC)
router.get("/", getHero);

// PUT /api/hero - Update the hero info (PROTECTED)
router.put(
  "/",
  authenticateToken,
  heroValidation,
  handleValidationErrors,
  updateHero,
);

export default router;
