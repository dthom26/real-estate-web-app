import mongoose from "mongoose";
import { DB_URI } from "./config/env.js";
import Service from "./models/service.js";

const testServiceModel = async () => {
  try {
    // Connect to database
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // CREATE - Test creating a document
    console.log("📝 Testing CREATE...");
    const service = await Service.create({
      title: "Buying Homes",
      description: "Guiding you through every step of the home buying process.",
      image: "/uploads/buying-homes.jpg",
    });
    console.log("✅ Created:", {
      id: service._id,
      title: service.title,
      createdAt: service.createdAt,
    });
    console.log("");

    // CREATE - Test creating another service
    console.log("📝 Testing CREATE (second service)...");
    const service2 = await Service.create({
      title: "Selling Homes",
      description: "Expert marketing and negotiation to sell your property.",
      image: "/uploads/selling-homes.jpg",
      order: 1,
    });
    console.log("✅ Created:", {
      id: service2._id,
      title: service2.title,
      order: service2.order,
    });
    console.log("");

    // READ - Test finding the documents
    console.log("🔍 Testing READ...");
    const found = await Service.findById(service._id);
    console.log("✅ Found by ID:", {
      id: found._id,
      title: found.title,
    });

    const allServices = await Service.find();
    console.log("✅ Found all services:", allServices.length, "service(s)");
    console.log("");

    // UPDATE - Test updating the document
    console.log("✏️  Testing UPDATE...");
    found.title = "Updated: Buying Homes";
    found.description = "Updated description text.";
    await found.save();
    console.log("✅ Updated:", {
      id: found._id,
      title: found.title,
      updatedAt: found.updatedAt,
    });
    console.log("");

    // Test status field
    console.log("🧪 Testing STATUS field...");
    found.status = "draft";
    await found.save();
    console.log("✅ Status updated to:", found.status);
    console.log("");

    // DELETE - Test deleting the documents
    console.log("🗑️  Testing DELETE...");
    await Service.deleteOne({ _id: service._id });
    await Service.deleteOne({ _id: service2._id });
    console.log("✅ Deleted successfully");

    // Verify deletion
    const checkDeleted = await Service.findById(service._id);
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
testServiceModel();
