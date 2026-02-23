import express from "express";
import { getContact, updateContact } from "../controllers/contactController.js";
import {
  contactValidation,
  handleValidationErrors,
} from "../middleware/validators/contactValidator.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/contact - Get the contact info (PUBLIC)
router.get("/", getContact);

// PUT /api/contact - Update the contact info (PROTECTED)
router.put(
  "/",
  authenticateToken,
  contactValidation,
  handleValidationErrors,
  updateContact,
);

export default router;
