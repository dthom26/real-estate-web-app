import express from "express";
import { NODE_ENV, PORT } from "./config/env.js";
import connectDB from "./database/mongodb.js";

const app = express();

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello World" });
});

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
