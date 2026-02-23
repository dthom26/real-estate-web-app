import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HeroSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    backgroundImage: { type: String, required: false },
    ctaText: { type: String, required: false },
    ctaLink: { type: String, required: false },
    showSearch: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Hero", HeroSchema);
