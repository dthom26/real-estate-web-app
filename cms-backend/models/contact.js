import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ContactSchema = new Schema(
  {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Contact", ContactSchema);
