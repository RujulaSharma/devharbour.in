/* Advanced profile UI. Inert until the backend's explicit rollout flag is enabled. */
(async () => {
  const root = document.getElementById("v-profile");
  if (!root) return;
  let config;
  try {
    const r = await fetch("/api/profile/config", { cache: "no-store" });
    config = await r.json();
    if (!r.ok || !config.enabled) return;
  } catch {
    return;
  }
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/assets/profile-ecosystem.css";
  document.head.appendChild(css);
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const $ = (id) => document.getElementById(id);
  const tabs = [
    "Overview",
    "Coding",
    "Projects",
    "Hackathons",
    "Contests",
    "Learning",
    "Achievements",
    "Certificates",
    "Education & Experience",
    "Community",
    "Activity",
    "Career",
    "Insights",
  ];
  const slug = (s) => s.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
  let data = null,
    stats = null,
    loading = false,
    tab = new URLSearchParams(location.search).get("tab") || "overview",
    cache = new Map(),
    ownerId = null;
  if (!tabs.some((x) => slug(x) === tab)) tab = "overview";
  const btn = (label, action, id = "", extra = "") =>
    `<button type="button" class="eco-btn ${extra}" data-eco="${action}" data-id="${esc(id)}">${label}</button>`;
  const empty = (s) => `<div class="eco-empty">${esc(s)}</div>`;
  const metric = (label, n) =>
    `<div class="eco-metric"><strong>${n === null || n === undefined ? "—" : esc(Number(n).toLocaleString())}</strong><span>${esc(label)}</span></div>`;
  const panel = (title, body, action = "") =>
    `<section class="eco-panel"><div class="eco-section-title"><h3>${title}</h3>${action}</div>${body}</section>`;
  const opts = (items, selected) =>
    items
      .map(
        (x) =>
          `<option value="${esc(x)}" ${x === selected ? "selected" : ""}>${esc(x)}</option>`,
      )
      .join("");
  const field = (name, label, value = "", type = "text", max = 160) =>
    `<div class="eco-field"><label for="eco-input-${name}">${esc(label)}</label><input id="eco-input-${name}" name="${name}" type="${type}" maxlength="${max}" value="${esc(value)}"></div>`;
  const textarea = (name, label, value = "", max = 500) =>
    `<div class="eco-field wide"><label for="eco-input-${name}">${esc(label)}</label><textarea id="eco-input-${name}" name="${name}" maxlength="${max}">${esc(value)}</textarea></div>`;
  const select = (name, label, items, value) =>
    `<div class="eco-field"><label for="eco-input-${name}">${esc(label)}</label><select id="eco-input-${name}" name="${name}">${opts(items, value)}</select></div>`;
  const check = (name, label, value) =>
    `<label class="eco-check"><input name="${name}" type="checkbox" ${value ? "checked" : ""}>${esc(label)}</label>`;
  async function api(path, options = {}) {
    const r = await fetch("/api/profile" + path, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
      cache: "no-store",
    });
    const result = await r.json().catch(() => ({}));
    if (!r.ok)
      throw Error(result.error || "Profile request failed. Please try again.");
    return result;
  }
  async function post(path, body, method = "POST") {
    return api(path, { method, body: JSON.stringify(body) });
  }
  const status = (message, error = false) => {
    const el = $("eco-status");
    if (el) {
      el.textContent = message;
      el.className = "eco-status" + (error ? " error" : "");
    }
  };
  const publicUrl = () =>
    location.origin + "/u/" + encodeURIComponent(data.user.username);
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      status("Copied to clipboard.");
    } catch {
      dialog(
        "Copy link",
        `<input aria-label="Profile link" value="${esc(value)}" readonly style="width:100%;padding:12px">`,
      );
    }
  }
  function dialog(title, body, onSubmit) {
    let d = $("eco-dialog");
    if (d) d.remove();
    d = document.createElement("dialog");
    d.id = "eco-dialog";
    d.className = "eco eco-dialog";
    d.innerHTML = `<div class="eco-dialog-head"><h2>${esc(title)}</h2><button type="button" class="eco-btn small" data-dialog-close aria-label="Close dialog">✕</button></div><div class="eco-dialog-body">${onSubmit ? '<form id="eco-dialog-form">' : ""}${body}${onSubmit ? '<p id="eco-dialog-status" class="eco-status" role="status"></p><div class="eco-actions" style="justify-content:flex-end"><button type="button" class="eco-btn" data-dialog-close>Cancel</button><button type="submit" class="eco-btn primary">Save changes</button></div></form>' : ""}</div>`;
    document.body.appendChild(d);
    d.querySelectorAll("[data-dialog-close]").forEach(
      (b) => (b.onclick = () => d.close()),
    );
    if (onSubmit)
      d.querySelector("form").onsubmit = async (e) => {
        e.preventDefault();
        const submit = e.target.querySelector("[type=submit]");
        submit.disabled = true;
        const out = d.querySelector("#eco-dialog-status");
        out.textContent = "Saving…";
        try {
          await onSubmit(new FormData(e.target));
          d.close();
          await load(true);
          status("Changes saved.");
        } catch (error) {
          out.textContent = error.message;
          out.classList.add("error");
        } finally {
          submit.disabled = false;
        }
      };
    d.showModal();
    return d;
  }
  async function load(force = false) {
    if (!root.classList.contains("on") || loading) return;
    if (!currentUser) {
      data = null;
      ownerId = null;
      root.innerHTML =
        '<div class="eco">' +
        panel(
          "Your developer profile",
          empty("Sign in to view and edit your developer profile.") +
            btn("Sign in / Log in", "signin"),
        ) +
        "</div>";
      return;
    }
    if (!force && ownerId === currentUser.id && data) return;
    loading = true;
    root.innerHTML =
      '<div class="eco"><div class="eco-skeleton"></div><div class="eco-skeleton" style="margin-top:20px"></div></div>';
    try {
      const id = currentUser.id;
      const result = await api("/me");
      if (currentUser?.id !== id) return;
      data = result;
      ownerId = id;
      cache = new Map();
      stats = null;
      currentUser = { ...currentUser, ...data.user };
      localStorage.setItem("dh_current_user", JSON.stringify(currentUser));
      localStorage.setItem("dh-current-user", JSON.stringify(currentUser));
      if (typeof updateAuthUI === "function") updateAuthUI();
      shell();
      await loadTab();
      api("/me/progress/overview")
        .then((x) => {
          if (ownerId !== id) return;
          stats = x.data;
          renderStats();
          if (tab === "overview") loadTab();
        })
        .catch((e) => status(e.message, true));
      loadHeaderMedia();
    } catch (error) {
      root.innerHTML =
        '<div class="eco">' +
        panel(
          "Profile temporarily unavailable",
          empty(error.message) + btn("Try again", "reload"),
        ) +
        "</div>";
    } finally {
      loading = false;
    }
  }
  function completion() {
    const p = data.profile,
      u = data.user;
    return [
      [
        "Profile picture",
        !!u.avatarUrl || data.uploads.some((x) => x.kind === "avatar"),
      ],
      ["Cover design", p.cover === "custom" || !!p.details.coverSelected],
      ["Bio", !!u.bio],
      ["Professional headline", !!p.headline],
      ["Location", !!(p.city || p.country || u.location)],
      ["Education", data.entries.some((x) => x.kind === "education")],
      ["Technical skills", data.skills.length > 0],
      [
        "Social links",
        Object.values(p.links || {}).some((x) =>
          Array.isArray(x) ? x.length > 0 : !!x,
        ),
      ],
      ["First approved project", (stats?.projects || 0) > 0],
      ["Resume", data.uploads.some((x) => x.kind === "resume")],
    ];
  }
  function shell() {
    const u = data.user,
      p = data.profile,
      d = p.details || {};
    const progress = completion(),
      percent = Math.round(
        (progress.filter((x) => x[1]).length / progress.length) * 100,
      );
    root.innerHTML = `<div class="eco"><div class="eco-topline"><div><h1>Developer profile</h1><p>Your work, learning, and the next thing you’ll build.</p></div><span class="eco-tag">${esc(p.visibility)} profile</span></div><section class="eco-header"><div class="eco-cover ${esc(p.cover)}" id="eco-cover"><div class="eco-cover-actions">${btn("Cover design", "cover")}${btn("Upload cover", "upload", "cover")}</div></div><div class="eco-person"><div><div class="eco-avatar" id="eco-avatar">${esc((u.fullName || u.username)[0])}</div><h2>${esc(u.fullName)}</h2><div class="eco-handle">@${esc(u.username)} ${u.emailVerified ? "· Verified email" : ""}</div><p class="eco-headline">${esc(p.headline || "Add a headline to tell your story.")}</p><p class="eco-muted">${esc([p.city || u.location, p.country, p.college || p.company].filter(Boolean).join(" · "))}</p><span class="eco-tag" id="eco-level-title">Developer</span>${d.openToWork ? '<span class="eco-tag">Open to work</span>' : ""}${d.openToInternship ? '<span class="eco-tag">Open to internships</span>' : ""}${d.collaboration ? '<span class="eco-tag">Available for collaboration</span>' : ""}<p class="eco-muted">${data.connections.followers} followers · ${data.connections.following} following</p></div><div class="eco-actions">${btn("Edit profile", "edit", "", "primary")}${btn("Profile photo", "upload", "avatar")}${btn("Manage files", "uploads")}${btn("Share profile", "share")}${btn("Public preview ↗", "public")}${btn("Resume PDF ↓", "download", "resume")}${btn("Privacy", "privacy")}${btn("Notifications", "notifications")}</div></div></section><div class="eco-statrow" id="eco-stats">${["XP", "Level", "Streak", "Global rank", "Problems", "Badges"].map((x) => `<div class="eco-stat"><strong>—</strong><span>${x}</span></div>`).join("")}</div><p class="eco-status" id="eco-status" role="status" aria-live="polite"></p><div class="eco-layout"><aside class="eco-side">${panel("About me", `<p>${esc(u.bio || "Add a short bio about what you enjoy building.")}</p><p class="eco-muted">${esc(u.email)}<br>Email is private and visible only to you.</p>`, btn("Edit", "edit", "", "small"))}${panel(
      "Social links",
      `<div class="eco-linklist">${
        Object.entries(p.links || {})
          .filter(([, v]) => typeof v === "string" && /^https:\/\//.test(v))
          .map(
            ([k, v]) =>
              `<a href="${esc(v)}" target="_blank" rel="noopener noreferrer">${esc(k)} ↗</a>`,
          )
          .join("") || '<p class="eco-muted">No links added yet.</p>'
      }</div>`,
      btn("Edit", "edit", "", "small"),
    )}${panel(
      "Top skills",
      data.skills
        .filter((x) => x.pinned)
        .slice(0, 6)
        .map((x) => `<span class="eco-tag">${esc(x.name)}</span>`)
        .join("") ||
        '<p class="eco-muted">Pin skills from the skills section.</p>',
      btn("Manage", "skills", "", "small"),
    )}${panel("Profile completion", `<strong>${percent}% complete</strong><div class="eco-progress"><i style="width:${percent}%"></i></div><ul class="eco-completion">${progress.map(([name, done]) => `<li class="${done ? "done" : ""}"><span>${done ? "✓" : "○"}</span>${name}</li>`).join("")}</ul>`, btn("Complete", "edit", "", "small"))}${panel("Developer ID", `<div class="eco-id"><span class="eco-tag">DEV HARBOUR</span><strong>${esc(u.fullName)}</strong><span>@${esc(u.username)}</span><p class="eco-muted">${esc(u.id)}<br>Member since ${esc(String(u.memberSince || "").slice(0, 10))}</p><small>Community identifier, not an official ID.</small></div><div class="eco-actions" style="margin-top:12px">${btn("PDF ↓", "download", "id")}${btn("PNG ↓", "id-png")}</div>`)}</aside><div class="eco-main"><nav class="eco-tabs" role="tablist" aria-label="Profile sections">${tabs.map((x) => `<button type="button" role="tab" aria-selected="${slug(x) === tab}" data-eco="tab" data-id="${slug(x)}">${esc(x)}</button>`).join("")}</nav><div id="eco-content" role="tabpanel" class="eco-stack"></div></div></div><dialog id="eco-unused" hidden></dialog></div>`;
    if (!config.storage)
      root.querySelectorAll("[data-eco=upload]").forEach((b) => {
        b.disabled = true;
        b.title = "Private Supabase Storage is not configured.";
      });
  }
  function renderStats() {
    if (!stats || !$("eco-stats")) return;
    $("eco-stats").innerHTML = [
      ["XP", stats.totalXp],
      ["Level", stats.level],
      ["Day streak", stats.currentStreak],
      ["Global rank", stats.globalRank],
      ["Problems", stats.problems],
      ["Badges", stats.badges],
    ]
      .map(
        ([label, value]) =>
          `<div class="eco-stat"><strong>${value === null ? "—" : esc(Number(value).toLocaleString())}</strong><span>${label}</span></div>`,
      )
      .join("");
    $("eco-level-title").textContent =
      "Level " + stats.level + " · " + stats.title;
  }
  async function module(name) {
    if (!cache.has(name))
      cache.set(name, (await api("/me/progress/" + name)).data);
    return cache.get(name);
  }
  async function loadHeaderMedia() {
    if (
      !data.uploads.some((x) => x.kind === "avatar") &&
      /^https:\/\//.test(data.user.avatarUrl || "")
    ) {
      const image = document.createElement("img");
      image.alt = "";
      image.referrerPolicy = "no-referrer";
      image.src = data.user.avatarUrl;
      $("eco-avatar")?.replaceChildren(image);
    }
    for (const kind of ["avatar", "cover"]) {
      const file = data.uploads.find((x) => x.kind === kind);
      if (!file) continue;
      try {
        const r = await api("/media/" + file.id);
        const target = $(kind === "avatar" ? "eco-avatar" : "eco-cover");
        if (!target) return;
        if (kind === "avatar") {
          const image = document.createElement("img");
          image.alt = "";
          image.src = r.url;
          target.replaceChildren(image);
        } else if (data.profile.cover === "custom")
          target.style.backgroundImage = "url(" + JSON.stringify(r.url) + ")";
      } catch {
        /* Preserve initials/predefined cover when media is unavailable. */
      }
    }
  }
  async function loadTab() {
    const target = $("eco-content");
    if (!target) return;
    const active = tab;
    target.innerHTML =
      '<div class="eco-skeleton"></div><div class="eco-skeleton"></div>';
    try {
      let html = "";
      if (tab === "overview") {
        const a = await api("/me/activity");
        const goals = await api("/me/goals");
        html =
          panel(
            "Coding & learning activity",
            heatmap(a),
            btn("View activity", "tab", "activity", "small"),
          ) +
          panel(
            "XP progression",
            stats
              ? `<div class="eco-metricgrid">${metric("Total XP", stats.totalXp)}${metric("Next level at", stats.nextXp)}${metric("XP to next level", stats.xpToNext)}</div><div class="eco-progress"><i style="width:${stats.levelPercent}%"></i></div><p class="eco-muted">${stats.title} · Levels follow the existing platform XP thresholds.</p>`
              : empty("Loading recorded progress…"),
          ) +
          panel(
            "Developer goals",
            goalCards(goals.goals),
            btn("Add goal", "goal", "", "small"),
          ) +
          panel(
            "Technical skills",
            skillCards(),
            btn("Add skill", "skill", "", "small"),
          );
      } else if (tab === "coding") {
        const c = await module("coding");
        html =
          panel(
            "Problem-solving",
            `<div class="eco-metricgrid">${metric("Problems solved", stats?.problems)}${metric("Accepted submissions", stats?.accepted)}${metric("Acceptance rate (%)", stats?.acceptanceRate)}</div><p class="eco-notice">${esc(c.notice)}</p>`,
          ) +
          panel(
            "Difficulty",
            c.difficulty.length
              ? c.difficulty
                  .map(
                    (x) =>
                      `<p>${esc(x.difficulty)} · ${esc(x.solved)} solved</p>`,
                  )
                  .join("")
              : empty("No recorded accepted submissions yet."),
          ) +
          panel(
            "Topics",
            c.topics.length
              ? c.topics
                  .map(
                    (x) =>
                      `<span class="eco-tag">${esc(x.topic)} · ${esc(x.solved)}</span>`,
                  )
                  .join("")
              : empty(
                  "Topic progress appears after recorded accepted submissions.",
                ),
          ) +
          panel(
            "Languages",
            c.languages.length
              ? c.languages
                  .map(
                    (x) =>
                      `<p>${esc(x.language)} · ${esc(x.submissions)} submissions</p>`,
                  )
                  .join("")
              : empty("No submission language history yet."),
          ) +
          panel(
            "Recent submissions",
            c.recent.length
              ? timelineCards(
                  c.recent.map((x) => ({
                    title: x.title + " · " + x.status,
                    date: x.created_at,
                    type: x.language,
                  })),
                )
              : empty("Your recorded submissions will appear here."),
          );
      } else if (tab === "projects") {
        const list = await module("projects");
        html = panel(
          "Project showcase",
          list.length
            ? `<div class="eco-cardgrid">${list.map((p) => `<article class="eco-card"><h4>${esc(p.title)}</h4><p>${esc(p.description)}</p><div>${(p.techStack || []).map((x) => `<span class="eco-tag">${esc(x)}</span>`).join("")}</div><div class="eco-actions">${btn("View project", "project", p.id, "small")}${btn((data.profile.pins.projects || []).includes(p.id) ? "Unpin" : "Pin", "pin-project", p.id, "small")}${btn("Share", "share-project", p.id, "small")}</div></article>`).join("")}</div>`
            : empty(
                "No approved projects yet. Publish through the existing Project Gallery.",
              ),
          btn("Open Project Gallery ↗", "projects", "", "small"),
        );
      } else if (tab === "hackathons") {
        const events = await module("hackathons");
        html =
          panel(
            "Hackathon history",
            events.length
              ? timelineCards(
                  events.map((x) => ({
                    title: x.event,
                    date: x.date,
                    type: [
                      x.status,
                      x.team ? "Team: " + x.team : "Individual",
                      x.eligible
                        ? "Eligible registration"
                        : "Registration recorded",
                    ].join(" · "),
                  })),
                )
              : empty(
                  "No event registrations are recorded for your account email.",
                ),
          ) +
          panel(
            "Official results",
            empty(
              "Ranks, winnings, submission state and prize information are unavailable where the event registry has not recorded them.",
            ),
          );
      } else if (tab === "contests") {
        html = panel(
          "Contest profile",
          empty(
            "Dev Harbour does not yet record contest ratings or competition score history. Your rating and best performance are unavailable. No rating is inferred from XP.",
          ),
        );
      } else if (tab === "learning") {
        const list = await module("learning");
        html =
          panel(
            "Course progress",
            list.length
              ? list
                  .map((c) => {
                    const total = +c.total_lessons,
                      done = +c.completed_lessons,
                      percent = total ? Math.round((done / total) * 100) : 0;
                    return `<article class="eco-card" style="margin:12px 0"><h4>${esc(c.title)}</h4><p>${done} / ${total} lessons · ${Math.round(+c.reading_seconds / 60)} recorded reading minutes</p><div class="eco-progress"><i style="width:${percent}%"></i></div>${btn("Continue learning ↗", "learning", "", "small")}</article>`;
                  })
                  .join("")
              : empty("No course lesson records are available."),
          ) +
          panel(
            "Career roadmaps",
            empty(
              "Learning tracks are available, but verified milestone progress and remaining-time estimates are not recorded yet.",
            ),
          ) +
          panel(
            "Private workspace",
            workspaceCards(await module("workspace")),
            btn("Continue building ↗", "workspace", "", "small"),
          );
      } else if (tab === "achievements") {
        const badges = await module("achievements");
        html = panel(
          "Earned achievements",
          badges.length
            ? `<div class="eco-cardgrid">${badges.map((b) => `<article class="eco-card"><span class="eco-tag">Platform awarded</span><h4>${esc(b.title)}</h4><p>${esc(b.description)}</p><p>Earned ${esc(String(b.unlocked_at || "").slice(0, 10))}</p></article>`).join("")}</div>`
            : empty(
                "No platform-awarded badges yet. Badges are awarded by the existing backend rules, never by editing this profile.",
              ),
        );
      } else if (tab === "certificates") {
        const certs = await module("certificates");
        html =
          panel(
            "Verified credentials",
            certs.length
              ? `<div class="eco-cardgrid">${certs.map((c) => `<article class="eco-card"><span class="eco-tag">${esc(c.status)}</span><h4>${esc(c.title)}</h4><p>${esc(c.type)} · ${esc(c.issueDate)}</p><p>${esc(c.id)}</p><div class="eco-actions">${btn("View / Download", "certificates", "", "small")}${btn("Copy verification link", "copy-certificate", c.verificationUrl, "small")}${btn((data.profile.pins.certificates || []).includes(c.id) ? "Unpin from public profile" : "Pin to public profile", "pin-certificate", c.id, "small")}</div></article>`).join("")}</div>`
              : empty(
                  "Your issued certificates will appear here. Certificate eligibility and download authorization remain unchanged.",
                ),
          ) +
          entrySection(
            "external-certificate",
            "External certificates",
            "Self-reported. Uploading a document does not verify the qualification.",
          );
      } else if (tab === "education-experience") {
        html =
          entrySection(
            "education",
            "Education",
            "Education is self-reported.",
          ) +
          entrySection(
            "experience",
            "Experience",
            "Experience is self-reported; include only roles you actually held.",
          );
      } else if (tab === "community") {
        html =
          panel(
            "Connections",
            `<div class="eco-metricgrid">${metric("Followers", data.connections.followers)}${metric("Following", data.connections.following)}</div><div class="eco-actions">${btn("Followers", "connections", "follow")}${btn("Following", "connections", "following")}${btn("Blocked developers", "connections", "block")}</div><p class="eco-muted">Incoming requests</p>` +
              (data.connections.incoming.length
                ? data.connections.incoming
                    .map(
                      (r) =>
                        `<article class="eco-card"><h4>@${esc(r.from.username)} · ${esc(r.kind)}</h4><p>${esc(r.message)}</p><div class="eco-actions">${btn("Accept", "request-accept", r.id, "small")}${btn("Decline", "request-decline", r.id, "small")}</div></article>`,
                    )
                    .join("")
                : empty("No pending connection requests.")),
          ) +
          panel(
            "Discover collaborators",
            '<input class="eco-search" id="eco-discover-search" aria-label="Search developer headlines, colleges or companies" placeholder="Search headlines, colleges, companies…"><div id="eco-developers"></div><p class="eco-muted">Only developers who opted into public discovery appear. Blocked users are excluded.</p>',
          );
        queueMicrotask(() => discover());
      } else if (tab === "activity") {
        const timeline = await api("/me/timeline");
        html =
          panel("Activity calendar", heatmap(await api("/me/activity"))) +
          panel(
            "Recent activity",
            timeline.items.length
              ? `<div id="eco-timeline">${timelineCards(timeline.items)}</div>${timeline.next ? btn("Load more", "timeline-more", timeline.next) : ""}`
              : empty("No recorded contributions yet."),
          );
      } else if (tab === "career") {
        const readiness = await api("/me/readiness");
        html =
          panel(
            "Career preferences",
            `<p>${esc(data.profile.details.targetRole || "Choose a target role in Edit profile.")}</p><p class="eco-muted">Career interests: ${esc(data.profile.details.careerInterests || "Not added")}<br>Preferred roles: ${esc(data.profile.details.preferredRoles || "Not added")}</p>${btn("Edit career preferences", "edit")}`,
          ) +
          panel(
            "Resume builder",
            `<p class="eco-muted">Generate an ATS-friendly PDF from your saved profile, education, experience, approved projects and recorded certificates. Edit the summary before exporting. No experience is invented.</p>${btn("Preview and edit summary", "resume")}${btn("Download saved-profile PDF", "download", "resume")}${btn("Saved resume versions", "resume-versions")}<div class="eco-actions" style="margin-top:12px">${btn("Upload private resume", "upload", "resume")}${btn("Manage uploads", "uploads")}</div>`,
          ) +
          panel(
            "Portfolio generator",
            `<p class="eco-muted">Export the sections you have explicitly made public. Private fields and account email are excluded.</p>${btn("Public preview ↗", "public")}${btn("Download portfolio HTML", "download", "portfolio")}${btn("Export profile data", "download", "data")}`,
          ) +
          panel(
            "Recruitment visibility",
            empty(
              data.profile.recruitment
                ? "You opted into recruitment visibility. Recruiter access remains restricted to authorized accounts."
                : "Recruitment visibility is off. You can explicitly opt in through Edit profile after making your profile public.",
            ),
          ) +
          panel(
            "Career readiness",
            `<p>${readiness.completed} / ${readiness.total} evidence checks</p><p class="eco-muted">${esc(readiness.notice)}</p><ul class="eco-completion">${readiness.checks.map((x) => `<li>${x.done ? "✓" : "○"} ${esc(x.label)}</li>`).join("")}</ul>`,
          );
      } else if (tab === "insights") {
        const score = await api("/me/score"),
          xp = await module("xp");
        html =
          panel(
            "Recorded learning progress",
            `<strong class="eco-score">${score.value}<small style="font-size:16px"> / 100</small></strong><p class="eco-muted">${esc(score.methodology)}</p>${score.categories.map((c) => `<p>${esc(c.name)} · ${c.points} / ${c.weight}</p><div class="eco-progress"><i style="width:${(c.points / c.weight) * 100}%"></i></div>`).join("")}<p class="eco-muted">Not yet measured: ${esc(score.unavailable.join(", "))}</p>`,
          ) +
          panel(
            "XP source breakdown",
            xp.length
              ? xp
                  .map((x) => `<p>${esc(x.source)} · ${esc(x.xp)} XP</p>`)
                  .join("")
              : empty("No XP transactions yet."),
          ) +
          panel("Skill radar · self-reported", radar()) +
          panel(
            "AI developer insights",
            empty(
              "No AI provider is configured. Your profile has not been sent to an external AI service. Automated strengths, skill-gap analysis and resume suggestions are unavailable.",
            ),
          ) +
          panel(
            "Yearly recap",
            `<p class="eco-muted">Review your recorded contributions for a selected year from the activity tab. No missing contest or coding-time records are estimated.</p>${select(
              "recap-year",
              "Year",
              Array.from(
                { length: new Date().getUTCFullYear() - 2019 },
                (_, i) => String(new Date().getUTCFullYear() - i),
              ),
              String(new Date().getUTCFullYear()),
            )}${btn("Create yearly recap", "recap")}`,
          );
      }
      if (tab === active && $("eco-content")) {
        $("eco-content").innerHTML = html;
        $("eco-content")
          .querySelectorAll("[data-eco=upload]")
          .forEach((b) => {
            if (!config.storage) {
              b.disabled = true;
              b.title = "Private storage is not configured.";
            }
          });
        const search = $("eco-discover-search");
        if (search) {
          let timer;
          search.oninput = () => {
            clearTimeout(timer);
            timer = setTimeout(discover, 350);
          };
        }
      }
    } catch (error) {
      if (tab === active)
        target.innerHTML = panel(
          "Unable to load this section",
          empty(error.message) + btn("Try again", "retry-tab"),
        );
    }
  }
  function goalCards(goals) {
    return goals.length
      ? goals
          .map(
            (g) =>
              `<article class="eco-card" style="margin-bottom:12px"><h4>${esc(g.title)}</h4><p>${Math.min(g.progress, g.target)} / ${g.target} ${esc(g.metric)}${g.deadline ? " · Due " + esc(g.deadline.slice(0, 10)) : ""}</p><div class="eco-progress"><i style="width:${Math.min(100, (g.progress / g.target) * 100)}%"></i></div>${btn("Edit", "goal", g.id, "small")}${btn("Delete", "delete-goal", g.id, "small danger")}</article>`,
          )
          .join("")
      : empty(
          "Set a measurable learning goal. Progress is calculated from saved platform activity; creating a goal does not award XP.",
        );
  }
  function heatmap(a) {
    const counts = new Map(a.days.map((x) => [x.date, x.count])),
      start = new Date(a.start + "T00:00:00Z"),
      end = new Date(a.end + "T00:00:00Z");
    let cells = "",
      months = [];
    const offset = start.getUTCDay(),
      weeks = Math.ceil(((end - start) / 86400000 + offset) / 7);
    for (let i = 0; i < offset; i++) cells += "<span></span>";
    for (
      let d = new Date(start), i = 0;
      d < end;
      d.setUTCDate(d.getUTCDate() + 1), i++
    ) {
      const day = d.toISOString().slice(0, 10),
        n = counts.get(day) || 0,
        level = n > 7 ? 4 : n > 4 ? 3 : n > 1 ? 2 : n ? 1 : 0;
      if (i === 0 || d.getUTCDate() === 1)
        months.push({
          label: d.toLocaleDateString("en", {
            month: "short",
            timeZone: "UTC",
          }),
          column: Math.floor((i + offset) / 7) + 1,
        });
      cells +=
        '<button class="eco-day" type="button" data-eco="day" data-id="' +
        day +
        '" data-level="' +
        level +
        '" title="' +
        day +
        ": " +
        n +
        ' recorded activities" aria-label="' +
        day +
        ", " +
        n +
        ' recorded activities"></button>';
    }
    const year = new Date().getUTCFullYear(),
      summary = new Map();
    for (const d of a.days) {
      const m = d.date.slice(0, 7);
      summary.set(m, (summary.get(m) || 0) + d.count);
    }
    return (
      '<div class="eco-heat-header"><span class="eco-muted">' +
      a.total +
      " contributions · " +
      a.activeDays +
      ' active days</span><select id="eco-activity-year" aria-label="Activity year"><option value="rolling">Last 365 days</option>' +
      Array.from(
        { length: year - 2019 },
        (_, i) => "<option>" + (year - i) + "</option>",
      ).join("") +
      '</select></div><div class="eco-heat-scroll"><div class="eco-months" style="display:grid;grid-template-columns:repeat(' +
      weeks +
      ',16px);justify-content:start">' +
      months
        .map(
          (m) =>
            '<span style="grid-column:' + m.column + '">' + m.label + "</span>",
        )
        .join("") +
      '</div><div class="eco-heat">' +
      cells +
      '</div><div class="eco-day-labels"><span>Rows: Sun · Mon · Tue · Wed · Thu · Fri · Sat</span></div></div><div class="eco-heat-legend">Less ' +
      [0, 1, 2, 3, 4]
        .map((x) => '<i class="eco-day" data-level="' + x + '"></i>')
        .join("") +
      ' More</div><p class="eco-muted">' +
      esc(a.definition) +
      "</p>" +
      (summary.size
        ? "<details><summary>Monthly totals</summary>" +
          [...summary]
            .map(([m, n]) => "<p>" + m + " · " + n + " contributions</p>")
            .join("") +
          "</details>"
        : "")
    );
  }
  function timelineCards(items) {
    return (
      '<div class="eco-timeline">' +
      items
        .map(
          (x) =>
            `<article><strong>${esc(x.title)}</strong><p>${esc(x.type || "")} ${x.xp ? "· +" + esc(x.xp) + " XP" : ""}<br>${esc(
              String(x.date || "")
                .slice(0, 16)
                .replace("T", " "),
            )}</p></article>`,
        )
        .join("") +
      "</div>"
    );
  }
  function entrySection(kind, title, note) {
    const entries = data.entries.filter((x) => x.kind === kind);
    return panel(
      title,
      `<p class="eco-muted">${esc(note)}</p>` +
        (entries.length
          ? '<div class="eco-timeline">' +
            entries
              .map(
                (e) =>
                  `<article><strong>${esc(e.data.institution || e.data.organization || e.data.title)}</strong><p>${esc(e.data.degree || e.data.designation || e.data.issuer)}<br>${esc(e.data.startDate || e.data.startYear || e.data.issueDate || "")} ${e.data.current ? "— Present" : e.data.endDate || e.data.endYear ? "— " + esc(e.data.endDate || e.data.endYear) : ""}</p><p>${esc(e.data.description || "")}</p><div class="eco-actions">${btn("Edit", "entry", kind + ":" + e.id, "small")}${btn("Delete", "delete-entry", e.id, "small danger")}</div></article>`,
              )
              .join("") +
            "</div>"
          : empty("Nothing added yet.")),
      btn(
        "Add " + (kind === "external-certificate" ? "certificate" : kind),
        "entry",
        kind,
        "small",
      ),
    );
  }
  function skillCards() {
    return data.skills.length
      ? data.skills
          .map(
            (s) =>
              `<div class="eco-skill"><div class="eco-skill-line"><strong>${esc(s.name)} ${s.pinned ? "✦" : ""}</strong><div>${btn("Edit", "skill", s.id, "small")}${btn("Remove", "delete-skill", s.id, "small danger")}</div></div><div class="eco-progress"><i style="width:${(config.proficiencies.indexOf(s.proficiency) + 1) * 25}%"></i></div><span class="eco-muted">${esc(s.category)} · ${esc(s.proficiency)} · Self-reported · ${s.endorsements || 0} endorsements</span></div>`,
          )
          .join("")
      : empty(
          "Add skills you use. Self-reported proficiency is separate from a verified assessment.",
        );
  }
  function workspaceCards(w) {
    return (
      '<div class="eco-metricgrid">' +
      Object.entries(w)
        .map(([k, v]) => metric(k, v))
        .join("") +
      '</div><p class="eco-muted">Workspace contents remain private; only you can view these counts.</p>'
    );
  }
  function radar() {
    const categories = [
      "Frontend Development",
      "Backend Development",
      "Database",
      "Programming Languages",
      "DevOps",
      "Developer Tools",
    ];
    const points = categories
      .map((c, i) => {
        const list = data.skills.filter((x) => x.category === c),
          n = list.length
            ? list.reduce(
                (s, x) => s + config.proficiencies.indexOf(x.proficiency) + 1,
                0,
              ) /
              list.length /
              4
            : 0,
          angle = ((i * 60 - 90) * Math.PI) / 180;
        return [
          135 + 90 * n * Math.cos(angle),
          135 + 90 * n * Math.sin(angle),
        ].join(",");
      })
      .join(" ");
    return `<svg class="eco-radar" viewBox="0 0 270 270" role="img" aria-label="Self-reported skill proficiency radar"><polygon points="135,45 213,90 213,180 135,225 57,180 57,90" fill="none" stroke="currentColor" opacity=".15"/><polygon points="${points}" fill="#a98ace55" stroke="#9573ba" stroke-width="2"/></svg><p class="eco-muted">${categories.map((x, i) => i + 1 + ". " + x).join(" · ")}. Values average your self-selected proficiency; no verified skill assessment is implied.</p>`;
  }
  async function discover() {
    const box = $("eco-developers");
    if (!box) return;
    box.innerHTML = empty("Loading…");
    try {
      const r = await api(
        "/discover?search=" +
          encodeURIComponent($("eco-discover-search")?.value || ""),
      );
      box.innerHTML = r.developers.length
        ? r.developers
            .filter((x) => x.userId !== data.user.id)
            .map(
              (d) =>
                `<article class="eco-card"><h4>${esc(d.user.fullName)} <small>@${esc(d.user.username)}</small></h4><p>${esc(d.headline)}</p><div class="eco-actions">${btn("View profile", "developer", d.user.username, "small")}${btn("Follow", "follow", d.user.username, "small")}${btn("Block", "block", d.user.username, "small danger")}</div></article>`,
            )
            .join("") || empty("No other opted-in developers found.")
        : empty("No matching developers have opted into discovery.");
    } catch (e) {
      box.innerHTML = empty(e.message);
    }
  }
  function editProfile(privacyOnly = false) {
    const p = data.profile,
      d = p.details || {},
      u = data.user;
    const personal = privacyOnly
      ? ""
      : `<h3>Personal information</h3>${field("fullName", "Full name", u.fullName, "text", 70)}${field("username", "Unique username", u.username, "text", 30)}${field("headline", "Professional headline", p.headline)}${field("title", "Professional title", p.title, "text", 100)}${textarea("bio", "Bio", u.bio)}${field("city", "City", p.city, "text", 80)}${field("state", "State", p.state, "text", 80)}${field("country", "Country", p.country, "text", 80)}${field("college", "College / university", p.college)}${field("company", "Current company", p.company)}<h3>Education & career preferences</h3>${Object.entries(
          {
            degree: "Degree",
            specialization: "Specialization",
            graduationYear: "Graduation year",
            designation: "Current designation",
            experienceYears: "Years of experience",
            careerInterests: "Career interests",
            preferredRoles: "Preferred roles",
            languages: "Preferred languages",
            availability: "Availability",
            targetRole: "Target role",
            preferredWorkType: "Preferred work type",
            preferredLocation: "Preferred location",
          },
        )
          .map(([k, l]) => field("detail-" + k, l, d[k] || ""))
          .join(
            "",
          )}${check("openToWork", "Open to work", d.openToWork)}${check("openToInternship", "Open to internships", d.openToInternship)}${check("collaboration", "Available for collaboration", d.collaboration)}${check("remote", "Remote work", d.remote)}<h3>Social links · HTTPS only</h3>${config.links.map((k) => field("link-" + k, k[0].toUpperCase() + k.slice(1), p.links[k] || "", "url", 500)).join("")}<h3>Custom links</h3>${Array.from({ length: 5 }, (_, i) => field("custom-label-" + i, "Link " + (i + 1) + " label", p.links.custom?.[i]?.label || "", "text", 40) + field("custom-url-" + i, "Link " + (i + 1) + " HTTPS URL", p.links.custom?.[i]?.url || "", "url", 500)).join("")}<p class="eco-muted wide">Your original certificate name is preserved when your profile name changes.</p>`;
    const privacy = `<h3>Profile privacy</h3>${select("visibility", "Overall profile visibility", ["private", "followers", "public"], p.visibility)}${check("discovery", "Opt into developer discovery", p.discovery)}${check("recruitment", "Opt into recruitment visibility", p.recruitment)}<p class="eco-muted">Only choose recruitment if you want authorized recruiter accounts to discover you. Contact email is never exposed.</p>${config.sections.map((k) => select("privacy-" + k, k[0].toUpperCase() + k.slice(1) + " visibility", ["private", "followers", "public"], p.privacy[k] || "private")).join("")}`;
    dialog(
      privacyOnly ? "Profile privacy" : "Edit developer profile",
      `<div class="eco-formgrid">${personal}${privacy}</div>`,
      async (form) => {
        const body = {
          version: data.profile.version,
          visibility: form.get("visibility"),
          discovery: form.has("discovery"),
          recruitment: form.has("recruitment"),
          privacy: Object.fromEntries(
            config.sections.map((k) => [k, form.get("privacy-" + k)]),
          ),
        };
        if (!privacyOnly) {
          body.account = {
            fullName: form.get("fullName").trim(),
            username: form.get("username").trim(),
            bio: form.get("bio").trim(),
          };
          for (const k of [
            "headline",
            "title",
            "city",
            "state",
            "country",
            "college",
            "company",
          ])
            body[k] = form.get(k).trim();
          body.details = {};
          for (const [k, value] of form)
            if (k.startsWith("detail-"))
              body.details[k.slice(7)] = value.trim();
          for (const k of [
            "openToWork",
            "openToInternship",
            "collaboration",
            "remote",
          ])
            body.details[k] = form.has(k);
          body.links = Object.fromEntries(
            config.links.map((k) => [k, form.get("link-" + k).trim()]),
          );
          body.links.custom = Array.from({ length: 5 }, (_, i) => ({
            label: form.get("custom-label-" + i).trim(),
            url: form.get("custom-url-" + i).trim(),
          })).filter((x) => x.label || x.url);
        }
        await post("/me", body, "PATCH");
      },
    );
  }
  function editEntry(key) {
    const [kind, id] = key.split(":");
    const existing = data.entries.find((x) => x.id === id),
      d = existing?.data || {};
    const fields =
      kind === "education"
        ? [
            "institution",
            "degree",
            "field",
            "startYear",
            "endYear",
            "grade",
            "achievements",
          ]
        : kind === "experience"
          ? [
              "organization",
              "designation",
              "type",
              "location",
              "startDate",
              "endDate",
              "skills",
            ]
          : ["title", "issuer", "credentialId", "issueDate", "url"];
    dialog(
      (id ? "Edit " : "Add ") + kind,
      `<div class="eco-formgrid">${fields.map((k) => field(k, k.replace(/([A-Z])/g, " $1"), d[k] || "", /Date$/.test(k) ? "date" : k === "url" ? "url" : "text", /Year$/.test(k) ? 4 : 500)).join("")}${kind !== "external-certificate" ? textarea("description", "Description", d.description || "", kind === "experience" ? 2000 : 1500) + check("current", "Current / ongoing", d.current) : ""}</div>`,
      async (f) => {
        const body = Object.fromEntries(
          fields.map((k) => [k, String(f.get(k)).trim()]),
        );
        if (kind !== "external-certificate") {
          body.description = f.get("description").trim();
          body.current = f.has("current");
        }
        await post(
          "/me/entries/" + kind + (id ? "/" + id : ""),
          body,
          id ? "PUT" : "POST",
        );
      },
    );
  }
  function editSkill(id) {
    const s = data.skills.find((x) => x.id === id) || {};
    dialog(
      id ? "Edit skill" : "Add skill",
      `<div class="eco-formgrid">${field("name", "Skill name", s.name || "", "text", 60)}${select("category", "Category", config.categories, s.category || config.categories[0])}${select("proficiency", "Self-reported proficiency", config.proficiencies, s.proficiency || "Beginner")}${check("pinned", "Pin as a top skill", s.pinned)}</div><p class="eco-muted">Editing proficiency does not award a verified skill or XP.</p>`,
      (f) =>
        post(
          "/me/skills" + (id ? "/" + id : ""),
          {
            name: f.get("name"),
            category: f.get("category"),
            proficiency: f.get("proficiency"),
            pinned: f.has("pinned"),
          },
          id ? "PUT" : "POST",
        ),
    );
  }
  async function editGoal(id) {
    const g = id ? (await api("/me/goals")).goals.find((x) => x.id === id) : {};
    dialog(
      id ? "Edit goal" : "Create learning goal",
      `<div class="eco-formgrid">${field("title", "Goal", g?.title || "", "text", 120)}${select("metric", "Recorded metric", ["xp", "problems", "projects", "lessons", "certificates", "activeDays"], g?.metric || "lessons")}${field("target", "Target", g?.target || 5, "number")}${field("deadline", "Deadline", g?.deadline?.slice(0, 10) || "", "date")}</div>`,
      (f) =>
        post(
          "/me/goals" + (id ? "/" + id : ""),
          {
            title: f.get("title"),
            metric: f.get("metric"),
            target: Number(f.get("target")),
            deadline: f.get("deadline") || null,
          },
          id ? "PUT" : "POST",
        ),
    );
  }
  async function download(kind) {
    status("Preparing your download…");
    const r = await fetch("/api/profile/me/exports/" + kind, {
      headers: getAuthHeaders(),
    });
    if (!r.ok) {
      const x = await r.json();
      throw Error(x.error || "Download failed");
    }
    const blob = await r.blob();
    saveBlob(
      blob,
      "devharbour-" +
        kind +
        (kind === "portfolio" ? ".html" : kind === "data" ? ".json" : ".pdf"),
    );
    status("Download ready.");
  }
  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
  async function upload(kind) {
    if (!config.storage) {
      status("Private storage is not configured.", true);
      return;
    }
    const d = dialog(
      "Upload " + kind,
      `<div class="eco-file"><input id="eco-upload-file" type="file" accept="${["avatar", "cover"].includes(kind) ? "image/png,image/jpeg,image/webp" : "application/pdf"}"><p class="eco-muted">Maximum 4 MB. Images are decoded and re-encoded; documents remain private attachments.</p><img id="eco-crop-preview" class="eco-crop" alt="Selected image preview" hidden><div id="eco-crop-controls" hidden><label>Zoom <input id="eco-crop-zoom" type="range" min="1" max="3" step="0.05" value="1"></label></div><p class="eco-status" id="eco-upload-status"></p>${btn("Upload file", "upload-confirm", kind)}</div>`,
    );
    let file, image, objectUrl;
    const input = d.querySelector("input[type=file]");
    input.onchange = async () => {
      file = input.files[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        d.querySelector("#eco-upload-status").textContent =
          "Choose a file under 4 MB.";
        file = null;
        return;
      }
      if (["avatar", "cover"].includes(kind)) {
        objectUrl = URL.createObjectURL(file);
        image = new Image();
        image.src = objectUrl;
        await image.decode();
        d.querySelector("#eco-crop-preview").src = objectUrl;
        d.querySelector("#eco-crop-preview").hidden = false;
        d.querySelector("#eco-crop-controls").hidden = false;
      }
    };
    d.addEventListener("close", () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    });
    d.querySelector("[data-eco=upload-confirm]").onclick = async (e) => {
      if (!file) return;
      e.target.disabled = true;
      const message = d.querySelector("#eco-upload-status");
      message.textContent = "Uploading…";
      try {
        let bytes = file,
          mime = file.type;
        if (image) {
          const canvas = document.createElement("canvas");
          canvas.width = kind === "avatar" ? 512 : 1600;
          canvas.height = kind === "avatar" ? 512 : 480;
          const zoom = Number(d.querySelector("#eco-crop-zoom").value),
            ratio = canvas.width / canvas.height;
          let sw = image.width / zoom,
            sh = sw / ratio;
          if (sh > image.height / zoom) {
            sh = image.height / zoom;
            sw = sh * ratio;
          }
          canvas
            .getContext("2d")
            .drawImage(
              image,
              (image.width - sw) / 2,
              (image.height - sh) / 2,
              sw,
              sh,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          bytes = await new Promise((r) =>
            canvas.toBlob(r, "image/webp", 0.85),
          );
          mime = "image/webp";
        }
        const headers = {
          ...getAuthHeaders(),
          "Content-Type": mime,
          "X-File-Name": kind,
        };
        const r = await fetch("/api/profile/me/media/" + kind, {
          method: "POST",
          headers,
          body: bytes,
        });
        const result = await r.json();
        if (!r.ok) throw Error(result.error);
        if (kind === "cover")
          await post(
            "/me",
            { version: data.profile.version, cover: "custom" },
            "PATCH",
          );
        d.close();
        await load(true);
        status("Upload saved.");
      } catch (error) {
        message.textContent = error.message;
      } finally {
        e.target.disabled = false;
      }
    };
  }
  async function pin(kind, id) {
    const current = data.profile.pins[kind] || [],
      next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
    await post(
      "/me",
      { version: data.profile.version, pins: { [kind]: next } },
      "PATCH",
    );
    await load(true);
  }
  function resumeDialog() {
    const sections = [
      "summary",
      "skills",
      "experience",
      "education",
      "projects",
      "certificates",
      "links",
    ];
    dialog(
      "Resume builder",
      '<div class="eco-formgrid">' +
        textarea("summary", "Professional summary", data.user.bio || "", 1500) +
        select("template", "Template", ["ats", "minimal"], "ats") +
        field(
          "sections",
          "Sections in order (comma-separated)",
          sections.join(", "),
          "text",
          160,
        ) +
        field(
          "versionTitle",
          "Version title (for saving)",
          "My resume",
          "text",
          100,
        ) +
        check("saveVersion", "Save this as a resume snapshot", false) +
        '</div><p class="eco-muted">Remove sections from the list to omit them; change the order to reorder them. No employment or qualifications are invented. AI assistance is unavailable.</p>',
      async (f) => {
        const body = {
          summary: f.get("summary"),
          template: f.get("template"),
          sections: String(f.get("sections"))
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        };
        if (f.has("saveVersion")) {
          await post("/me/resume-versions", {
            ...body,
            title: f.get("versionTitle"),
          });
          return;
        }
        const r = await fetch("/api/profile/me/resume", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw Error(d.error || "Resume could not be generated.");
        }
        saveBlob(await r.blob(), "devharbour-resume.pdf");
      },
    );
  }
  async function recapDialog(year, slide = 0) {
    const r = await api("/me/recap/" + year),
      slides = [
        [
          "Your year in code",
          r.contributions + " recorded contributions",
          r.activeDays + " active days",
        ],
        [
          "Learning momentum",
          r.xp + " XP earned",
          r.lessons + " lessons completed",
        ],
        [
          "Things you built",
          r.projects + " projects submitted",
          r.problems + " problems solved",
        ],
        [
          "Your community journey",
          r.eventRegistrations + " event registrations",
          r.badges + " badges earned",
        ],
        [
          "Keep your momentum",
          r.longestStreak + " day longest streak",
          "Most active month: " + (r.mostActiveMonth || "Not recorded"),
        ],
      ];
    const [title, main, sub] = slides[slide];
    dialog(
      year + " developer recap",
      '<div class="eco-recap"><span class="eco-tag">' +
        year +
        " · @" +
        esc(data.user.username) +
        "</span><h2>" +
        esc(title) +
        "</h2><h3>" +
        esc(main) +
        "</h3><p>" +
        esc(sub) +
        '</p><p class="eco-muted">' +
        esc(r.note) +
        '</p></div><div class="eco-actions">' +
        btn("Previous", "recap-slide", year + ":" + ((slide + 4) % 5)) +
        btn("Next", "recap-slide", year + ":" + ((slide + 1) % 5)) +
        btn("Download recap PNG", "recap-image", String(year)) +
        "</div>",
    );
  }
  async function recapImage(year) {
    const r = await api("/me/recap/" + year);
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 900;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#f4edff";
    ctx.fillRect(0, 0, 1200, 900);
    ctx.fillStyle = "#30243f";
    ctx.font = "bold 32px system-ui";
    ctx.fillText("DEV HARBOUR · " + year + " RECAP", 70, 90);
    ctx.font = "bold 42px system-ui";
    ctx.fillText(data.user.fullName.slice(0, 35), 70, 175);
    ctx.font = "24px system-ui";
    ctx.fillText("@" + data.user.username, 70, 220);
    const lines = [
      r.xp + " XP earned",
      r.contributions + " recorded contributions",
      r.activeDays + " active days",
      r.problems + " problems solved",
      r.projects + " projects submitted",
      r.lessons + " lessons completed",
      r.longestStreak + " day longest streak",
    ];
    lines.forEach((line, i) => ctx.fillText(line, 70, 310 + i * 60));
    ctx.font = "18px system-ui";
    ctx.fillText(
      "Based on recorded platform activity; missing results are not estimated.",
      70,
      820,
    );
    saveBlob(
      await new Promise((resolve) => c.toBlob(resolve, "image/png")),
      "devharbour-" + year + "-recap.png",
    );
  }
  async function action(name, id) {
    switch (name) {
      case "recap":
        await recapDialog(
          Number(document.getElementById("eco-input-recap-year").value),
        );
        break;
      case "recap-slide": {
        const [year, slide] = id.split(":").map(Number);
        await recapDialog(year, slide);
        break;
      }
      case "recap-image":
        await recapImage(Number(id));
        break;
      case "signin":
        openAuthModal("login");
        break;
      case "reload":
        await load(true);
        break;
      case "edit":
        editProfile();
        break;
      case "privacy":
        editProfile(true);
        break;
      case "tab":
        tab = id;
        history.replaceState(
          null,
          "",
          "/profile?tab=" + encodeURIComponent(id),
        );
        root
          .querySelectorAll(".eco-tabs button")
          .forEach((b) =>
            b.setAttribute("aria-selected", b.dataset.id === tab),
          );
        await loadTab();
        break;
      case "retry-tab":
        await loadTab();
        break;
      case "skills":
        await action("tab", "overview");
        $("eco-content").scrollIntoView({ behavior: "smooth" });
        break;
      case "skill":
        editSkill(id);
        break;
      case "entry":
        editEntry(id);
        break;
      case "goal":
        await editGoal(id);
        break;
      case "delete-entry":
        if (confirm("Delete this profile entry?")) {
          await api("/me/entries/" + id, { method: "DELETE" });
          await load(true);
        }
        break;
      case "delete-skill":
        if (confirm("Remove this skill?")) {
          await api("/me/skills/" + id, { method: "DELETE" });
          await load(true);
        }
        break;
      case "delete-goal":
        if (confirm("Delete this learning goal?")) {
          await api("/me/goals/" + id, { method: "DELETE" });
          await load(true);
        }
        break;
      case "share":
        if (navigator.share)
          await navigator.share({
            title: data.user.fullName + " | Dev Harbour",
            url: publicUrl(),
          });
        else await copy(publicUrl());
        break;
      case "public":
        if (data.profile.visibility !== "public") {
          status(
            "Your profile is not public. Choose its visibility in Privacy before sharing.",
            true,
          );
          break;
        }
        window.open(publicUrl(), "_blank", "noopener,noreferrer");
        break;
      case "download":
        await download(id);
        break;
      case "id-png": {
        const r = await fetch("/api/profile/me/id-card", {
          headers: getAuthHeaders(),
        });
        if (!r.ok) throw Error("Unable to generate your card.");
        const svg = await r.blob(),
          url = URL.createObjectURL(svg),
          image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 560;
        canvas.getContext("2d").drawImage(image, 0, 0);
        URL.revokeObjectURL(url);
        saveBlob(
          await new Promise((r) => canvas.toBlob(r, "image/png")),
          "devharbour-card.png",
        );
        break;
      }
      case "cover":
        dialog(
          "Cover design",
          `<div class="eco-formgrid">${select("cover", "Design", ["lavender", "mesh", "midnight", "minimal"], data.profile.cover)}</div>`,
          (f) =>
            post(
              "/me",
              {
                version: data.profile.version,
                cover: f.get("cover"),
                details: { coverSelected: true },
              },
              "PATCH",
            ),
        );
        break;
      case "upload":
        await upload(id);
        break;
      case "uploads":
        dialog(
          "Private uploads",
          data.uploads.length
            ? data.uploads
                .map(
                  (x) =>
                    `<article class="eco-card"><strong>${esc(x.kind)}</strong><p>${esc(x.label)} · ${Math.round(x.bytes / 1024)} KB</p>${btn("Download / view", "media-view", x.id, "small")}${btn("Remove", "media-delete", x.id, "small danger")}</article>`,
                )
                .join("")
            : empty("No files uploaded."),
        );
        break;
      case "media-view": {
        const file = await api("/media/" + id);
        window.open(file.url, "_blank", "noopener,noreferrer");
        break;
      }
      case "media-delete":
        if (confirm("Remove this upload?")) {
          await api("/me/media/" + id, { method: "DELETE" });
          $("eco-dialog")?.close();
          await load(true);
        }
        break;
      case "project":
        show("projects", true);
        if (typeof window.openProjectModal === "function")
          window.openProjectModal(id);
        break;
      case "share-project":
        await copy(location.origin + "/projects#" + encodeURIComponent(id));
        break;
      case "pin-project":
        await pin("projects", id);
        break;
      case "pin-certificate":
        await pin("certificates", id);
        break;
      case "copy-certificate":
        await copy(location.origin + id);
        break;
      case "projects":
        show("projects", true);
        break;
      case "learning":
        show("learn", true);
        break;
      case "workspace":
        show("work", true);
        break;
      case "certificates":
        show("my-certificate", true);
        break;
      case "day": {
        const r = await api("/me/activity/" + id);
        dialog(
          "Activity on " + id,
          r.items.length
            ? timelineCards(
                r.items.map((x) => ({ title: x.type, date: x.date, xp: x.xp })),
              )
            : empty("No recorded contribution on this date."),
        );
        break;
      }
      case "timeline-more": {
        const r = await api("/me/timeline?before=" + encodeURIComponent(id));
        $("eco-timeline").insertAdjacentHTML(
          "beforeend",
          timelineCards(r.items),
        );
        const b = root.querySelector("[data-eco=timeline-more]");
        if (r.next) b.dataset.id = r.next;
        else b.remove();
        break;
      }
      case "follow":
        await post("/connect/" + encodeURIComponent(id) + "/follow", {});
        status("Follow request saved.");
        break;
      case "block":
        if (confirm("Block @" + id + "?")) {
          await post("/connect/" + encodeURIComponent(id) + "/block", {});
          await discover();
          status("Developer blocked.");
        }
        break;
      case "developer": {
        const d = await api("/public/" + encodeURIComponent(id));
        dialog(
          d.user.fullName,
          `<p>@${esc(d.user.username)}</p><p>${esc(d.user.headline)}</p><p>${esc(d.bio)}</p><div class="eco-actions">${btn("Follow", "follow", id)}${btn("Request collaboration", "collaborate", id)}${btn("Report", "report", id, "danger")}</div>`,
        );
        break;
      }
      case "collaborate":
      case "report":
        dialog(
          name === "report" ? "Report developer" : "Request collaboration",
          textarea("message", "Message / reason", "", 500),
          (f) =>
            post(
              "/connect/" +
                encodeURIComponent(id) +
                "/" +
                (name === "report" ? "report" : "collaboration"),
              { message: f.get("message") },
            ),
        );
        break;
      case "request-accept":
      case "request-decline":
        await post(
          "/me/requests/" + id,
          { status: name === "request-accept" ? "accepted" : "declined" },
          "PATCH",
        );
        await load(true);
        break;
      case "resume":
        resumeDialog();
        break;
      case "resume-versions": {
        const r = await api("/me/resume-versions");
        dialog(
          "Saved resume versions",
          r.versions.length
            ? r.versions
                .map(
                  (x) =>
                    '<article class="eco-card"><h4>' +
                    esc(x.title) +
                    "</h4><p>" +
                    esc(x.createdAt.slice(0, 10)) +
                    " · " +
                    esc(x.template) +
                    "</p>" +
                    btn("Download PDF", "version-pdf", x.id) +
                    btn("Delete", "delete-entry", x.id, "small danger") +
                    "</article>",
                )
                .join("")
            : empty(
                "Save a snapshot from the resume builder. Later profile changes will not alter it.",
              ),
        );
        break;
      }
      case "version-pdf": {
        const r = await fetch(
          "/api/profile/me/resume-versions/" + encodeURIComponent(id) + "/pdf",
          { headers: getAuthHeaders() },
        );
        if (!r.ok) throw Error("Resume version unavailable.");
        saveBlob(await r.blob(), "devharbour-resume.pdf");
        break;
      }
      case "notifications": {
        const r = await api("/me/notifications");
        dialog(
          "Profile notifications",
          r.notifications.length
            ? r.notifications
                .map(
                  (x) =>
                    '<article class="eco-card"><p>' +
                    esc(x.title) +
                    "</p><small>" +
                    esc(x.createdAt.slice(0, 16)) +
                    "</small>" +
                    (!x.read
                      ? btn("Mark read", "notification-read", x.id)
                      : '<span class="eco-muted">Read</span>') +
                    "</article>",
                )
                .join("")
            : empty("No profile notifications yet."),
        );
        break;
      }
      case "notification-read":
        await post("/me/notifications/" + encodeURIComponent(id), {}, "PATCH");
        await action("notifications");
        break;
      case "connections": {
        const r = await api("/me/connections?kind=" + encodeURIComponent(id));
        dialog(
          id === "block"
            ? "Blocked developers"
            : id === "following"
              ? "Following"
              : "Followers",
          r.items.length
            ? r.items
                .map(
                  (x) =>
                    '<article class="eco-card"><h4>' +
                    esc(x.user.fullName) +
                    "</h4><p>@" +
                    esc(x.user.username) +
                    "</p>" +
                    btn(
                      id === "block"
                        ? "Unblock"
                        : id === "following"
                          ? "Unfollow"
                          : "View profile",
                      id === "block"
                        ? "unblock"
                        : id === "following"
                          ? "unfollow"
                          : "developer",
                      x.user.username,
                    ) +
                    "</article>",
                )
                .join("") +
                (r.limited ? "<p>Showing the latest 100 connections.</p>" : "")
            : empty("No connections in this list."),
        );
        break;
      }
      case "unblock":
      case "unfollow":
        await api(
          "/connect/" +
            encodeURIComponent(id) +
            "/" +
            (name === "unblock" ? "block" : "follow"),
          { method: "DELETE" },
        );
        $("eco-dialog")?.close();
        await load(true);
        break;
    }
  }
  document.addEventListener("click", (e) => {
    const button = e.target.closest("[data-eco]");
    if (!button || button.disabled) return;
    e.preventDefault();
    action(button.dataset.eco, button.dataset.id || "").catch((error) =>
      status(error.message, true),
    );
  });
  document.addEventListener("change", async (e) => {
    if (e.target.id !== "eco-activity-year") return;
    try {
      const result = await api(
        "/me/activity?year=" + encodeURIComponent(e.target.value),
      );
      const section = e.target.closest(".eco-panel");
      section.innerHTML = "<h3>Activity calendar</h3>" + heatmap(result);
      section.querySelector("select").value = e.target.value;
    } catch (error) {
      status(error.message, true);
    }
  });
  window.renderProfilePage = () => {
    if (root.classList.contains("on") && currentUser?.id !== ownerId) load();
  };
  window.openProfilePage = () => {
    if (!currentUser) return openAuthModal("login");
    show("profile", true);
    load();
  };
  window.addEventListener("popstate", () => {
    if (location.pathname === "/profile") {
      tab = new URLSearchParams(location.search).get("tab") || "overview";
      if (data) {
        shell();
        renderStats();
        loadTab();
      }
    }
  });
  await load();
})();
