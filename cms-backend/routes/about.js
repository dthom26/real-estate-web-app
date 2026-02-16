import express from 'express';
import { getAboutInfo, updateAboutInfo } from '../controllers/aboutController.js';

const router = express.Router();

// GET /api/about - Get the about info
router.get('/', getAboutInfo);

// PUT /api/about - Update the about info
router.put('/', updateAboutInfo);

export default router;
