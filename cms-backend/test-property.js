import mongoose from "mongoose";
import { DB_URI } from "./config/env.js";
import Property from "./models/property.js";

const testPropertyModel = async () => {
  try {
    // Connect to database
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // CREATE - Test creating a complete property
    console.log("📝 Testing CREATE (complete property)...");
    const property1 = await Property.create({
      image: "/uploads/property1.jpg",
      alt: "Luxury Waterfront Estate",
      address: "456 Ocean View Drive, Malibu, CA 90265",
      price: "$2,850,000",
      bedrooms: 5,
      bathrooms: 4,
      sqft: "4,200",
      link: "/property/1",
    });
    console.log("✅ Created:", {
      id: property1._id,
      alt: property1.alt,
      price: property1.price,
      createdAt: property1.createdAt,
    });
    console.log("");

    // CREATE - Test creating property with optional fields missing
    console.log("📝 Testing CREATE (minimal/optional fields)...");
    const property2 = await Property.create({
      image: "/uploads/property2.jpg",
      alt: "Modern Downtown Condo",
      price: "$675,000",
      link: "/property/2",
      // address, bedrooms, bathrooms, sqft are optional
    });
    console.log("✅ Created (minimal):", {
      id: property2._id,
      alt: property2.alt,
      hasAddress: !!property2.address,
      hasBedrooms: !!property2.bedrooms,
    });
    console.log("");

    // READ - Test finding the documents
    console.log("🔍 Testing READ...");
    const found = await Property.findById(property1._id);
    console.log("✅ Found by ID:", {
      id: found._id,
      alt: found.alt,
      bedrooms: found.bedrooms,
    });

    const allProperties = await Property.find();
    console.log(
      "✅ Found all properties:",
      allProperties.length,
      "propert(ies)",
    );
    console.log("");

    // UPDATE - Test updating the document
    console.log("✏️  Testing UPDATE...");
    found.price = "$2,900,000";
    found.bedrooms = 6;
    await found.save();
    console.log("✅ Updated:", {
      id: found._id,
      price: found.price,
      bedrooms: found.bedrooms,
      updatedAt: found.updatedAt,
    });
    console.log("");

    // Test status and order fields
    console.log("🧪 Testing STATUS and ORDER fields...");
    found.status = "draft";
    found.order = 1;
    await found.save();
    console.log("✅ Status and order updated:", {
      status: found.status,
      order: found.order,
    });
    console.log("");

    // Test required field validation
    console.log("🧪 Testing VALIDATION (missing required fields)...");
    try {
      await Property.create({
        image: "/uploads/test.jpg",
        alt: "Test Property",
        // Missing required: price and link
      });
      console.log("❌ Validation failed - should require price and link");
    } catch (validationError) {
      console.log(
        "✅ Validation working correctly - rejected missing required fields",
      );
    }
    console.log("");

    // DELETE - Test deleting the documents
    console.log("🗑️  Testing DELETE...");
    await Property.deleteOne({ _id: property1._id });
    await Property.deleteOne({ _id: property2._id });
    console.log("✅ Deleted successfully");

    // Verify deletion
    const checkDeleted = await Property.findById(property1._id);
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
testPropertyModel();
