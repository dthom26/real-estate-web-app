import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { authenticateToken } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// POST /api/upload - Upload images (PROTECTED)
router.post("/", authenticateToken, upload.array("images", 15), uploadImage);

export default router;
