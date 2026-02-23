import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AboutSchema = new Schema(
  {
    header: { type: String, required: true },
    textContent: { type: String, required: true },
    image: { type: String, required: false },
    buttonText: { type: String, required: true },
    buttonLink: { type: String, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("About", AboutSchema);
