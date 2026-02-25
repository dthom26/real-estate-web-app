import jwt from "jsonwebtoken";
import crypto from 'crypto';
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";
import { JWT_SECRET, JWT_EXPIRE, JWT_COOKIE_NAME, NODE_ENV } from "../config/env.js";

// JWT configuration
const jwtSecret = JWT_SECRET || "your-secret-key-change-in-production";
const jwtExpire = JWT_EXPIRE || "7d"; // used for refresh token
const accessExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
const cookieName = JWT_COOKIE_NAME || "refreshToken";
const isProd = NODE_ENV === "production";

function setAuthCookie(res, token) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days default—align with JWT_EXPIRE in env
  });
}

function setCsrfCookie(res) {
  const csrf = crypto.randomBytes(24).toString('hex');
  res.cookie('csrfToken', csrf, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return csrf;
}

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

    // 4. Create a refresh token (stored in httpOnly cookie) and an access token returned to the client
    const refreshJti = crypto.randomBytes(16).toString('hex');
    const refreshToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpire, jwtid: refreshJti });

    // persist refresh JTI in DB for rotation/revocation
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    await RefreshToken.create({ jti: refreshJti, user: user._id, expiresAt, ip: req.ip, userAgent: req.get('user-agent') });

    // short-lived access token (returned in response body; frontend keeps it in memory)
    const accessToken = jwt.sign({ id: user._id, username: user.username, role: user.role }, jwtSecret, { expiresIn: accessExpire });

    // set refresh cookie and CSRF cookie
    setAuthCookie(res, refreshToken);
    setCsrfCookie(res);

    res.json({
      success: true,
      data: {
        accessToken,
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

// POST /api/auth/logout
export const logout = (req, res) => {
  try {
    const token = req.cookies?.[cookieName];
    if (token) {
      try {
        const decoded = jwt.verify(token, jwtSecret);
        const jti = decoded.jti || decoded.jti;
        if (jti) {
          RefreshToken.findOneAndUpdate({ jti }, { revoked: true }).catch(() => {});
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore
  }
  res.clearCookie(cookieName, { path: "/" });
  res.clearCookie('csrfToken', { path: '/' });
  res.json({ success: true });
};

// POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) {
      return res.status(401).json({ success: false, error: { message: "No refresh token", statusCode: 401 } });
    }

    // Verify existing token
    const decoded = jwt.verify(token, jwtSecret);
    const jti = decoded.jti;
    if (!jti) return res.status(401).json({ success: false, error: { message: 'Invalid refresh token', statusCode: 401 } });

    // Ensure refresh JTI exists and is not revoked
    const stored = await RefreshToken.findOne({ jti, user: decoded.id });
    if (!stored || stored.revoked) {
      return res.status(401).json({ success: false, error: { message: 'Refresh token revoked or not found', statusCode: 401 } });
    }

    // find user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, error: { message: 'User not found', statusCode: 401 } });

    // rotate: revoke old JTI and create a new one
    stored.revoked = true;
    await stored.save();

    const newJti = crypto.randomBytes(16).toString('hex');
    const newRefreshToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpire, jwtid: newJti });
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await RefreshToken.create({ jti: newJti, user: user._id, expiresAt, ip: req.ip, userAgent: req.get('user-agent') });

    // issue short-lived access token
    const accessToken = jwt.sign({ id: user._id, username: user.username, role: user.role }, jwtSecret, { expiresIn: accessExpire });

    // set new refresh cookie and csrf
    setAuthCookie(res, newRefreshToken);
    setCsrfCookie(res);

    res.json({ success: true, data: { accessToken, user: { id: user._id, username: user.username, role: user.role } } });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: { message: 'Invalid or expired token', statusCode: 401 } });
    }
    next(error);
  }
};

// GET /api/auth/csrf
export const getCsrf = (req, res) => {
  // Issue a new CSRF token cookie and return the token in body
  const token = setCsrfCookie(res);
  res.json({ success: true, data: { csrfToken: token } });
};
