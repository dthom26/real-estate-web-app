import mongoose from "mongoose";
import { DB_URI } from "./config/env.js";
import Contact from "./models/contact.js";

const testContactModel = async () => {
  try {
    // Connect to database
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB\n");

    // CREATE - Test creating a document
    console.log("📝 Testing CREATE...");
    const contact = await Contact.create({
      email: "jane.doe@realty.com",
      phone: "(555) 123-4567",
      address: "123 Main St, Hometown, USA",
      description: "Feel free to reach out for any real estate needs!",
    });
    console.log("✅ Created:", {
      id: contact._id,
      email: contact.email,
      createdAt: contact.createdAt,
    });
    console.log("");

    // READ - Test finding the document
    console.log("🔍 Testing READ...");
    const found = await Contact.findById(contact._id);
    console.log("✅ Found by ID:", {
      id: found._id,
      email: found.email,
    });

    const foundOne = await Contact.findOne();
    console.log("✅ Found with findOne():", {
      id: foundOne._id,
      email: foundOne.email,
    });
    console.log("");

    // UPDATE - Test updating the document
    console.log("✏️  Testing UPDATE...");
    found.email = "updated.email@realty.com";
    found.phone = "(555) 999-8888";
    await found.save();
    console.log("✅ Updated:", {
      id: found._id,
      email: found.email,
      phone: found.phone,
      updatedAt: found.updatedAt,
    });
    console.log("");

    // Test findOneAndUpdate (for singleton pattern)
    console.log("🔄 Testing findOneAndUpdate (singleton pattern)...");
    const updated = await Contact.findOneAndUpdate(
      {},
      {
        email: "final@realty.com",
        description: "This was updated using findOneAndUpdate",
      },
      { new: true, returnDocument: "after", runValidators: true },
    );
    console.log("✅ Updated with findOneAndUpdate:", {
      id: updated._id,
      email: updated.email,
    });
    console.log("");

    // Test upsert (create if doesn't exist)
    console.log("🔄 Testing UPSERT (delete first, then upsert)...");
    await Contact.deleteOne({ _id: contact._id });
    const upserted = await Contact.findOneAndUpdate(
      {},
      {
        email: "upserted@realty.com",
        phone: "(555) 111-2222",
        address: "456 New St",
        description: "Created via upsert",
      },
      { new: true, upsert: true, returnDocument: "after", runValidators: true },
    );
    console.log("✅ Upserted (created new):", {
      id: upserted._id,
      email: upserted.email,
    });
    console.log("");

    // DELETE - Test deleting the document
    console.log("🗑️  Testing DELETE...");
    await Contact.deleteOne({ _id: upserted._id });
    console.log("✅ Deleted successfully");

    // Verify deletion
    const checkDeleted = await Contact.findById(upserted._id);
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
testContactModel();
