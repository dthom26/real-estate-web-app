import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PropertySchema = new Schema(
  {
    image: { type: String, required: true },
    alt: { type: String, required: true },
    address: { type: String, required: false },
    price: { type: String, required: true },
    bedrooms: { type: Number, required: false },
    bathrooms: { type: Number, required: false },
    sqft: { type: String, required: false },
    link: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Property", PropertySchema);
