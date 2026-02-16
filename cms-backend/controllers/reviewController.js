import reviewRepository from "../repositories/reviewRepository.js";

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewRepository.findAll();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Create new review
export const createReview = async (req, res) => {
  try {
    const newReview = await reviewRepository.create(req.body);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: "Failed to create review" });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const updatedReview = await reviewRepository.updateById(
      req.params.id,
      req.body,
    );
    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: "Failed to update review" });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const deletedReview = await reviewRepository.deleteById(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
};

// Get review by id
export const getReviewById = async (req, res) => {
  try {
    const review = await reviewRepository.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch review" });
  }
};
