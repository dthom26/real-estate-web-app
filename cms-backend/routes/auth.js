import express from 'express';
import { login, logout, refresh, getCsrf } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);
// POST /api/auth/logout
router.post('/logout', logout);
// POST /api/auth/refresh
router.post('/refresh', refresh);
// GET /api/auth/csrf
router.get('/csrf', getCsrf);

export default router;