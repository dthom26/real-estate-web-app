import express from "express";
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import {
  reviewValidation,
  handleValidationErrors,
} from "../middleware/validators/reviewValidator.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/reviews - Get all reviews (PUBLIC)
router.get("/", getAllReviews);

// POST /api/reviews - Create new review (PROTECTED)
router.post(
  "/",
  authenticateToken,
  reviewValidation,
  handleValidationErrors,
  createReview,
);

// GET /api/reviews/:id - Get single review by ID (PUBLIC)
router.get("/:id", getReviewById);

// PUT /api/reviews/:id - Update review by ID (PROTECTED)
router.put(
  "/:id",
  authenticateToken,
  reviewValidation,
  handleValidationErrors,
  updateReview,
);

// DELETE /api/reviews/:id - Delete review by ID (PROTECTED)
router.delete("/:id", authenticateToken, deleteReview);

export default router;
