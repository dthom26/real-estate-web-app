import express from "express";
import { getContact, updateContact } from "../controllers/contactController.js";
import { contactValidation, handleValidationErrors } from '../middleware/validators/contactValidator.js';

const router = express.Router();

// GET /api/contact - Get the contact info
router.get("/", getContact);

// PUT /api/contact - Update the contact info
router.put("/", contactValidation, handleValidationErrors, updateContact);

export default router;
