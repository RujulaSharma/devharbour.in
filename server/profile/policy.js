const { VISIBILITY, SECTIONS } = require("./validation");
function levelTitle(level) {
  return level > 50
    ? "Dev Harbour Legend"
    : level > 40
      ? "Grandmaster"
      : level > 30
        ? "Elite Engineer"
        : level > 20
          ? "Code Warrior"
          : level > 10
            ? "Code Architect"
            : level > 5
              ? "Code Explorer"
              : "Code Rookie";
}
function allowed(visibility, owner, follower) {
  return (
    owner || visibility === "public" || (visibility === "followers" && follower)
  );
}
function visibleSections(profile, owner, follower) {
  return Object.fromEntries(
    SECTIONS.map((k) => [
      k,
      allowed(profile.privacy?.[k] || "private", owner, follower),
    ]),
  );
}
function publicIdentity(user, profile) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    avatarUrl: user.avatar_url || "",
    headline: profile.headline,
    title: profile.title,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    college: profile.college,
    company: profile.company,
    cover: profile.cover,
    memberSince: user.created_at,
  };
}
function csrf(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const site = req.headers["sec-fetch-site"];
  if (site && !["same-origin", "none"].includes(site))
    return res
      .status(403)
      .json({ error: "Cross-site profile changes are not allowed." });
  const origin = req.headers.origin;
  if (origin) {
    const allowedOrigins = new Set([
      "https://devharbour.in",
      "https://www.devharbour.in",
      process.env.APP_BASE_URL,
    ]);
    if (process.env.NODE_ENV !== "production")
      allowedOrigins.add(req.protocol + "://" + req.get("host"));
    if (!allowedOrigins.has(origin))
      return res.status(403).json({ error: "Untrusted request origin." });
  }
  if (!req.headers.authorization && !req.headers["x-auth-token"] && !origin)
    return res.status(403).json({
      error: "An origin or explicit authentication token is required.",
    });
  next();
}
module.exports = { allowed, visibleSections, publicIdentity, levelTitle, csrf };
