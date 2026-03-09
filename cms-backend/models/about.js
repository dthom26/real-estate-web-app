import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AboutSchema = new Schema(
  {
    header: { type: String, required: true },
    textContent: { type: String, required: true },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    buttonText: { type: String, required: false },
    buttonLink: { type: String, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("About", AboutSchema);
