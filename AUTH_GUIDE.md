# How to Build Access Token + Refresh Token Authentication

A practical, plain-English guide for self-taught developers. Every code example in this article is pulled directly from a real app, not a toy demo.

---

## Table of Contents

1. [Why This Pattern Exists](#why-this-pattern-exists)
2. [The Big Picture](#the-big-picture)
3. [What You Need Before You Start](#what-you-need-before-you-start)
4. [Part 1 — The User Model (Storing Passwords Safely)](#part-1--the-user-model-storing-passwords-safely)
5. [Part 2 — The Refresh Token Model (Tracking Sessions)](#part-2--the-refresh-token-model-tracking-sessions)
6. [Part 3 — Login (Issuing Tokens)](#part-3--login-issuing-tokens)
7. [Part 4 — Protecting Routes (The Auth Middleware)](#part-4--protecting-routes-the-auth-middleware)
8. [Part 5 — Refreshing (Keeping the User Logged In)](#part-5--refreshing-keeping-the-user-logged-in)
9. [Part 6 — Logout (Revoking Sessions)](#part-6--logout-revoking-sessions)
10. [Part 7 — CSRF Protection (Defending the Cookie)](#part-7--csrf-protection-defending-the-cookie)
11. [Part 8 — The Frontend (Wiring It All Together)](#part-8--the-frontend-wiring-it-all-together)
12. [Part 9 — Authorization (What Are You Allowed to Do?)](#part-9--authorization-what-are-you-allowed-to-do)
13. [How All the Pieces Connect](#how-all-the-pieces-connect)
14. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Why This Pattern Exists

Before diving in, it's worth understanding the problem this pattern solves.

The simplest possible auth system is: store the user's ID in a cookie, check the cookie on every request. But that cookie never expires — if someone steals it, they have access forever.

A step up from that is a single JWT (JSON Web Token) that expires after a set time. But now you have a new problem: if you make the token expire in 15 minutes, the user has to log in every 15 minutes. If you make it expire in 7 days, you're back to the "stolen token = long damage window" problem.

**The Access Token + Refresh Token pattern solves both problems at once:**

- The **access token** expires in 15 minutes. It's what actually gets you into the app. Short life = small damage window if stolen.
- The **refresh token** expires in 7 days. It's only used to get a new access token. It's stored in a way that makes it very hard to steal.

The user never notices. When their access token expires, the app silently swaps it for a new one using the refresh token.

---

## The Big Picture

Here is the full flow before we look at any code:

```
LOGIN
  └── User sends username + password
  └── Server verifies password
  └── Server creates two tokens:
        • Refresh Token (7 days) → stored in httpOnly cookie + database
        • Access Token (15 min) → returned in response body
  └── Frontend stores access token in memory (NOT localStorage)

MAKING API CALLS
  └── Frontend sends: Authorization: Bearer <access_token>
  └── Server middleware reads + verifies the token
  └── If valid, the request goes through
  └── If expired, frontend calls /refresh

REFRESHING
  └── Browser auto-sends the refresh cookie
  └── Server verifies it + checks database
  └── Server revokes old refresh token, issues a new one (rotation)
  └── Server issues a new 15-min access token
  └── Frontend stores the new access token in memory

LOGOUT
  └── Server marks refresh token as revoked in database
  └── Server clears cookies
  └── Frontend clears in-memory token
```

---

## What You Need Before You Start

**Backend packages:**

```bash
npm install jsonwebtoken bcrypt mongoose cookie-parser crypto
```

**What each one does:**

- `jsonwebtoken` — creates and verifies JWTs
- `bcrypt` — hashes passwords so you never store them in plain text
- `mongoose` — MongoDB ORM (your database models)
- `cookie-parser` — lets Express read cookies from requests
- `crypto` — built into Node.js, used to create random IDs

**Make sure `cookie-parser` is wired up in your Express app:**

```javascript
import cookieParser from "cookie-parser";
app.use(cookieParser());
```

**Environment variables you need:**

```
JWT_SECRET=some-long-random-string-change-this
JWT_EXPIRE=7d
JWT_ACCESS_EXPIRE=15m
JWT_COOKIE_NAME=refreshToken
NODE_ENV=development
```

> **Important:** `JWT_SECRET` is the key that signs your tokens. Anyone who knows it can forge tokens. Keep it secret, keep it long, never commit it to git.

---

## Part 1 — The User Model (Storing Passwords Safely)

The first rule of auth: **never store a plain-text password.** If your database ever gets leaked, you don't want attackers to immediately have everyone's passwords.

Instead, you store a **hash** — a one-way scrambled version of the password. You can't reverse a hash back into the original password. You can only check "does this plain-text password, when hashed, match the hash I stored?"

```javascript
// models/user.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // always store usernames in lowercase
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, default: "admin" },
  },
  { timestamps: true },
);

// This runs automatically before every .save()
// It hashes the password so we never store plain text
UserSchema.pre("save", async function () {
  // Only re-hash if the password field was actually changed
  // Without this check, every time you update any user field,
  // the already-hashed password would get hashed again and become invalid
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10); // 10 = how much work to do (higher = slower = harder to crack)
  this.password = await bcrypt.hash(this.password, salt);
});

// A helper method to check a login attempt
// Returns true if the plain-text password matches the stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);
```

**Key points:**

- The `pre("save")` hook is a Mongoose lifecycle hook — it fires before the document is written to the database.
- `bcrypt.genSalt(10)` creates a random "salt" — a bit of extra noise added to your password before hashing. This means two users with the same password will have different hashes.
- `this.isModified("password")` is critical. Without it, updating a user's username would re-hash the already-hashed password, locking them out.

---

## Part 2 — The Refresh Token Model (Tracking Sessions)

You need to store refresh tokens in the database so you can **revoke** them. A JWT by itself can't be "un-issued" — once it's out there, it's valid until it expires. Storing them in the database gives you the ability to say "I don't care if this token is technically valid, I'm revoking it."

```javascript
// models/refreshToken.js
import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true }, // unique ID for this token
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  ip: { type: String }, // optional: track where the session came from
  userAgent: { type: String }, // optional: track what browser/device
});

// This tells MongoDB to automatically delete documents when expiresAt is in the past.
// You don't have to manually clean up old tokens — the database handles it.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RefreshToken", RefreshTokenSchema);
```

**What is `jti`?** JWT ID. When you create a JWT, you can embed a unique ID inside it. You store that same ID here. When someone tries to use a refresh token, you look up its `jti` in the database and check if it's been revoked.

---

## Part 3 — Login (Issuing Tokens)

This is the core of the system — where tokens are born.

```javascript
// controllers/authController.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";

const jwtSecret = process.env.JWT_SECRET;
const jwtExpire = process.env.JWT_EXPIRE || "7d"; // refresh token lifetime
const accessExpire = process.env.JWT_ACCESS_EXPIRE || "15m"; // access token lifetime
const cookieName = process.env.JWT_COOKIE_NAME || "refreshToken";
const isProd = process.env.NODE_ENV === "production";

// Helper: set the refresh token as a secure httpOnly cookie
function setAuthCookie(res, token) {
  res.cookie(cookieName, token, {
    httpOnly: true, // JavaScript on the page CANNOT read this cookie
    secure: isProd, // only send over HTTPS in production
    sameSite: "lax", // blocks cross-site POSTs (basic CSRF protection)
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
  });
}

// Helper: set a CSRF token cookie that JavaScript CAN read
function setCsrfCookie(res) {
  const csrf = crypto.randomBytes(24).toString("hex"); // random 48-char hex string
  res.cookie("csrfToken", csrf, {
    httpOnly: false, // intentionally readable by JavaScript — we need to send it as a header
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return csrf;
}

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Step 1: Basic input validation
    if (!username || !password) {
      return res
        .status(400)
        .json({
          success: false,
          error: { message: "Username and password are required" },
        });
    }

    // Step 2: Find the user in the database
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      // IMPORTANT: always return the same error message whether the username
      // doesn't exist OR the password is wrong. If you say "username not found"
      // you're telling attackers which usernames are valid.
      return res
        .status(401)
        .json({ success: false, error: { message: "Invalid credentials" } });
    }

    // Step 3: Check the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: { message: "Invalid credentials" } });
    }

    // Step 4: Create a unique ID (jti) for this refresh token
    const refreshJti = crypto.randomBytes(16).toString("hex");

    // Step 5: Sign the refresh token (long-lived, stored in cookie + database)
    // Only contains the user's ID — we don't need their role here because
    // this token just gets exchanged for an access token
    const refreshToken = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: jwtExpire,
      jwtid: refreshJti,
    });

    // Step 6: Save the refresh token record to the database so we can revoke it later
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await RefreshToken.create({
      jti: refreshJti,
      user: user._id,
      expiresAt,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Step 7: Sign the access token (short-lived, returned in response body)
    // Contains more info (username, role) because route handlers will read this
    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: accessExpire },
    );

    // Step 8: Set cookies and return the access token + user info
    setAuthCookie(res, refreshToken);
    setCsrfCookie(res);

    res.json({
      success: true,
      data: {
        accessToken, // frontend stores this in memory
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
```

**Why does the access token contain `username` and `role` but the refresh token doesn't?**

The access token is read by your route handlers — they need to know who you are and what you can do. The refresh token's only job is to prove "I recently logged in" so it only needs your user ID to look you up.

**Why `httpOnly: true` on the refresh token cookie?**

Any JavaScript on your page — including any third-party scripts you load — can read normal cookies. `httpOnly` cookies are invisible to JavaScript entirely. The browser sends them automatically on requests, but no script can steal them. This is your main defense against XSS (Cross-Site Scripting) attacks stealing your refresh token.

---

## Part 4 — Protecting Routes (The Auth Middleware)

Middleware is a function that runs between the incoming request and your route handler. Auth middleware checks "is this person logged in?" If not, it stops the request right there and sends back a 401.

```javascript
// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const jwtSecret = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  try {
    // Step 1: Look for the access token in the Authorization header
    // The format is: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7) // remove "Bearer " prefix (7 characters) to get just the token
        : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "Access denied. No token provided." },
      });
    }

    // Step 2: Verify the token
    // jwt.verify() does two things:
    //   a) checks that the token was signed with our secret (not forged)
    //   b) checks that it hasn't expired
    // If either check fails, it throws an error
    const decoded = jwt.verify(token, jwtSecret);

    // Step 3: Look up the user in the database
    // The token contains the user's ID — we use that to fetch fresh data.
    // .select('-password') means "give me all fields EXCEPT password"
    // Why do this instead of just trusting the token? Because users can be deleted
    // or have their role changed after a token is issued. Checking the database
    // means those changes take effect immediately.
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Access denied. User not found." },
      });
    }

    // Step 4: Attach user info to the request object
    // Now any route handler after this middleware can access req.user
    // to know who is making the request
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    // Step 5: Call next() to pass the request on to the route handler
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: { message: "Access denied. Token expired." },
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: { message: "Access denied. Invalid token." },
      });
    }
    next(error);
  }
};
```

**How do you use this middleware on a route?**

```javascript
import { authenticateToken } from "../middleware/auth.js";

// Public route — no middleware needed
router.get("/properties", getProperties);

// Protected route — must be logged in
router.post("/properties", authenticateToken, createProperty);

// You can protect every route in a file at once by applying the middleware to the router
router.use(authenticateToken);
router.post("/properties", createProperty);
router.delete("/properties/:id", deleteProperty);
```

Middleware runs in the order you list it. `authenticateToken` runs first, and only if it calls `next()` does the route handler run.

---

## Part 5 — Refreshing (Keeping the User Logged In)

This endpoint is what silently keeps the user's session alive. The access token expires every 15 minutes; this route issues a new one.

```javascript
// controllers/authController.js (continued)

export const refresh = async (req, res, next) => {
  try {
    // Step 1: Read the refresh token from the httpOnly cookie
    // The browser sends this automatically — the frontend doesn't need to do anything special
    const token = req.cookies?.[cookieName];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: { message: "No refresh token" } });
    }

    // Step 2: Verify the refresh token signature and expiry
    const decoded = jwt.verify(token, jwtSecret);
    const jti = decoded.jti;
    if (!jti) {
      return res
        .status(401)
        .json({ success: false, error: { message: "Invalid refresh token" } });
    }

    // Step 3: Look up the token in the database
    // Even if the JWT is cryptographically valid, we reject it if it's been revoked
    const stored = await RefreshToken.findOne({ jti, user: decoded.id });
    if (!stored || stored.revoked) {
      return res
        .status(401)
        .json({
          success: false,
          error: { message: "Refresh token revoked or not found" },
        });
    }

    // Step 4: Look up the user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: { message: "User not found" } });
    }

    // Step 5: TOKEN ROTATION — this is the important security step
    // Mark the OLD refresh token as revoked
    stored.revoked = true;
    await stored.save();

    // Create a brand new refresh token with a new unique ID
    const newJti = crypto.randomBytes(16).toString("hex");
    const newRefreshToken = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: jwtExpire,
      jwtid: newJti,
    });

    // Save the new token to the database
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await RefreshToken.create({
      jti: newJti,
      user: user._id,
      expiresAt,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Step 6: Issue a new short-lived access token
    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: accessExpire },
    );

    // Step 7: Set new cookies and return the new access token
    setAuthCookie(res, newRefreshToken);
    setCsrfCookie(res);

    res.json({
      success: true,
      data: {
        accessToken,
        user: { id: user._id, username: user.username, role: user.role },
      },
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res
        .status(401)
        .json({
          success: false,
          error: { message: "Invalid or expired token" },
        });
    }
    next(error);
  }
};
```

**Why rotate the refresh token on every use?**

Imagine someone steals your refresh token. They use it to get a new access token. At the same moment, your app also uses the refresh token to refresh. Now:

- Without rotation: both succeed. The attacker silently has access indefinitely.
- With rotation: the legitimate use marks the token as revoked. The attacker's attempt a moment later hits a revoked token and fails. You can even detect this as a potential attack (two parties trying to use the same refresh token).

---

## Part 6 — Logout (Revoking Sessions)

```javascript
// controllers/authController.js (continued)

export const logout = (req, res) => {
  try {
    // Read the refresh token cookie to find its jti, then revoke it in the database
    const token = req.cookies?.[cookieName];
    if (token) {
      try {
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded.jti) {
          // Mark it revoked — fire and forget (we don't await)
          RefreshToken.findOneAndUpdate(
            { jti: decoded.jti },
            { revoked: true },
          ).catch(() => {});
        }
      } catch (e) {
        // If the token is already expired or invalid, that's fine — just clear the cookies
      }
    }
  } catch (e) {
    // ignore
  }

  // Clear both cookies — the browser will stop sending them
  res.clearCookie(cookieName, { path: "/" });
  res.clearCookie("csrfToken", { path: "/" });
  res.json({ success: true });
};
```

Clearing the cookie means the browser stops sending it. Revoking it in the database means even if someone cached the token value, it won't work.

---

## Part 7 — CSRF Protection (Defending the Cookie)

This is the trickiest concept, but once you get it, it makes sense.

**The problem:** Because your refresh token is in a cookie, browsers automatically send it on every request — including requests made by OTHER websites without your knowledge. This is called Cross-Site Request Forgery (CSRF).

Example: You're logged into `yourapp.com`. You visit `evil-website.com`. That site has a hidden form that POSTs to `yourapp.com/api/delete-account`. Your browser automatically sends your `yourapp.com` cookie with that request. The server sees a valid cookie and deletes your account.

**The solution — Double Submit Cookie:**

1. When you log in, the server sets a second cookie called `csrfToken` that JavaScript CAN read.
2. On every state-changing request (POST, PUT, DELETE), your frontend JavaScript reads that cookie and sends its value in a request header (`X-CSRF-Token`).
3. The server checks that the cookie value and the header value match.

**Why does this stop the attack?** The evil website can make your browser send cookies, but it cannot read your `yourapp.com` cookies (browsers block that). So it can't forge the `X-CSRF-Token` header. The cookie + header combo won't match → request rejected.

```javascript
// middleware/csrf.js

// These two routes are exempt because the user doesn't have a csrfToken cookie yet
// on their very first visit — they haven't logged in
const CSRF_EXEMPT = ["/api/auth/login", "/api/auth/refresh"];

export default function csrfMiddleware(req, res, next) {
  const method = req.method.toUpperCase();

  // GET requests can't change data, so they don't need CSRF protection
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return next();

  // Exempt login/refresh — they're what create the CSRF cookie in the first place
  if (CSRF_EXEMPT.includes(req.path)) return next();

  const cookieToken = req.cookies?.csrfToken; // the cookie value
  const headerToken =
    req.headers["x-csrf-token"] || req.headers["x-xsrf-token"]; // the header value

  // Both must be present and must match
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res
      .status(403)
      .json({ success: false, error: { message: "Invalid CSRF token" } });
  }

  next();
}
```

**Wire it up in your Express app before your routes:**

```javascript
import csrfMiddleware from "./middleware/csrf.js";
app.use(csrfMiddleware);
```

---

## Part 8 — The Frontend (Wiring It All Together)

The frontend has two jobs:

1. Store the access token in memory (not `localStorage`, not a cookie — a plain JavaScript variable).
2. Send the right headers on every request.

### The API Service

```javascript
// services/api.js

const BASE = import.meta.env.VITE_API_URL || "";

// The access token lives here — a plain module-level variable.
// It disappears on page refresh, which is intentional.
let _inMemoryToken = null;
export const tokenStore = {
  get: () => _inMemoryToken,
  set: (t) => {
    _inMemoryToken = t;
  },
  remove: () => {
    _inMemoryToken = null;
  },
};

function readCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

async function request(
  path,
  { method = "GET", body, headers = {}, signal } = {},
) {
  const opts = {
    method,
    signal,
    credentials: "include", // This tells fetch to include cookies in the request
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  };

  // Attach the access token if we have one
  const token = tokenStore.get();
  if (token) opts.headers.Authorization = `Bearer ${token}`;

  // Attach the CSRF token for state-changing requests
  if (method !== "GET") {
    const csrf = readCookie("csrfToken");
    if (csrf) opts.headers["X-CSRF-Token"] = csrf;
  }

  const res = await fetch(BASE + path, opts);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = json?.error?.message || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return json?.data ?? json;
}

export const post = (path, body, opts) =>
  request(path, { method: "POST", body, ...opts });
export const get = (path, opts) => request(path, { method: "GET", ...opts });
export const put = (path, body, opts) =>
  request(path, { method: "PUT", body, ...opts });
export const del = (path, opts) => request(path, { method: "DELETE", ...opts });
```

### The Auth Context (React)

In React, you want your auth state (is the user logged in? who are they?) to be available throughout the app without passing it as props everywhere. A Context is perfect for this.

```jsx
// context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { post, tokenStore } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we're checking auth status

  // Called on page load — tries to use the refresh cookie to restore the session.
  // If the cookie is valid, we get a new access token without the user having to log in again.
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await post("/api/auth/refresh");
      if (data?.accessToken) tokenStore.set(data.accessToken);
      setUser(data.user || null);
    } catch (err) {
      // No valid refresh cookie — user is logged out
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run once when the app loads to restore session
  useEffect(() => {
    refresh();
  }, []);

  const login = async ({ username, password }) => {
    setLoading(true);
    try {
      const data = await post("/api/auth/login", { username, password });
      if (data?.accessToken) tokenStore.set(data.accessToken);
      setUser(data.user || null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err };
    }
  };

  const logout = async () => {
    try {
      await post("/api/auth/logout");
    } catch (err) {
      /* ignore */
    }
    tokenStore.remove();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Wrap your app with it in `main.jsx`:**

```jsx
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
```

**Use it in any component:**

```jsx
function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return (
    <div>
      <p>Welcome, {user.username}</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}
```

**Register the routes:**

```javascript
// routes/auth.js
import express from "express";
import {
  login,
  logout,
  refresh,
  getCsrf,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/csrf", getCsrf); // optional: explicit endpoint to bootstrap a CSRF token

export default router;
```

---

## Part 9 — Authorization (What Are You Allowed to Do?)

Authentication = who are you?
Authorization = what are you allowed to do?

Once a user is authenticated, you might want to limit what they can do based on their role. The `requireRole` middleware handles this.

```javascript
// middleware/auth.js (continued)

export const requireRole = (roles) => {
  // Returns a middleware function
  return (req, res, next) => {
    // This middleware always runs AFTER authenticateToken,
    // so req.user should already be populated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Access denied. Authentication required." },
      });
    }

    // roles is an array like ['admin', 'editor']
    // Check if the user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied. Insufficient permissions." },
        // Note: 403 Forbidden, NOT 401 Unauthorized
        // 401 = "I don't know who you are"
        // 403 = "I know who you are, but you can't do this"
      });
    }

    next();
  };
};
```

**How to use it:**

```javascript
import { authenticateToken, requireRole } from "../middleware/auth.js";

// Only admins can delete
router.delete(
  "/properties/:id",
  authenticateToken,
  requireRole(["admin"]),
  deleteProperty,
);

// Admins and editors can create
router.post(
  "/properties",
  authenticateToken,
  requireRole(["admin", "editor"]),
  createProperty,
);

// Any logged-in user can view
router.get("/properties", authenticateToken, getProperties);
```

The order matters: `authenticateToken` runs first (sets `req.user`), then `requireRole` checks `req.user.role`.

---

## How All the Pieces Connect

Here is the full picture of how these files relate to each other:

```
Frontend (React)
│
├── AuthContext.jsx      — holds user state, calls login/logout/refresh
├── api.js               — all HTTP requests go through here, attaches tokens + CSRF header
│
▼  HTTP requests over the network
│
Backend (Express)
│
├── routes/auth.js       — maps URLs to controller functions
├── middleware/csrf.js   — checks CSRF token on every POST/PUT/DELETE
├── middleware/auth.js   — checks access token, populates req.user
│   └── requireRole()    — checks req.user.role against allowed roles
├── controllers/authController.js
│   ├── login()          — verify password, issue tokens
│   ├── refresh()        — rotate refresh token, issue new access token
│   └── logout()         — revoke token, clear cookies
│
▼  Database queries
│
MongoDB (via Mongoose)
│
├── models/User.js           — stores users with hashed passwords
└── models/RefreshToken.js   — tracks active refresh tokens (revokable)
```

---

## Common Mistakes to Avoid

**1. Storing the access token in `localStorage`**

`localStorage` is readable by any JavaScript on the page. If you ever load a third-party script that's been compromised, it can steal every token in `localStorage`. Keep access tokens in memory.

**2. Not using `httpOnly` on the refresh token cookie**

Without `httpOnly`, JavaScript can read the refresh token and an XSS attack can steal it. Always set `httpOnly: true` on long-lived tokens.

**3. Returning different errors for wrong username vs. wrong password**

If you say "username not found" for one case and "wrong password" for another, attackers can enumerate valid usernames by trying common names and watching which error they get. Always return the same generic "Invalid credentials" for both.

**4. Not rotating the refresh token**

If you reuse the same refresh token indefinitely, a stolen token is valid forever (until it expires). Rotation means a stolen token becomes invalid the moment the legitimate user refreshes.

**5. Forgetting `this.isModified("password")` in the `pre-save` hook**

Without this guard, every time any user field is updated (like changing a username), the already-hashed password gets hashed again, becoming invalid. Always guard password hashing with `isModified`.

**6. Not checking `secure: true` in production**

In development, `secure: false` is fine (no HTTPS). But in production, cookies without `secure: true` can be sent over plain HTTP, potentially exposing them. Tie this to your `NODE_ENV`.

**7. Committing your `JWT_SECRET` to git**

Your secret is what protects every token. If it leaks, anyone can forge a valid token and bypass all auth. Use a `.env` file and make sure it's in your `.gitignore`.
