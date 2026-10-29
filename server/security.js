const { rateLimit } = require("express-rate-limit");
const COOKIE = "dh_session";
function cookieToken(req) {
  const raw = (req.headers.cookie || "")
    .split(";")
    .find((part) => part.trim().startsWith(COOKIE + "="));
  return raw ? raw.trim().slice(COOKIE.length + 1) : null;
}
function setSessionCookie(res, token, expiresAt) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(expiresAt),
  });
}
function clearSessionCookie(res) {
  res.clearCookie(COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}
function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.full_name ?? user.fullName,
    role: user.role,
    avatarUrl: user.avatar_url ?? user.avatarUrl,
    bio: user.bio,
    location: user.location,
    githubUrl: user.github_url ?? user.githubUrl,
    portfolioUrl: user.portfolio_url ?? user.portfolioUrl,
    streakDays: user.streak_days ?? user.streakDays,
  };
}
function allowedOrigin(req, origin) {
  if (!origin || origin === "null") return false;
  try {
    const parsed = new URL(origin);
    const own = `${req.protocol}://${req.get("host")}`;
    const configured = (process.env.APP_ORIGINS || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    return (
      parsed.origin === origin &&
      (origin === own || configured.includes(origin))
    );
  } catch {
    return false;
  }
}
function createLimiter(limit, windowMs = 60000, options = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler(req, res, next, config) {
      const retryAfter = Math.max(1, Math.ceil(((req.rateLimit?.resetTime?.getTime() || Date.now() + windowMs) - Date.now()) / 1000));
      res.set('Retry-After', String(retryAfter));
      res.status(config.statusCode).json({ error: 'Too many requests. Please wait before trying again.', retryAfter });
    },
    ...options,
  });
}
function validateShape(value, depth = 0) {
  if (depth > 12) return false;
  if (value === null || typeof value === "boolean" || typeof value === "number")
    return true;
  if (typeof value === "string") return value.length <= 100000;
  if (Array.isArray(value))
    return (
      value.length <= 1000 &&
      value.every((item) => validateShape(item, depth + 1))
    );
  return (
    typeof value === "object" &&
    Object.keys(value).length <= 100 &&
    Object.entries(value).every(
      ([key, item]) =>
        !["__proto__", "constructor", "prototype"].includes(key) &&
        validateShape(item, depth + 1),
    )
  );
}
function isLegacySeedUser(user) {
  return [
    "usr-admin-parth",
    "usr-ayesha",
    "usr-kabir",
    "usr-mei",
    "usr-nora",
  ].includes(user?.id);
}
function configureSecurity(app) {
  app.disable("x-powered-by");
  // Do not trust arbitrary X-Forwarded-For headers. Set only known proxy hops explicitly.
  if (process.env.TRUST_PROXY_HOPS) {
    const hops = Number(process.env.TRUST_PROXY_HOPS);
    if (!Number.isInteger(hops) || hops < 1 || hops > 3)
      throw Error("Invalid TRUST_PROXY_HOPS");
    app.set("trust proxy", hops);
  }
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy":
        "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    });
    if (process.env.NODE_ENV === "production")
      res.set("Strict-Transport-Security", "max-age=31536000");
    if (req.path.startsWith("/api/")) res.set("Cache-Control", "no-store");
    const origin = req.get("origin");
    if (origin && allowedOrigin(req, origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Access-Control-Allow-Credentials", "true");
      res.vary("Origin");
      res.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Auth-Token",
      );
      res.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
    }
    if (
      origin &&
      !allowedOrigin(req, origin) &&
      !["GET", "HEAD"].includes(req.method)
    )
      return res.status(403).json({ error: "Request origin is not allowed." });
    if (
      cookieToken(req) &&
      !req.get("authorization") &&
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      !allowedOrigin(req, origin)
    )
      return res
        .status(403)
        .json({ error: "A valid same-origin request is required." });
    if (req.method === "OPTIONS")
      return res.sendStatus(origin && allowedOrigin(req, origin) ? 204 : 403);
    let decoded;
    try {
      decoded = require("node:path").posix.normalize(decodeURIComponent(req.path).replace(/\\/g,"/"));
    } catch {
      return res.sendStatus(400);
    }
    if (
      /(?:^|\/)\./.test(decoded) ||
      /\.(?:sqlite(?:-wal|-shm)?|sql|db|bak|env)$/i.test(decoded) ||
      /(?:^|\/)orcathon_participants\.(?:js|json)(?:$|[:/])/i.test(decoded)
    )
      return res.status(404).json({ error: "Not found" });
    next();
  });
  // Coarse overload guard: proxy addresses may represent many visitors.
  // Account-specific credential limits run after JSON parsing in auth routes.
  app.use("/api", createLimiter(3000));
  app.use(['/api/auth/login','/api/auth/signup'],createLimiter(1500,15*60000));
  app.use("/api/certificates/claim", createLimiter(10, 15 * 60000));
  app.use("/api/certificates/verify", createLimiter(60));
}
function validateRequest(req, res, next) {
  if (
    req.body !== undefined &&
    (!req.body ||
      Array.isArray(req.body) ||
      typeof req.body !== "object" ||
      !validateShape(req.body))
  )
    return res.status(400).json({ error: "Invalid request body." });
  if (
    Object.values(req.query).some(
      (value) => typeof value !== "string" || value.length > 500,
    )
  )
    return res.status(400).json({ error: "Invalid query parameters." });
  next();
}
function text(value, max = 2000) {
  return (
    typeof value === "string" &&
    value.length <= max &&
    !/[<>\u0000]/.test(value)
  );
}
function httpUrl(value) {
  if (value === "") return true;
  try {
    const u = new URL(value);
    return (
      typeof value === "string" &&
      value.length <= 2048 &&
      ["https:", "http:"].includes(u.protocol) &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}
module.exports = {
  isLegacySeedUser,
  configureSecurity,
  validateRequest,
  createLimiter,
  cookieToken,
  setSessionCookie,
  clearSessionCookie,
  publicUser,
  text,
  httpUrl,
};
