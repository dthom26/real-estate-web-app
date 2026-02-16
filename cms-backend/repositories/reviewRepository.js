import Review from "../models/review.js";

class ReviewRepository {
  async findAll(filter = {}) {
    try {
      return await Review.find(filter);
    } catch (error) {
      throw new Error(`Error fetching reviews: ${error.message}`);
    }
  }

  async create(data) {
    try {
      return await Review.create(data);
    } catch (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Review.findById(id);
    } catch (error) {
      throw new Error(`Error fetching review by ID: ${error.message}`);
    }
  }

  async updateById(id, data) {
    try {
      return await Review.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw new Error(`Error updating review: ${error.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await Review.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error counting reviews: ${error.message}`);
    }
  }

  async deleteById(id) {
    try {
      return await Review.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }
  }
}

export default new ReviewRepository();
