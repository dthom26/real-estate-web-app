import mongoose from "mongoose";
import { DB_URI } from "./config/env.js";
import About from "./models/about.js";

const testAboutModel = async () => {
  try {
    // Connect to database
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // CREATE - Test creating a document
    console.log("📝 Testing CREATE...");
    const about = await About.create({
      header: "About Our Real Estate Business",
      textContent:
        "We are a leading real estate company specializing in residential and commercial properties. Our team has over 20 years of combined experience in the industry.",
      image: "/uploads/test-about.jpg",
      buttonText: "Learn More About Us",
      buttonLink: "/contact",
    });
    console.log("✅ Created:", {
      id: about._id,
      header: about.header,
      createdAt: about.createdAt,
    });
    console.log("");

    // READ - Test finding the document
    console.log("🔍 Testing READ...");
    const found = await About.findById(about._id);
    console.log("✅ Found by ID:", {
      id: found._id,
      header: found.header,
    });

    const foundOne = await About.findOne();
    console.log("✅ Found with findOne():", {
      id: foundOne._id,
      header: foundOne.header,
    });
    console.log("");

    // UPDATE - Test updating the document
    console.log("✏️  Testing UPDATE...");
    found.header = "Updated: About Our Company";
    found.textContent = "This is updated text content.";
    await found.save();
    console.log("✅ Updated:", {
      id: found._id,
      header: found.header,
      updatedAt: found.updatedAt,
    });
    console.log("");

    // Test findOneAndUpdate (for singleton pattern)
    console.log("🔄 Testing findOneAndUpdate (singleton pattern)...");
    const updated = await About.findOneAndUpdate(
      {},
      {
        header: "Final Version of About",
        textContent: "This was updated using findOneAndUpdate",
      },
      { new: true, runValidators: true },
    );
    console.log("✅ Updated with findOneAndUpdate:", {
      id: updated._id,
      header: updated.header,
    });
    console.log("");

    // DELETE - Test deleting the document
    console.log("🗑️  Testing DELETE...");
    await About.deleteOne({ _id: about._id });
    console.log("✅ Deleted successfully");

    // Verify deletion
    const checkDeleted = await About.findById(about._id);
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
testAboutModel();
