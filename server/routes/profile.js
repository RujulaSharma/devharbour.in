const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { rateLimit } = require("../rate-limiter");
const { profilePrisma } = require("../profile/prisma");
const store = require("../profile/store");
const progress = require("../profile/progress");
const media = require("../profile/media");
const v = require("../profile/validation");
const policy = require("../profile/policy");
const router = express.Router();
const enabled = () => process.env.PROFILE_ECOSYSTEM_ENABLED === "true";
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
router.use((_req, res, next) => {
  res.set("Cache-Control", "private, no-store");
  next();
});
router.get("/config", (_req, res) =>
  res.json({
    enabled: enabled(),
    storage: media.configured(),
    github: false,
    ai: false,
    categories: v.CATEGORIES,
    proficiencies: v.PROFICIENCIES,
    sections: v.SECTIONS,
    links: v.LINK_KEYS,
  }),
);
router.use((req, res, next) =>
  enabled()
    ? next()
    : res
        .status(503)
        .json({ error: "The advanced profile system has not been enabled." }),
);
router.use(rateLimit({ windowMs: 60000, max: 90 }));
router.use(policy.csrf);
async function owned(req) {
  const user = await db.getUserById(req.user.id);
  if (!user)
    throw Object.assign(new Error("Account not found."), { status: 401 });
  return user;
}
router.get(
  "/me",
  requireAuth,
  wrap(async (req, res) => {
    const user = await owned(req);
    const [profile, entries, skills, connections, uploads] = await Promise.all([
      store.getProfile(user.id),
      store.entries(user.id),
      store.skills(user.id),
      store.connections(user.id),
      profilePrisma().profileMedia.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          kind: true,
          label: true,
          bytes: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatar_url,
        memberSince: user.created_at,
        emailVerified: req.user.emailVerified,
      },
      profile,
      entries,
      skills,
      connections,
      uploads,
    });
  }),
);
router.patch(
  "/me",
  requireAuth,
  wrap(async (req, res) =>
    res.json({ profile: await store.save(req.user.id, req.body) }),
  ),
);
router.get(
  "/me/progress/:module",
  requireAuth,
  wrap(async (req, res) => {
    const user = await owned(req),
      id = user.id;
    const modules = {
      overview: () => progress.overview(user),
      coding: () => progress.coding(id),
      learning: () => progress.learning(id),
      hackathons: () => progress.eventHistory(user),
      certificates: () => progress.certificateList(user),
      workspace: () => progress.workspace(id),
      xp: () => progress.xpSources(id),
      projects: () => db.getUserProjects(id, "approved"),
      achievements: () => db.getUserAchievements(id),
    };
    const handler = modules[req.params.module];
    if (!handler)
      return res.status(404).json({ error: "Profile module not found." });
    res.json({ data: await handler() });
  }),
);
router.get(
  "/me/activity",
  requireAuth,
  wrap(async (req, res) => {
    const year = req.query.year || "rolling";
    if (
      year !== "rolling" &&
      (!/^\d{4}$/.test(year) ||
        +year < 2020 ||
        +year > new Date().getUTCFullYear())
    )
      throw v.invalid("Invalid activity year.");
    res.json(await progress.activity(req.user.id, year));
  }),
);
router.get(
  "/me/timeline",
  requireAuth,
  wrap(async (req, res) => {
    const before = req.query.before;
    if (before && (typeof before !== "string" || before.length > 400))
      throw v.invalid("Invalid cursor.");
    res.json(
      await progress.timeline(req.user.id, {
        before,
        limit: req.query.limit,
        type: req.query.type,
      }),
    );
  }),
);
router.get(
  "/me/activity/:date",
  requireAuth,
  wrap(async (req, res) => {
    const day = v.date(req.params.date);
    const end = new Date(Date.parse(day + "T00:00:00Z") + 86400000)
      .toISOString()
      .slice(0, 10);
    const result = await progress.rows(
      `SELECT id,amount,source_type,created_at FROM xp_ledger WHERE user_id=$1 AND ${progress.daySql()} >= $2 AND ${progress.daySql()} < $3 AND ${progress.meaningfulXp()} ORDER BY created_at DESC LIMIT 100`,
      [req.user.id, day, end],
    );
    res.json({
      date: day,
      items: result.map((r) => ({
        id: r.id,
        xp: r.amount,
        type: r.source_type,
        date: r.created_at,
      })),
      limited: result.length === 100,
    });
  }),
);
router.post(
  "/me/entries/:kind",
  requireAuth,
  wrap(async (req, res) =>
    res.status(201).json({
      entry: await store.saveEntry(req.user.id, req.params.kind, req.body),
    }),
  ),
);
router.put(
  "/me/entries/:kind/:id",
  requireAuth,
  wrap(async (req, res) =>
    res.json({
      entry: await store.saveEntry(
        req.user.id,
        req.params.kind,
        req.body,
        req.params.id,
      ),
    }),
  ),
);
router.delete(
  "/me/entries/:id",
  requireAuth,
  wrap(async (req, res) => {
    await store.removeEntry(req.user.id, req.params.id);
    res.json({ deleted: true });
  }),
);
router.post(
  "/me/skills",
  requireAuth,
  wrap(async (req, res) =>
    res
      .status(201)
      .json({ skill: await store.saveSkill(req.user.id, req.body) }),
  ),
);
router.put(
  "/me/skills/:id",
  requireAuth,
  wrap(async (req, res) =>
    res.json({
      skill: await store.saveSkill(req.user.id, req.body, req.params.id),
    }),
  ),
);
router.delete(
  "/me/skills/:id",
  requireAuth,
  wrap(async (req, res) => {
    const r = await profilePrisma().profileSkill.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!r.count) return res.status(404).json({ error: "Skill not found." });
    res.json({ deleted: true });
  }),
);
router.get(
  "/me/goals",
  requireAuth,
  wrap(async (req, res) => {
    const stats = await progress.overview(await owned(req));
    const goals = await profilePrisma().profileGoal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({
      goals: goals.map((g) => ({
        ...g,
        progress: Math.max(
          0,
          progress.metricValue(stats, g.metric) - g.baseline,
        ),
        completed:
          progress.metricValue(stats, g.metric) - g.baseline >= g.target,
      })),
    });
  }),
);
router.post(
  "/me/goals",
  requireAuth,
  wrap(async (req, res) => {
    const data = v.goal(req.body),
      stats = await progress.overview(await owned(req));
    if (
      (await profilePrisma().profileGoal.count({
        where: { userId: req.user.id },
      })) >= 50
    )
      throw v.invalid("At most 50 goals.");
    res.status(201).json({
      goal: await profilePrisma().profileGoal.create({
        data: {
          ...data,
          userId: req.user.id,
          baseline: progress.metricValue(stats, data.metric),
        },
      }),
    });
  }),
);
router.put(
  "/me/goals/:id",
  requireAuth,
  wrap(async (req, res) => {
    const r = await profilePrisma().profileGoal.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: v.goal(req.body),
    });
    if (!r.count) return res.status(404).json({ error: "Goal not found." });
    res.json({ updated: true });
  }),
);
router.delete(
  "/me/goals/:id",
  requireAuth,
  wrap(async (req, res) => {
    await profilePrisma().profileGoal.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ deleted: true });
  }),
);
router.post(
  "/me/media/:kind",
  requireAuth,
  express.raw({
    type: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
    limit: "4mb",
  }),
  wrap(async (req, res) => {
    res.status(201).json({
      file: await media.upload(
        req.user.id,
        req.params.kind,
        req.body,
        req.get("content-type")?.split(";")[0],
        req.get("x-file-name"),
      ),
    });
  }),
);
router.delete(
  "/me/media/:id",
  requireAuth,
  wrap(async (req, res) => {
    await media.remove(req.user.id, req.params.id);
    res.json({ deleted: true });
  }),
);
router.get(
  "/media/:id",
  wrap(async (req, res) => {
    const record = await profilePrisma().profileMedia.findUnique({
      where: { id: req.params.id },
    });
    if (!record) return res.status(404).json({ error: "File not found." });
    const user = await db.getUserById(record.userId),
      state = await store.access(user, req.user);
    if (
      !state.owner &&
      (!state.read ||
        !["avatar", "cover", "resume"].includes(record.kind) ||
        (record.kind === "resume" && !state.sections.resume))
    )
      return res.status(404).json({ error: "File not found." });
    res.set("Referrer-Policy", "no-referrer");
    res.json({ url: await media.signed(record), expiresIn: 300 });
  }),
);
router.get(
  "/me/notifications",
  requireAuth,
  wrap(async (req, res) =>
    res.json({
      notifications: await profilePrisma().profileNotification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    }),
  ),
);
router.get(
  "/me/connections",
  requireAuth,
  wrap(async (req, res) => {
    const kind = v.choice(req.query.kind || "follow", [
      "follow",
      "following",
      "block",
    ]);
    const p = profilePrisma(),
      outbound = kind !== "follow";
    const items = await p.profileConnection.findMany({
      where: {
        [outbound ? "fromId" : "toId"]: req.user.id,
        kind: kind === "following" ? "follow" : kind,
        status: "accepted",
      },
      select: {
        id: true,
        createdAt: true,
        [outbound ? "to" : "from"]: {
          select: { username: true, fullName: true },
        },
      },
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    res.json({
      items: items.map((x) => ({
        id: x.id,
        createdAt: x.createdAt,
        user: x[outbound ? "to" : "from"],
      })),
      limited: items.length === 100,
    });
  }),
);
router.patch(
  "/me/notifications/:id",
  requireAuth,
  wrap(async (req, res) => {
    await profilePrisma().profileNotification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    res.json({ updated: true });
  }),
);
router.get(
  "/discover",
  requireAuth,
  wrap(async (req, res) => {
    const search = v.text(req.query.search || "", 60);
    const profiles = await profilePrisma().developerProfile.findMany({
      where: {
        visibility: "public",
        discovery: true,
        ...(req.query.recruitment === "true" ? { recruitment: true } : {}),
        ...(search
          ? {
              OR: [
                { headline: { contains: search, mode: "insensitive" } },
                {
                  AND: [
                    { college: { contains: search, mode: "insensitive" } },
                    { privacy: { path: ["education"], equals: "public" } },
                  ],
                },
                {
                  AND: [
                    { company: { contains: search, mode: "insensitive" } },
                    { privacy: { path: ["experience"], equals: "public" } },
                  ],
                },
              ],
            }
          : {}),
      },
      select: {
        userId: true,
        headline: true,
        college: true,
        company: true,
        user: { select: { username: true, fullName: true } },
      },
      take: 30,
      orderBy: { updatedAt: "desc" },
    });
    const blocks = await profilePrisma().profileConnection.findMany({
      where: {
        kind: "block",
        OR: [{ fromId: req.user.id }, { toId: req.user.id }],
      },
      select: { fromId: true, toId: true },
    });
    const excluded = new Set(blocks.flatMap((b) => [b.fromId, b.toId]));
    excluded.add(req.user.id);
    res.json({
      developers: profiles
        .filter((p) => !excluded.has(p.userId))
        .map((p) => ({ ...p, college: undefined, company: undefined })),
    });
  }),
);
router.post(
  "/connect/:username/:kind",
  requireAuth,
  wrap(async (req, res) => {
    const target = await db.getUserByUsername(req.params.username);
    if (!target) return res.status(404).json({ error: "Developer not found." });
    const kind = v.choice(req.params.kind, [
      "follow",
      "collaboration",
      "recruitment",
      "block",
      "report",
    ]);
    if (
      kind === "recruitment" &&
      !["admin", "moderator"].includes(req.user.role)
    )
      return res.status(403).json({
        error: "Recruiter access is not configured for this account.",
      });
    if (["block", "report"].includes(kind)) {
      if (target.id === req.user.id) throw v.invalid("Choose another account.");
      const record = await profilePrisma().$transaction(async (tx) => {
        const item = await tx.profileConnection.upsert({
          where: {
            fromId_toId_kind: { fromId: req.user.id, toId: target.id, kind },
          },
          create: {
            fromId: req.user.id,
            toId: target.id,
            kind,
            status: kind === "block" ? "accepted" : "pending",
            message: v.text(req.body.message || "", 500),
          },
          update: {},
        });
        if (kind === "block")
          await tx.profileConnection.deleteMany({
            where: {
              OR: [
                { fromId: req.user.id, toId: target.id },
                { fromId: target.id, toId: req.user.id },
              ],
              AND: [{ kind: { notIn: ["block", "report"] } }],
            },
          });
        return item;
      });
      return res.json({ id: record.id, kind });
    }
    res.json({
      connection: await store.connect(
        req.user,
        target,
        kind,
        req.body.message || "",
      ),
    });
  }),
);
router.delete(
  "/connect/:username/:kind",
  requireAuth,
  wrap(async (req, res) => {
    const target = await db.getUserByUsername(req.params.username);
    if (target)
      await profilePrisma().profileConnection.deleteMany({
        where: {
          fromId: req.user.id,
          toId: target.id,
          kind: v.choice(req.params.kind, [
            "follow",
            "block",
            "collaboration",
            "recruitment",
          ]),
        },
      });
    res.json({ deleted: true });
  }),
);
router.patch(
  "/me/requests/:id",
  requireAuth,
  wrap(async (req, res) => {
    const status = v.choice(req.body.status, ["accepted", "declined"]);
    const r = await profilePrisma().profileConnection.updateMany({
      where: {
        id: req.params.id,
        toId: req.user.id,
        status: "pending",
        kind: { in: ["follow", "collaboration", "recruitment"] },
      },
      data: { status },
    });
    if (!r.count) return res.status(404).json({ error: "Request not found." });
    res.json({ updated: true });
  }),
);
router.post(
  "/skills/:id/endorsement",
  requireAuth,
  wrap(async (req, res) => {
    const p = profilePrisma(),
      skill = await p.profileSkill.findUnique({ where: { id: req.params.id } });
    if (!skill || skill.userId === req.user.id)
      return res.status(404).json({ error: "Skill not available." });
    const user = await db.getUserById(skill.userId),
      state = await store.access(user, req.user);
    if (!state.read || !state.sections.skills || !state.follower)
      return res.status(403).json({
        error: "Follow this developer before endorsing their visible skill.",
      });
    await p.profileConnection.upsert({
      where: {
        fromId_toId_kind: {
          fromId: req.user.id,
          toId: skill.userId,
          kind: "endorse:" + skill.id,
        },
      },
      create: {
        fromId: req.user.id,
        toId: skill.userId,
        kind: "endorse:" + skill.id,
        status: "accepted",
      },
      update: {},
    });
    res.json({ endorsed: true });
  }),
);
router.delete(
  "/skills/:id/endorsement",
  requireAuth,
  wrap(async (req, res) => {
    await profilePrisma().profileConnection.deleteMany({
      where: { fromId: req.user.id, kind: "endorse:" + req.params.id },
    });
    res.json({ endorsed: false });
  }),
);
function resumeSections(input) {
  const all = require("../profile/exports").RESUME_SECTIONS;
  if (input === undefined) return all;
  if (
    !Array.isArray(input) ||
    !input.length ||
    input.length > all.length ||
    new Set(input).size !== input.length ||
    input.some((x) => !all.includes(x))
  )
    throw v.invalid(
      "Choose unique supported resume sections in your preferred order.",
    );
  return input;
}
router.get(
  "/me/resume-versions",
  requireAuth,
  wrap(async (req, res) =>
    res.json({
      versions: (await store.entries(req.user.id, "resume-version")).map(
        (x) => ({
          id: x.id,
          createdAt: x.createdAt,
          title: x.data.title,
          template: x.data.template,
          summary: x.data.summary,
          sections: x.data.sections,
        }),
      ),
    }),
  ),
);
router.get(
  "/me/recap/:year",
  requireAuth,
  wrap(async (req, res) => {
    const year = Number(req.params.year);
    if (
      !Number.isInteger(year) ||
      year < 2020 ||
      year > new Date().getUTCFullYear()
    )
      throw v.invalid("Choose a supported year.");
    res.json(await require("../profile/recap").recap(await owned(req), year));
  }),
);
router.get(
  "/me/readiness",
  requireAuth,
  wrap(async (req, res) => {
    const user = await owned(req);
    const [profile, stats, uploads] = await Promise.all([
      store.getProfile(user.id),
      progress.overview(user),
      profilePrisma().profileMedia.findMany({
        where: { userId: user.id },
        select: { kind: true },
      }),
    ]);
    res.json(require("../profile/recap").readiness(profile, stats, uploads));
  }),
);
router.post(
  "/me/resume-versions",
  requireAuth,
  wrap(async (req, res) => {
    if (
      (await profilePrisma().profileEntry.count({
        where: { userId: req.user.id, kind: "resume-version" },
      })) >= 20
    )
      throw v.invalid("At most 20 resume versions.");
    const data = {
      title: v.text(req.body.title, 100, true),
      summary: v.text(req.body.summary || "", 1500),
      template: v.choice(req.body.template || "ats", ["ats", "minimal"]),
      sections: resumeSections(req.body.sections),
      snapshot: await require("../profile/exports").resumeData(
        await owned(req),
      ),
    };
    res.status(201).json({
      version: await profilePrisma().profileEntry.create({
        data: { userId: req.user.id, kind: "resume-version", data },
      }),
    });
  }),
);
router.get(
  "/me/resume-versions/:id/pdf",
  requireAuth,
  wrap(async (req, res) => {
    const version = await profilePrisma().profileEntry.findFirst({
      where: { id: req.params.id, userId: req.user.id, kind: "resume-version" },
    });
    if (!version)
      return res.status(404).json({ error: "Resume version not found." });
    const bytes = await require("../profile/exports").pdf(await owned(req), {
      summary: version.data.summary,
      snapshot: version.data.snapshot,
      template: version.data.template,
      sections: version.data.sections,
    });
    res
      .type("application/pdf")
      .attachment("devharbour-resume.pdf")
      .send(Buffer.from(bytes));
  }),
);
router.get("/integrations", requireAuth, (_req, res) =>
  res.json({
    ai: {
      available: false,
      reason:
        "No AI provider is configured. No private profile data is sent to an AI service.",
    },
    github: {
      available: false,
      reason:
        "GitHub OAuth linking requires a dedicated OAuth app, callback URL, and encrypted token storage. A public link does not verify account ownership.",
    },
    contests: {
      available: false,
      reason: "No contest rating service exists yet.",
    },
    roadmaps: {
      available: false,
      reason: "Roadmaps do not yet record verified milestone completion.",
    },
  }),
);
router.get(
  "/me/score",
  requireAuth,
  wrap(async (req, res) =>
    res.json(
      require("../profile/exports").score(
        await progress.overview(await owned(req)),
      ),
    ),
  ),
);
router.get(
  "/me/exports/:kind",
  requireAuth,
  wrap(async (req, res) => {
    const kind = v.choice(req.params.kind, [
      "resume",
      "id",
      "data",
      "portfolio",
    ]);
    const user = await owned(req);
    const exports = require("../profile/exports");
    if (kind === "data")
      return res
        .attachment("devharbour-profile.json")
        .json(await exports.resumeData(user));
    if (kind === "portfolio") {
      const state = await store.access(user, null);
      if (!state.read || state.profile.visibility !== "public")
        throw v.invalid(
          "Publish your profile before exporting its public portfolio.",
        );
      return res
        .type("html")
        .attachment("devharbour-portfolio.html")
        .send(await exports.publicHtml(user));
    }
    const bytes = await exports.pdf(user, { kind });
    res
      .type("application/pdf")
      .attachment("devharbour-" + kind + ".pdf")
      .send(Buffer.from(bytes));
  }),
);
router.post(
  "/me/resume",
  requireAuth,
  wrap(async (req, res) => {
    const summary = v.text(req.body.summary || "", 1500);
    const bytes = await require("../profile/exports").pdf(await owned(req), {
      summary,
      template: v.choice(req.body.template || "ats", ["ats", "minimal"]),
      sections: resumeSections(req.body.sections),
    });
    res
      .type("application/pdf")
      .attachment("devharbour-resume.pdf")
      .send(Buffer.from(bytes));
  }),
);
router.get(
  "/me/id-card",
  requireAuth,
  wrap(async (req, res) => {
    const user = await owned(req),
      stats = await progress.overview(user);
    const { esc, origin } = require("../profile/exports");
    const QRCode = require("qrcode");
    const qr = await QRCode.toString(
      origin() + "/u/" + encodeURIComponent(user.username),
      { type: "svg", margin: 0 },
    );
    const inner = qr.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    res
      .type("image/svg+xml")
      .set("Content-Disposition", 'attachment; filename="devharbour-card.svg"')
      .send(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="560" viewBox="0 0 1000 560"><rect width="1000" height="560" rx="32" fill="#f6f0ff"/><rect x="30" y="30" width="940" height="500" rx="24" fill="white" stroke="#e2d5f0"/><g fill="#30253f" font-family="Arial,sans-serif"><text x="70" y="100" font-size="24">DEV HARBOUR · DEVELOPER CARD</text><text x="70" y="200" font-size="40">${esc(user.full_name)}</text><text x="70" y="250" font-size="26">@${esc(user.username)}</text><text x="70" y="320" font-size="24">Level ${stats.level} · ${esc(stats.title)}</text><text x="70" y="370" font-size="22">${stats.totalXp} XP</text><text x="70" y="430" font-size="15">${esc(user.id)}</text><text x="70" y="490" font-size="15">Community profile card · Not an official identity document</text></g><svg x="740" y="180" width="160" height="160" viewBox="${qr.match(/viewBox="([^"]+)"/)[1]}">${inner}</svg></svg>`,
      );
  }),
);
router.get(
  "/public-html/:username",
  wrap(async (req, res) => {
    const user = await db.getUserByUsername(req.params.username);
    if (!user) return res.status(404).send("Profile not found");
    res.type("html").send(await require("../profile/exports").publicHtml(user));
  }),
);
router.get(
  "/public/:username",
  wrap(async (req, res) => {
    const user = await db.getUserByUsername(req.params.username);
    if (!user)
      return res.status(404).json({ error: "Developer profile not found." });
    const result = await store.publicData(user, req.user);
    if (result.sections.statistics)
      result.stats = await progress.overview(user);
    if (result.sections.projects)
      result.projects = await db.getUserProjects(user.id, "approved");
    if (result.sections.activity)
      result.activity = await progress.activity(user.id, "rolling");
    if (result.sections.certificates)
      result.certificates = (await progress.certificateList(user)).filter((c) =>
        (result.profile.pins?.certificates || []).includes(c.id),
      );
    if (result.sections.hackathons)
      result.hackathons = await progress.eventHistory(user);
    if (result.sections.learning)
      result.learning = await progress.learning(user.id);
    res.json(result);
  }),
);
router.use((error, req, res, _next) => {
  console.error("[PROFILE]", error.code || error.name);
  const status =
    error.status ||
    (error.code === "P2002"
      ? 409
      : ["P2021", "P2022"].includes(error.code)
        ? 503
        : 500);
  res.status(status).json({
    error:
      status === 409
        ? "That value is already in use, or your profile changed. Reload and try again."
        : status === 503
          ? "Advanced profiles are awaiting database or storage configuration."
          : status < 500
            ? error.message
            : "Profile service temporarily unavailable.",
  });
});
module.exports = router;
