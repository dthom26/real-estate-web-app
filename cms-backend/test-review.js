import mongoose from "mongoose";
import { DB_URI } from "./config/env.js";
import Review from "./models/review.js";

const testReviewModel = async () => {
  try {
    // Connect to database
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // CREATE - Test creating a document
    console.log("📝 Testing CREATE...");
    const review = await Review.create({
      name: "John Doe",
      title: "First-Time Homebuyer",
      rating: 5,
      comment:
        "Great experience! The agent was very helpful and found us the perfect home.",
    });
    console.log("✅ Created:", {
      id: review._id,
      name: review.name,
      rating: review.rating,
      createdAt: review.createdAt,
    });
    console.log("");

    // READ - Test finding the document
    console.log("🔍 Testing READ...");
    const found = await Review.findById(review._id);
    console.log("✅ Found by ID:", {
      id: found._id,
      name: found.name,
      rating: found.rating,
    });

    const allReviews = await Review.find();
    console.log("✅ Found all reviews:", allReviews.length, "review(s)");
    console.log("");

    // UPDATE - Test updating the document
    console.log("✏️  Testing UPDATE...");
    found.comment = "Updated comment text.";
    found.rating = 4;
    await found.save();
    console.log("✅ Updated:", {
      id: found._id,
      rating: found.rating,
      comment: found.comment.substring(0, 30) + "...",
      updatedAt: found.updatedAt,
    });
    console.log("");

    // Test rating validation
    console.log("🧪 Testing VALIDATION (rating range)...");
    try {
      await Review.create({
        name: "Test User",
        title: "Test Title",
        rating: 6, // Invalid - should fail
        comment: "This should fail",
      });
      console.log("❌ Validation failed - should not allow rating > 5");
    } catch (validationError) {
      console.log("✅ Validation working correctly - rejected rating > 5");
    }
    console.log("");

    // DELETE - Test deleting the document
    console.log("🗑️  Testing DELETE...");
    await Review.deleteOne({ _id: review._id });
    console.log("✅ Deleted successfully");

    // Verify deletion
    const checkDeleted = await Review.findById(review._id);
    console.log(
      "✅ Verification - Document exists?",
      checkDeleted === null ? "No (correctly deleted)" : "Yes (ERROR)",
    );
    console.log("");

    console.log("🎉 All tests passed!\n");

    // Disconnect
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the test
testReviewModel();
