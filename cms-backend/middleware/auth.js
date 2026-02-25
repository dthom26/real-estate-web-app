import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../models/user.js';

const jwtSecret = JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (req, res, next) => {
    try {
        // 1. Get token from Authorization header (access token). Do NOT accept refresh cookie here.
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Access denied. No token provided.',
                    statusCode: 401
                }
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, jwtSecret);

        // 3. Get user from database (optional but good practice)
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Access denied. User not found.',
                    statusCode: 401
                }
            });
        }

        // 4. Attach user info to request
        req.user = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        next();
    } catch (error) {
        // Token expired or invalid
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Access denied. Token expired.',
                    statusCode: 401
                }
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Access denied. Invalid token.',
                    statusCode: 401
                }
            });
        }

        next(error);
    }
};

// Optional: Role-based middleware (for future use)
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Access denied. Authentication required.',
                    statusCode: 401
                }
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Access denied. Insufficient permissions.',
                    statusCode: 403
                }
            });
        }

        next();
    };
};