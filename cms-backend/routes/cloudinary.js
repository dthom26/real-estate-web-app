import express from "express";
import { signMediaLibrary } from "../controllers/cloudinaryController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/cloudinary/sign-ml — generate ML widget signature (PROTECTED)
router.get("/sign-ml", authenticateToken, signMediaLibrary);

export default router;