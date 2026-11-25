const { PDFDocument, rgb } = require("pdf-lib");
const QRCode = require("qrcode");
const store = require("./store");
const progress = require("./progress");
const { profilePrisma } = require("./prisma");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function origin() {
  const url = process.env.PROFILE_PUBLIC_ORIGIN || "https://www.devharbour.in";
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol))
    throw Error("Invalid public origin");
  return parsed.origin;
}
const RESUME_SECTIONS = [
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "certificates",
  "links",
];
async function resumeData(user) {
  const p = await store.getProfile(user.id);
  return {
    name: user.full_name,
    headline: p.headline,
    summary: user.bio || "",
    location: [p.city, p.state, p.country].filter(Boolean).join(", "),
    links: p.links,
    skills: await store.skills(user.id),
    entries: (await store.entries(user.id)).filter((x) =>
      ["education", "experience", "external-certificate"].includes(x.kind),
    ),
    projects: await require("../db").getUserProjects(user.id, "approved"),
    certificates: await progress.certificateList(user),
  };
}
async function pdf(
  user,
  {
    kind = "resume",
    summary,
    snapshot,
    template = "ats",
    sections = RESUME_SECTIONS,
  } = {},
) {
  const data = snapshot || (await resumeData(user)),
    document = await PDFDocument.create();
  document.registerFontkit(require("@pdf-lib/fontkit"));
  const font = await document.embedFont(
    require("node:fs").readFileSync(
      require("node:path").resolve(
        __dirname,
        "../../assets/fonts/NotoSansDevanagari.ttf",
      ),
    ),
  );
  let page, y;
  const addPage = () => {
    page = document.addPage([595, 842]);
    y = 794;
  };
  addPage();
  function line(text, size = 11) {
    for (const paragraph of String(text || "").split("\n")) {
      let buffer = "";
      for (const word of paragraph.split(/\s+/)) {
        const next = buffer ? buffer + " " + word : word;
        if (font.widthOfTextAtSize(next, size) > 480 && buffer) {
          draw(buffer, size);
          buffer = word;
        } else buffer = next;
      }
      if (buffer) draw(buffer, size);
    }
  }
  function draw(text, size) {
    if (y < 55) addPage();
    page.drawText(text, {
      x: 52,
      y,
      size,
      font,
      color: rgb(0.16, 0.13, 0.23),
      maxWidth: 490,
    });
    y -= size * 1.65;
  }
  function heading(text) {
    y -= 12;
    line(text, 14);
  }
  if (template === "minimal")
    page.drawRectangle({
      x: 0,
      y: 740,
      width: 595,
      height: 102,
      color: rgb(0.95, 0.92, 0.98),
    });
  line("DEV HARBOUR", 12);
  line(data.name, 24);
  line(data.headline, 12);
  line(data.location);
  if (kind === "id") {
    heading("Platform developer card");
    line("@" + user.username);
    line("Developer ID: " + user.id);
    const stats = await progress.overview(user);
    line("Level " + stats.level + " · " + stats.title);
    line("Member since: " + String(user.created_at).slice(0, 10));
    line(
      "A Dev Harbour community identifier. Not a government or official identity document.",
    );
    const png = await QRCode.toBuffer(
      origin() + "/u/" + encodeURIComponent(user.username),
      { width: 150 },
    );
    page.drawImage(await document.embedPng(png), {
      x: 52,
      y: Math.max(60, y - 160),
      width: 130,
      height: 130,
    });
    return document.save();
  }
  for (const section of sections) {
    if (section === "summary") {
      heading("Professional summary");
      line(summary === undefined ? data.summary : summary);
    }
    if (section === "skills" && data.skills.length) {
      heading("Skills (self-reported)");
      line(data.skills.map((x) => x.name + " — " + x.proficiency).join(", "));
    }
    if (["experience", "education"].includes(section)) {
      const entries = data.entries.filter((x) => x.kind === section);
      if (entries.length)
        heading(section === "experience" ? "Experience" : "Education");
      for (const entry of entries) {
        const d = entry.data;
        line(
          [d.designation || d.degree, d.organization || d.institution]
            .filter(Boolean)
            .join(" | "),
          12,
        );
        line(
          [
            d.startDate || d.startYear,
            d.current ? "Present" : d.endDate || d.endYear,
          ]
            .filter(Boolean)
            .join(" — "),
        );
        line(d.description);
      }
    }
    if (section === "projects") {
      if (data.projects.length) heading("Projects");
      for (const project of data.projects) {
        line(project.title, 12);
        line(project.description);
        line(project.repoUrl || project.repo_url);
      }
    }
    if (section === "certificates") {
      if (data.certificates.length) heading("Recorded certificates");
      for (const c of data.certificates)
        line(c.title + " · " + c.id + " · " + c.issueDate);
    }
    if (section === "links") {
      const links = [
        ...Object.entries(data.links).filter(
          ([, v]) => typeof v === "string" && v,
        ),
        ...(data.links.custom || []).map((x) => [x.label, x.url]),
      ];
      if (links.length) heading("Links");
      for (const [key, value] of links) line(key + ": " + value);
    }
  }
  return document.save();
}
async function publicHtml(user) {
  const d = await store.publicData(user, null);
  const stats = d.sections.statistics ? await progress.overview(user) : null;
  const projects = d.sections.projects
    ? await require("../db").getUserProjects(user.id, "approved")
    : [];
  const url = origin() + "/u/" + encodeURIComponent(user.username);
  const credentials = d.sections.certificates
    ? (await progress.certificateList(user)).filter((x) =>
        (d.profile.pins.certificates || []).includes(x.id),
      )
    : [];
  const events = d.sections.hackathons ? await progress.eventHistory(user) : [];
  const calendar = d.sections.activity
    ? await progress.activity(user.id, "rolling")
    : null;
  const extras =
    (credentials.length
      ? `<section><h2>Shared credentials</h2>${credentials.map((x) => `<p><strong>${esc(x.title)}</strong> · ${esc(x.type)} · ${esc(x.status)}<br><a href="${esc(x.verificationUrl)}">Verify ${esc(x.id)}</a></p>`).join("")}</section>`
      : "") +
    (calendar
      ? `<section><h2>Recorded activity</h2><p>${calendar.total} contributions · ${calendar.activeDays} active days</p><p>${esc(calendar.definition)}</p><div style="display:flex;flex-wrap:wrap;gap:4px">${calendar.days.map((x) => `<span title="${esc(x.date)}: ${x.count} contributions" style="background:#e8dafa;padding:4px 7px;border-radius:4px;font-size:12px">${esc(x.date)} · ${x.count}</span>`).join("")}</div></section>`
      : "") +
    (events.length
      ? `<section><h2>Event registrations</h2>${events.map((x) => `<p>${esc(x.event)} · ${esc(x.team || "Individual")} · ${esc(String(x.date).slice(0, 10))}</p>`).join("")}<p>Registration records do not imply a win or completed participation.</p></section>`
      : "");
  const qr = await QRCode.toString(url, { type: "svg", width: 110 });
  const cards = (title, list, render) =>
    list.length
      ? `<section><h2>${title}</h2>${list.map(render).join("")}</section>`
      : "";
  const body = `<header><a href="/">DEV HARBOUR</a><a href="/guides/">Guides</a><a href="/projects">Projects</a><a href="/profile">My profile</a></header><main><div class="banner"></div><div class="identity"><span class="avatar">${esc(d.user.fullName[0])}</span><h1>${esc(d.user.fullName)}</h1><p>@${esc(d.user.username)}</p><h2>${esc(d.user.headline)}</h2><p>${esc([d.user.city, d.user.country].filter(Boolean).join(", "))}</p><span>${d.followers} followers · ${d.following} following</span></div>${d.sections.about ? `<section><h2>About</h2><p>${esc(d.bio)}</p></section>` : ""}${stats ? `<section><h2>Recorded progress</h2><p>${stats.totalXp} XP · Level ${stats.level} · ${esc(stats.title)} · ${stats.problems} problems solved · ${stats.currentStreak} day streak</p></section>` : ""}${cards("Skills", d.skills, (x) => `<p><strong>${esc(x.name)}</strong> · ${esc(x.proficiency)} <small>Self-reported</small></p>`)}${cards("Education", d.education, (x) => `<p><strong>${esc(x.data.institution)}</strong> · ${esc(x.data.degree)}</p><p>${esc(x.data.description)}</p>`)}${cards("Experience", d.experience, (x) => `<p><strong>${esc(x.data.designation)}</strong> · ${esc(x.data.organization)}</p><p>${esc(x.data.description)}</p>`)}${cards("Projects", projects, (x) => `<article><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></article>`)}${
    d.sections.links
      ? `<section><h2>Links</h2>${Object.entries(d.links)
          .filter(([, v]) => typeof v === "string" && /^https:\/\//.test(v))
          .map(
            ([key, value]) =>
              `<a rel="noopener noreferrer" href="${esc(value)}">${esc(key)}</a> `,
          )
          .join("")}</section>`
      : ""
  }${extras}<section><h2>Connect</h2><p>Sign in to Dev Harbour to follow or request collaboration.</p><a href="/profile?developer=${encodeURIComponent(user.username)}">View in Dev Harbour</a>${qr}</section></main><footer>Published by @${esc(user.username)} on Dev Harbour. Personal profile information is self-reported unless explicitly marked platform-recorded.</footer>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(user.full_name)} (@${esc(user.username)}) | Dev Harbour</title><meta name="description" content="${esc(d.user.headline || "Developer portfolio on Dev Harbour")}"><meta property="og:title" content="${esc(user.full_name)} | Dev Harbour"><meta property="og:description" content="${esc(d.user.headline)}"><meta property="og:url" content="${esc(url)}"><meta property="og:type" content="profile"><meta property="og:image" content="${origin()}/assets/devharbour-logo.png"><link rel="canonical" href="${esc(url)}"><link rel="icon" href="/favicon.ico"><style>body{margin:0;background:#faf8ff;color:#292239;font:16px/1.75 system-ui}header,main,footer{max-width:1050px;margin:auto;padding:24px}header{display:flex;gap:24px;flex-wrap:wrap}a{color:#7151a8}main{padding-top:0}.banner{height:150px;background:linear-gradient(100deg,#e8d9fc,#f5effe);border-radius:16px}.identity{padding:0 30px 25px}.avatar{display:grid;place-items:center;width:90px;height:90px;background:#9476bd;color:white;font-size:36px;border:5px solid #fff;border-radius:50%;margin-top:-40px;position:relative}h1{margin-bottom:0}h2{font-size:20px}section{padding:24px 30px;margin:16px 0;background:#fff;border:1px solid #e7dff1;border-radius:12px}p{white-space:pre-wrap;overflow-wrap:anywhere}svg{display:block;margin-top:16px}small{color:#766a86}footer{font-size:13px}</style></head><body>${body}</body></html>`;
}
function score(stats) {
  const categories = [
    ["Problem-solving", 25, stats.problems, 100],
    ["Projects", 20, stats.projects, 10],
    ["Learning", 15, stats.lessons, 50],
    ["Consistency", 15, stats.activeDays, 100],
    ["Events", 10, stats.hackathons, 5],
  ];
  return {
    value: Math.round(
      categories.reduce(
        (n, [, weight, actual, target]) =>
          n + weight * Math.min(1, actual / target),
        0,
      ),
    ),
    outOf: 100,
    measuredWeight: 85,
    categories: categories.map(([name, weight, actual, target]) => ({
      name,
      weight,
      actual,
      target,
      points: Math.round(weight * Math.min(1, actual / target) * 10) / 10,
    })),
    unavailable: [
      "Verified skill assessments (10%)",
      "Moderated community contributions (5%)",
    ],
    methodology:
      "Learning activity indicator: capped recorded counts with fixed targets. Unmeasured categories contribute no points. Self-reported skill levels never increase this score. Not an assessment of hiring eligibility or professional competence.",
  };
}
module.exports = {
  pdf,
  resumeData,
  publicHtml,
  origin,
  score,
  esc,
  RESUME_SECTIONS,
};
