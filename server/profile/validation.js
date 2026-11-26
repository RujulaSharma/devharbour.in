const VISIBILITY = ["public", "followers", "private"];
const CATEGORIES = [
  "Programming Languages",
  "Frontend Development",
  "Backend Development",
  "Database",
  "Full Stack Development",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "Mobile Development",
  "AI and Machine Learning",
  "Testing",
  "Developer Tools",
  "Other Skills",
];
const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
const SECTIONS = [
  "about",
  "location",
  "availability",
  "skills",
  "education",
  "experience",
  "activity",
  "certificates",
  "resume",
  "links",
  "projects",
  "statistics",
  "achievements",
  "hackathons",
  "learning",
  "developerId",
];
const LINK_KEYS = [
  "github",
  "linkedin",
  "portfolio",
  "website",
  "leetcode",
  "hackerrank",
  "codechef",
  "codeforces",
  "stackoverflow",
  "devto",
];
const DETAIL_KEYS = {
  degree: 100,
  specialization: 100,
  graduationYear: 4,
  designation: 100,
  experienceYears: 4,
  careerInterests: 250,
  preferredRoles: 250,
  languages: 250,
  availability: 80,
  targetRole: 80,
  preferredWorkType: 80,
  preferredLocation: 100,
};
function invalid(message) {
  return Object.assign(new Error(message), { status: 400 });
}
function object(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw invalid("Expected an object.");
  return input;
}
function text(v, max, required = false) {
  if (
    typeof v !== "string" ||
    v.trim().length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v)
  )
    throw invalid("Invalid text (maximum " + max + " characters).");
  if (required && !v.trim()) throw invalid("A required field is empty.");
  return v.trim();
}
function url(v) {
  v = text(v, 500);
  if (!v) return "";
  let parsed;
  try {
    parsed = new URL(v);
  } catch {
    throw invalid("Enter a complete HTTPS URL.");
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password)
    throw invalid("Links must use HTTPS without embedded credentials.");
  return parsed.href;
}
function choice(v, options) {
  if (!options.includes(v)) throw invalid("Invalid option.");
  return v;
}
function bool(v) {
  if (typeof v !== "boolean") throw invalid("Expected true or false.");
  return v;
}
function date(v) {
  if (v === "" || v === null) return null;
  if (
    typeof v !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
    !Number.isFinite(Date.parse(v + "T00:00:00Z")) ||
    new Date(v + "T00:00:00Z").toISOString().slice(0, 10) !== v
  )
    throw invalid("Use a valid YYYY-MM-DD date.");
  return v;
}
function profile(input) {
  object(input);
  const out = {};
  for (const [key, max] of Object.entries({
    headline: 160,
    college: 160,
    company: 160,
    title: 100,
    city: 80,
    state: 80,
    country: 80,
  })) {
    if (key in input) out[key] = text(input[key], max);
  }
  if ("cover" in input)
    out.cover = choice(input.cover, [
      "lavender",
      "scenic",
      "mesh",
      "midnight",
      "minimal",
      "custom",
    ]);
  if ("visibility" in input)
    out.visibility = choice(input.visibility, VISIBILITY);
  for (const key of ["discovery", "recruitment"])
    if (key in input) out[key] = bool(input[key]);
  if (input.details) {
    object(input.details);
    out.details = {};
    for (const [key, max] of Object.entries(DETAIL_KEYS))
      if (key in input.details)
        out.details[key] = text(input.details[key], max);
    for (const k of [
      "openToWork",
      "openToInternship",
      "collaboration",
      "remote",
      "coverSelected",
      "showDeveloperId",
      "showQrCode",
      "allowResumeDownload",
      "shareInProgressLearning",
      "isMinor",
    ])
      if (k in input.details) out.details[k] = bool(input.details[k]);
    if (
      out.details.graduationYear &&
      !/^(19|20|21)\d{2}$/.test(out.details.graduationYear)
    )
      throw invalid("Invalid graduation year.");
    if (
      out.details.experienceYears &&
      !/^\d{1,2}(\.\d)?$/.test(out.details.experienceYears)
    )
      throw invalid("Invalid experience years.");
  }
  if (input.privacy) {
    object(input.privacy);
    out.privacy = {};
    for (const k of SECTIONS)
      if (k in input.privacy)
        out.privacy[k] = choice(input.privacy[k], VISIBILITY);
  }
  if (input.links) {
    object(input.links);
    out.links = {};
    for (const k of LINK_KEYS)
      if (k in input.links) out.links[k] = url(input.links[k]);
    if (input.links.custom) {
      if (!Array.isArray(input.links.custom) || input.links.custom.length > 5)
        throw invalid("At most five custom links.");
      out.links.custom = input.links.custom.map((x) => ({
        label: text(x.label, 40, true),
        url: url(x.url),
      }));
    }
  }
  if (input.pins) {
    object(input.pins);
    out.pins = {};
    for (const k of ["projects", "badges", "achievements", "certificates"]) {
      if (input.pins[k]) {
        if (!Array.isArray(input.pins[k]) || input.pins[k].length > 6)
          throw invalid("At most six pinned items.");
        out.pins[k] = [
          ...new Set(input.pins[k].map((x) => text(x, 120, true))),
        ];
      }
    }
  }
  return out;
}
function skill(input) {
  object(input);
  return {
    name: text(input.name, 60, true).toLowerCase(),
    category: choice(input.category, CATEGORIES),
    proficiency: choice(input.proficiency || "Beginner", PROFICIENCIES),
    pinned: bool(input.pinned ?? false),
  };
}
function entry(kind, input) {
  object(input);
  const limits =
    kind === "education"
      ? {
          institution: 160,
          degree: 120,
          field: 120,
          startYear: 4,
          endYear: 4,
          grade: 30,
          description: 1500,
          achievements: 1000,
        }
      : kind === "experience"
        ? {
            organization: 160,
            designation: 120,
            type: 40,
            location: 100,
            startDate: 10,
            endDate: 10,
            description: 2000,
            skills: 250,
          }
        : kind === "external-certificate"
          ? {
              title: 160,
              issuer: 160,
              credentialId: 120,
              issueDate: 10,
              url: 500,
            }
          : null;
  if (!limits) throw invalid("Unknown profile entry type.");
  const out = {};
  for (const [k, max] of Object.entries(limits))
    if (k in input) out[k] = k === "url" ? url(input[k]) : text(input[k], max);
  if (kind === "education") {
    text(out.institution, 160, true);
    text(out.degree, 120, true);
    for (const k of ["startYear", "endYear"])
      if (out[k] && !/^(19|20|21)\d{2}$/.test(out[k]))
        throw invalid("Invalid year.");
    if (out.endYear && out.startYear && out.endYear < out.startYear)
      throw invalid("End year must follow start year.");
  }
  if (kind === "experience") {
    text(out.organization, 160, true);
    text(out.designation, 120, true);
    for (const k of ["startDate", "endDate"]) if (out[k]) date(out[k]);
    if (out.startDate && out.endDate && out.endDate < out.startDate)
      throw invalid("End date must follow start date.");
  }
  if (kind === "external-certificate") {
    text(out.title, 160, true);
    text(out.issuer, 160, true);
    if (out.issueDate) date(out.issueDate);
  }
  out.current = bool(input.current ?? false);
  return out;
}
function goal(input) {
  object(input);
  const target = Number(input.target);
  if (!Number.isInteger(target) || target < 1 || target > 1000000)
    throw invalid("Goal target must be between 1 and 1,000,000.");
  const d = date(input.deadline ?? null);
  return {
    title: text(input.title, 120, true),
    metric: choice(input.metric, [
      "xp",
      "problems",
      "projects",
      "lessons",
      "certificates",
      "activeDays",
    ]),
    target,
    deadline: d ? new Date(d + "T23:59:59Z") : null,
  };
}
function account(input) {
  object(input);
  const out = {};
  if ("fullName" in input) {
    out.fullName = text(input.fullName, 70, true);
    if (out.fullName.length < 2)
      throw invalid("Name must contain at least two characters.");
  }
  if ("bio" in input) out.bio = text(input.bio, 500);
  if ("location" in input) out.location = text(input.location, 70);
  if ("avatarUrl" in input) out.avatarUrl = url(input.avatarUrl);
  if ("username" in input) {
    const u = text(input.username, 30, true).toLowerCase();
    if (!/^[a-z0-9_-]{3,30}$/.test(u))
      throw invalid(
        "Username must have 3–30 letters, numbers, hyphens or underscores.",
      );
    out.username = u;
  }
  return out;
}
module.exports = {
  VISIBILITY,
  SECTIONS,
  CATEGORIES,
  PROFICIENCIES,
  LINK_KEYS,
  DETAIL_KEYS,
  invalid,
  object,
  text,
  url,
  date,
  choice,
  bool,
  profile,
  skill,
  entry,
  goal,
  account,
};
