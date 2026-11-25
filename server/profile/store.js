const { profilePrisma } = require("./prisma");
const db = require("../db");
const v = require("./validation");
const { allowed, visibleSections, publicIdentity } = require("./policy");
const defaults = {
  headline: "",
  college: "",
  company: "",
  title: "",
  city: "",
  state: "",
  country: "",
  cover: "lavender",
  visibility: "private",
  discovery: false,
  recruitment: false,
  details: {},
  privacy: {},
  links: {},
  pins: {},
  version: 0,
};
async function getProfile(id) {
  return (
    (await profilePrisma().developerProfile.findUnique({
      where: { userId: id },
    })) || { ...defaults, userId: id }
  );
}
async function blocked(a, b) {
  if (!a || a === b) return false;
  return Boolean(
    await profilePrisma().profileConnection.findFirst({
      where: {
        kind: "block",
        OR: [
          { fromId: a, toId: b },
          { fromId: b, toId: a },
        ],
      },
    }),
  );
}
async function access(user, viewer) {
  const profile = await getProfile(user.id),
    owner = viewer?.id === user.id;
  if (await blocked(viewer?.id, user.id))
    return { owner: false, read: false, sections: {}, profile };
  const follower =
    !!viewer &&
    !!(await profilePrisma().profileConnection.findFirst({
      where: {
        fromId: viewer.id,
        toId: user.id,
        kind: "follow",
        status: "accepted",
      },
    }));
  return {
    owner,
    read: allowed(profile.visibility, owner, follower),
    sections: visibleSections(profile, owner, follower),
    profile,
    follower,
  };
}
async function save(id, input) {
  v.object(input);
  const profile = v.profile(input),
    account = v.account(input.account || {});
  const expected = Number(input.version);
  if (!Number.isInteger(expected) || expected < 0)
    throw v.invalid("A profile version is required.");
  if (profile.pins) {
    const user = await db.getUserById(id);
    const owned = {
      projects: (await db.getUserProjects(id, "approved")).map((x) => x.id),
      badges: (await db.getUserAchievements(id)).map((x) => x.id),
      certificates: (await db.getUserCertificates(user.email)).map(
        (x) => x.credential_id,
      ),
    };
    for (const [kind, ids] of Object.entries(profile.pins))
      if (ids.some((value) => !owned[kind].includes(value)))
        throw v.invalid("Only your own recorded items can be pinned.");
  }
  const prisma = profilePrisma();
  return prisma.$transaction(async (tx) => {
    const old = await tx.developerProfile.findUnique({ where: { userId: id } });
    if ((old?.version || 0) !== expected)
      throw Object.assign(
        new Error(
          "Your profile changed in another tab. Reload it before saving.",
        ),
        { status: 409 },
      );
    for (const key of ["details", "privacy", "links", "pins"])
      if (profile[key])
        profile[key] = { ...(old?.[key] || {}), ...profile[key] };
    if (
      profile.recruitment === true &&
      profile.visibility !== "public" &&
      old?.visibility !== "public"
    )
      throw v.invalid(
        "Set your profile to public before opting into recruitment discovery.",
      );
    if (profile.visibility && profile.visibility !== "public") {
      profile.discovery = false;
      profile.recruitment = false;
    }
    if (profile.visibility)
      await tx.$executeRawUnsafe(
        "INSERT INTO user_settings (user_id,profile_public) VALUES ($2,$1) ON CONFLICT (user_id) DO UPDATE SET profile_public=EXCLUDED.profile_public",
        profile.visibility === "public" ? 1 : 0,
        id,
      );
    const saved = old
      ? await tx.developerProfile.updateMany({
          where: { userId: id, version: expected },
          data: { ...profile, version: { increment: 1 } },
        })
      : await tx.developerProfile.create({ data: { ...profile, userId: id } });
    if (old && saved.count !== 1)
      throw Object.assign(new Error("Profile changed. Reload and try again."), {
        status: 409,
      });
    // Parameterized updates use the same connection/transaction. Never update certificate_name.
    const cols = {
      fullName: "full_name",
      bio: "bio",
      location: "location",
      username: "username",
    };
    for (const [key, value] of Object.entries(account))
      await tx.$executeRawUnsafe(
        "UPDATE users SET " + cols[key] + "=$1, updated_at=$2 WHERE id=$3",
        value,
        new Date().toISOString(),
        id,
      );
    return tx.developerProfile.findUnique({ where: { userId: id } });
  });
}
async function entries(id, kind) {
  return profilePrisma().profileEntry.findMany({
    where: {
      userId: id,
      kind: kind || { in: ["education", "experience", "external-certificate"] },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
async function saveEntry(id, kind, input, entryId) {
  const data = v.entry(kind, input),
    p = profilePrisma();
  if (entryId) {
    const result = await p.profileEntry.updateMany({
      where: { id: entryId, userId: id, kind },
      data: { data },
    });
    if (!result.count)
      throw Object.assign(new Error("Entry not found."), { status: 404 });
    return p.profileEntry.findUnique({ where: { id: entryId } });
  }
  if ((await p.profileEntry.count({ where: { userId: id, kind } })) >= 30)
    throw v.invalid("At most 30 entries per section.");
  return p.profileEntry.create({ data: { userId: id, kind, data } });
}
async function removeEntry(id, entryId) {
  const result = await profilePrisma().profileEntry.deleteMany({
    where: { id: entryId, userId: id },
  });
  if (!result.count)
    throw Object.assign(new Error("Entry not found."), { status: 404 });
}
async function skills(id) {
  const p = profilePrisma();
  const items = await p.profileSkill.findMany({
    where: { userId: id },
    orderBy: [{ pinned: "desc" }, { name: "asc" }],
    take: 100,
  });
  const counts = await p.profileConnection.groupBy({
    by: ["kind"],
    where: {
      toId: id,
      status: "accepted",
      kind: { in: items.map((s) => "endorse:" + s.id) },
    },
    _count: { _all: true },
  });
  const map = new Map(counts.map((c) => [c.kind, c._count._all]));
  return items.map((s) => ({
    ...s,
    endorsements: map.get("endorse:" + s.id) || 0,
    verified: false,
  }));
}
async function saveSkill(id, input, skillId) {
  const data = v.skill(input),
    p = profilePrisma();
  if (skillId) {
    const result = await p.profileSkill.updateMany({
      where: { id: skillId, userId: id },
      data,
    });
    if (!result.count)
      throw Object.assign(new Error("Skill not found."), { status: 404 });
    return p.profileSkill.findUnique({ where: { id: skillId } });
  }
  if ((await p.profileSkill.count({ where: { userId: id } })) >= 100)
    throw v.invalid("At most 100 skills.");
  return p.profileSkill.create({ data: { ...data, userId: id } });
}
async function connections(id) {
  const p = profilePrisma();
  const [followers, following, incoming] = await Promise.all([
    p.profileConnection.count({
      where: { toId: id, kind: "follow", status: "accepted" },
    }),
    p.profileConnection.count({
      where: { fromId: id, kind: "follow", status: "accepted" },
    }),
    p.profileConnection.findMany({
      where: { toId: id, status: "pending" },
      select: {
        id: true,
        kind: true,
        message: true,
        createdAt: true,
        from: { select: { id: true, username: true, fullName: true } },
      },
      take: 30,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { followers, following, incoming };
}
async function connect(viewer, target, kind, message = "") {
  if (viewer.id === target.id) throw v.invalid("Choose a different developer.");
  if (await blocked(viewer.id, target.id))
    throw Object.assign(new Error("Developer not available."), { status: 404 });
  const profile = await getProfile(target.id);
  if (kind === "recruitment" && (!profile.recruitment || !profile.discovery))
    throw v.invalid(
      "This developer is not accepting recruiter contact requests.",
    );
  if (kind === "collaboration" && !profile.details.collaboration)
    throw v.invalid("This developer is not accepting collaboration requests.");
  const p = profilePrisma();
  const status =
    kind === "follow" && profile.visibility === "public"
      ? "accepted"
      : "pending";
  const item = await p.profileConnection.upsert({
    where: { fromId_toId_kind: { fromId: viewer.id, toId: target.id, kind } },
    create: {
      fromId: viewer.id,
      toId: target.id,
      kind,
      status,
      message: v.text(message, 500),
    },
    update: {},
  });
  await p.profileNotification.upsert({
    where: {
      userId_eventKey: { userId: target.id, eventKey: "connection:" + item.id },
    },
    create: {
      userId: target.id,
      eventKey: "connection:" + item.id,
      title: "New " + kind + " request from @" + viewer.username,
    },
    update: {},
  });
  return item;
}
async function publicData(user, viewer) {
  const state = await access(user, viewer);
  if (!state.read)
    throw Object.assign(
      new Error("Developer profile is unavailable or private."),
      { status: 404 },
    );
  const { profile, sections } = state;
  const p = profilePrisma();
  const counts = await connections(user.id);
  const result = {
    user: publicIdentity(user, profile),
    profile: {
      visibility: profile.visibility,
      headline: profile.headline,
      cover: profile.cover,
      details: {
        openToWork: !!profile.details.openToWork,
        openToInternship: !!profile.details.openToInternship,
        collaboration: !!profile.details.collaboration,
      },
    },
    sections,
    followers: counts.followers,
    following: counts.following,
    skills: [],
    education: [],
    experience: [],
    links: {},
    bio: "",
    resume: null,
  };
  if (!sections.about) {
    delete result.user.city;
    delete result.user.state;
    delete result.user.country;
  }
  if (!sections.education) delete result.user.college;
  if (!sections.experience) {
    delete result.user.company;
    delete result.user.title;
  }
  result.profile.pins = { certificates: profile.pins?.certificates || [] };
  if (sections.about) result.bio = user.bio || "";
  if (sections.skills) result.skills = await skills(user.id);
  if (sections.links) result.links = profile.links;
  if (sections.education || sections.experience) {
    const all = await entries(user.id);
    if (sections.education)
      result.education = all.filter((x) => x.kind === "education");
    if (sections.experience)
      result.experience = all.filter((x) => x.kind === "experience");
  }
  if (sections.resume) {
    const media = await p.profileMedia.findFirst({
      where: { userId: user.id, kind: "resume" },
      orderBy: { createdAt: "desc" },
    });
    if (media) result.resume = { id: media.id, label: media.label };
  }
  return result;
}
module.exports = {
  getProfile,
  save,
  entries,
  saveEntry,
  removeEntry,
  skills,
  saveSkill,
  blocked,
  access,
  connections,
  connect,
  publicData,
  defaults,
};
