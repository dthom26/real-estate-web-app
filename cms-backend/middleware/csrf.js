// Routes that must be reachable before a CSRF cookie exists (bootstrapping).
const CSRF_EXEMPT = ['/api/auth/login', '/api/auth/refresh'];

export default function csrfMiddleware(req, res, next) {
  // Only check for state-changing methods
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next();

  // Exempt login and refresh — no CSRF cookie exists yet on first visit
  if (CSRF_EXEMPT.includes(req.path)) return next();
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ success: false, error: { message: 'Invalid CSRF token', statusCode: 403 } });
  }

  next();
}
