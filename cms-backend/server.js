import express from "express";
import { NODE_ENV, PORT, ALLOWED_ORIGINS } from "./config/env.js";
import connectDB from "./database/mongodb.js";
import propertyRoutes from "./routes/properties.js";
import aboutRoutes from "./routes/about.js";
import reviewRoutes from "./routes/reviews.js";
import serviceRoutes from "./routes/services.js";
import heroRoutes from "./routes/hero.js";
import contactRoutes from "./routes/contact.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import cors from "cors";

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(
  cors({
    origin: ALLOWED_ORIGINS.split(","),
  }),
);

// API Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Error handling middleware
app.use(errorHandler);

// Connect to database first, then start server
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`Environment: GitHub Codespaces`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  });
