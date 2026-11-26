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
async function getProfile(id, account) {
  const p = profilePrisma();
  let profile = await p.developerProfile.findUnique({ where: { userId: id } });
  const user = account || await db.getUserById(id);
  const provisioning = require('./provisioning');
  if (!profile && user) {
    await provisioning.insertMissingProfiles([user]);
    profile = await p.developerProfile.findUnique({ where: { userId: id } });
  }
  return provisioning.withAccountFields(profile || { ...defaults, userId: id }, user);
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
async function access(user, viewer, options = {}) {
  const profile = await getProfile(user.id, user);
  const rawOwner = Boolean(viewer && viewer.id === user.id);
  const asVisitor = Boolean(options.asVisitor && rawOwner);
  const effectiveViewer = asVisitor ? null : viewer;
  const owner = Boolean(!asVisitor && rawOwner);
  if (!asVisitor && (await blocked(effectiveViewer?.id, user.id)))
    return { owner: false, read: false, sections: {}, profile, asVisitor };
  const follower =
    !asVisitor &&
    !!effectiveViewer &&
    !!(await profilePrisma().profileConnection.findFirst({
      where: {
        fromId: effectiveViewer.id,
        toId: user.id,
        kind: "follow",
        status: "accepted",
      },
    }));
  return {
    owner,
    rawOwner,
    asVisitor,
    read: allowed(profile.visibility, owner, follower),
    sections: visibleSections(profile, owner, follower),
    profile,
    follower,
  };
}
async function ensureSignupProfile(userId, { publicProfile = false, isMinor = false } = {}) {
  if (!userId) return null;
  const p = profilePrisma();
  const existing = await p.developerProfile.findUnique({ where: { userId } });
  if (existing) return existing;
  const user = await db.getUserById(userId);
  const account = user ? require('./provisioning').accountFields(user) : { city: '', links: {} };
  const makePublic = Boolean(publicProfile && !isMinor);
  const privacy = makePublic
    ? {
        about: "public",
        location: "public",
        availability: "public",
        statistics: "public",
        projects: "public",
        skills: "public",
        achievements: "public",
        activity: "public",
        links: "public",
        developerId: "public",
        education: "private",
        experience: "private",
        certificates: "private",
        resume: "private",
        hackathons: "private",
        learning: "private",
      }
    : Object.fromEntries(v.SECTIONS.map((s) => [s, "private"]));
  const created = await p.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      "INSERT INTO user_settings (user_id,profile_public) VALUES ($2,$1) ON CONFLICT (user_id) DO UPDATE SET profile_public=EXCLUDED.profile_public",
      makePublic ? 1 : 0,
      userId,
    );
    return tx.developerProfile.create({
      data: {
        userId,
        visibility: makePublic ? "public" : "private",
        discovery: makePublic,
        recruitment: false,
        cover: "scenic",
        city: account.city,
        details: {
          isMinor: Boolean(isMinor),
          showDeveloperId: true,
          showQrCode: true,
          allowResumeDownload: false,
          shareInProgressLearning: false,
        },
        privacy,
        links: account.links,
        pins: {},
      },
    });
  });
  return created;
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
    const achievementIds = (await db.getUserAchievements(id)).map((x) => x.id);
    const owned = {
      projects: (await db.getUserProjects(id, "approved")).map((x) => x.id),
      badges: achievementIds,
      achievements: achievementIds,
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
      avatarUrl: "avatar_url",
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
async function publicData(user, viewer, options = {}) {
  const state = await access(user, viewer, options);
  if (!state.read) {
    if (options.allowPrivatePreview && state.asVisitor) {
      return {
        previewPrivate: true,
        visibility: state.profile.visibility,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
        },
        profile: { visibility: state.profile.visibility },
        sections: {},
        followers: 0,
        following: 0,
        skills: [],
        education: [],
        experience: [],
        achievements: [],
        links: {},
        bio: "",
        resume: null,
        viewerConnection: {
          isOwner: false,
          isVisitorPreview: true,
          followingStatus: "none",
          isFollowedBy: false,
          collaborationStatus: "none",
        },
      };
    }
    throw Object.assign(
      new Error("Developer profile is unavailable or private."),
      { status: 404 },
    );
  }
  const { profile, sections, owner, asVisitor } = state;
  const p = profilePrisma();
  const [counts, emailVerified, certs, avatarMedia, coverMedia] = await Promise.all([
    connections(user.id),
    db.isEmailVerified(user.id),
    db.getUserCertificates(user.email),
    p.profileMedia.findFirst({
      where: { userId: user.id, kind: "avatar" },
      orderBy: { createdAt: "desc" },
    }),
    p.profileMedia.findFirst({
      where: { userId: user.id, kind: "cover" },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const hasValidCert = Array.isArray(certs) && certs.some((c) => String(c.status || "").toLowerCase() === "valid");
  const details = profile.details || {};
  let viewerConnection = {
    isOwner: owner,
    isVisitorPreview: Boolean(asVisitor),
    followingStatus: "none",
    isFollowedBy: false,
    collaborationStatus: "none",
  };
  if (!owner && !asVisitor && viewer && viewer.id !== user.id) {
    const [outConns, revFollow] = await Promise.all([
      p.profileConnection.findMany({
        where: { fromId: viewer.id, toId: user.id },
      }),
      p.profileConnection.findFirst({
        where: { fromId: user.id, toId: viewer.id, kind: "follow", status: "accepted" },
      }),
    ]);
    const fConn = outConns.find((c) => c.kind === "follow");
    const cConn = outConns.find((c) => c.kind === "collaboration");
    viewerConnection = {
      isOwner: false,
      isVisitorPreview: false,
      followingStatus: fConn?.status || "none",
      isFollowedBy: Boolean(revFollow),
      collaborationStatus: cConn?.status || "none",
    };
  }
  const result = {
    user: publicIdentity(user, profile, {
      verified: Boolean(emailVerified && hasValidCert),
      emailVerified: Boolean(emailVerified),
    }),
    profile: {
      visibility: profile.visibility,
      headline: profile.headline,
      cover: profile.cover,
      details: sections.availability
        ? {
            openToWork: !!details.openToWork,
            openToInternship: !!details.openToInternship,
            collaboration: !!details.collaboration,
            remote: !!details.remote,
            availability: details.availability || "",
            targetRole: details.targetRole || "",
            preferredWorkType: details.preferredWorkType || "",
            preferredLocation: details.preferredLocation || "",
            shareInProgressLearning: !!details.shareInProgressLearning,
          }
        : {},
    },
    media: {
      avatarMediaId: avatarMedia?.id || null,
      coverMediaId: coverMedia?.id || null,
    },
    sections,
    followers: counts.followers,
    following: counts.following,
    skills: [],
    education: [],
    experience: [],
    achievements: [],
    links: {},
    bio: "",
    resume: null,
    developerId: null,
    viewerConnection,
  };
  if (!sections.location) {
    delete result.user.city;
    delete result.user.state;
    delete result.user.country;
  }
  if (!sections.education) delete result.user.college;
  if (!sections.experience) {
    delete result.user.company;
    delete result.user.title;
  }
  result.profile.pins = {
    projects: profile.pins?.projects || [],
    certificates: profile.pins?.certificates || [],
    achievements: profile.pins?.achievements || profile.pins?.badges || [],
    badges: profile.pins?.badges || profile.pins?.achievements || [],
  };
  if (sections.about) result.bio = user.bio || "";
  if (sections.developerId && details.showDeveloperId !== false) {
    result.developerId = {
      code: "DH-" + String(user.id || "").replace(/^usr-/i, "").toUpperCase(),
      showQrCode: details.showQrCode !== false,
    };
  }
  if (sections.skills) result.skills = await skills(user.id);
  if (sections.links) result.links = profile.links;
  if (sections.education || sections.experience) {
    const all = await entries(user.id);
    if (sections.education)
      result.education = all.filter((x) => x.kind === "education");
    if (sections.experience)
      result.experience = all.filter((x) => x.kind === "experience");
  }
  if (sections.achievements) {
    const unlocked = await db.getUserAchievements(user.id);
    result.achievements = unlocked.map((a) => ({
      id: a.id,
      key: a.key || a.id,
      title: a.title,
      description: a.description,
      badgeIcon: a.badge_icon || a.icon || "trophy",
      badgeType: a.badge_type || (Number(a.xp_bonus || 50) >= 250 ? "gold" : Number(a.xp_bonus || 50) >= 100 ? "silver" : "bronze"),
      xpBonus: Number(a.xp_bonus || 50),
      unlockedAt: a.unlocked_at,
    }));
  }
  if (sections.resume) {
    const media = await p.profileMedia.findFirst({
      where: { userId: user.id, kind: "resume" },
      orderBy: { createdAt: "desc" },
    });
    const downloadAllowed = details.allowResumeDownload !== false;
    if (media || downloadAllowed) {
      result.resume = {
        id: media?.id || null,
        label: media?.label || "Dev Harbour Developer Resume (PDF)",
        downloadAllowed,
        hasUploadedPdf: Boolean(media),
      };
    }
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
  ensureSignupProfile,
  connections,
  connect,
  publicData,
  defaults,
};
