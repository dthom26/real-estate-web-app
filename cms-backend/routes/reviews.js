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

const router = express.Router();

// GET /api/reviews - Get all reviews
router.get("/", getAllReviews);

// POST /api/reviews - Create new review
router.post("/", reviewValidation, handleValidationErrors, createReview);

// GET /api/reviews/:id - Get single review by ID
router.get("/:id", getReviewById);

// PUT /api/reviews/:id - Update review by ID
router.put("/:id", reviewValidation, handleValidationErrors, updateReview);

// DELETE /api/reviews/:id - Delete review by ID
router.delete("/:id", deleteReview);

export default router;
