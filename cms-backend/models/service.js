import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { 
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Service", ServiceSchema);
