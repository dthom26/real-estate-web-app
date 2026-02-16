import Review from "../models/review.js";

class ReviewRepository {
  async findAll(filter = {}) {
    return await Review.find(filter);
  }

  async create(data) {
    return await Review.create(data);
  }

  async findById(id) {
    return await Review.findById(id);
  }

  async updateById(id, data) {
    return await Review.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async count(filter = {}) {
    return await Review.countDocuments(filter);
  }

  async deleteById(id) {
    return await Review.findByIdAndDelete(id);
  }
}

export default new ReviewRepository();
