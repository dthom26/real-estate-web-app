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

app.listen(PORT, async() => {
  console.log(`Server running on http://localhost:${PORT}`);
  await connectDB();
});
