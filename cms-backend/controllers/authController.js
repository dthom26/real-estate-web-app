import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { JWT_SECRET, JWT_EXPIRE } from "../config/env.js";

// JWT configuration
const jwtSecret = JWT_SECRET || "your-secret-key-change-in-production";
const jwtExpire = JWT_EXPIRE || "7d";

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Username and password are required",
          statusCode: 400,
        },
      });
    }

    // 2. Find user by username
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid credentials",
          statusCode: 401,
        },
      });
    }

    // 3. Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid credentials",
          statusCode: 401,
        },
      });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpire },
    );

    // 5. Return token
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
