import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import propertyRoutes from "./routes/properties.js";
import aboutRoutes from "./routes/about.js";
import reviewRoutes from "./routes/reviews.js";
import serviceRoutes from "./routes/services.js";
import heroRoutes from "./routes/hero.js";
import contactRoutes from "./routes/contact.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import errorHandler from "./middleware/errorHandler.js";
import csrfMiddleware from './middleware/csrf.js';
import { ALLOWED_ORIGINS } from './config/env.js';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ALLOWED_ORIGINS ? ALLOWED_ORIGINS.split(",") : true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(csrfMiddleware);

app.use("/api/properties", propertyRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => res.send("API is running!"));

app.use(errorHandler);

export default app;
