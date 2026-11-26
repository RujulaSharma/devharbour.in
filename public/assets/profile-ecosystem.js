/* ==========================================================================
   Dev Harbour — Unified DeveloperProfile & Settings UI (Owner + Visitor)
   ========================================================================== */
(() => {
  const root = document.getElementById("v-profile");
  if (!root) return;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
    );

  const safeHref = (u) => {
    const raw = String(u || "").trim();
    if (!raw) return "";
    if (raw.startsWith("/")) return raw;
    try {
      const parsed = new URL(raw);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "";
    } catch {
      return "";
    }
  };

  const getToken = () =>
    localStorage.getItem("dh_token") || localStorage.getItem("dh-auth-token") || "";

  const getViewer = () => {
    try {
      if (typeof currentUser !== "undefined" && currentUser) return currentUser;
    } catch {}
    try {
      const raw = localStorage.getItem("dh_current_user") || localStorage.getItem("dh-current-user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const notify = (msg) => {
    if (typeof toast === "function") toast(msg);
  };

  async function api(path, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(`/api/profile${path}`, {
      ...options,
      headers,
      body: options.body && typeof options.body === "object" && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
      credentials: "same-origin",
    });
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const body = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => "");
    if (!res.ok) {
      const retryHeader = Number(res.headers.get("retry-after"));
      const bodyRetry = typeof body === "object" && body !== null ? Number(body.retryAfter) : 0;
      const retryAfter = Number.isFinite(retryHeader) && retryHeader > 0
        ? Math.ceil(retryHeader)
        : Number.isFinite(bodyRetry) && bodyRetry > 0 ? Math.ceil(bodyRetry) : 0;
      const serverMessage = typeof body === "object" && body !== null ? body.error : null;
      const err = new Error(serverMessage || (res.status === 429
        ? "Too many requests. Please try again shortly."
        : `Request failed (${res.status})`));
      err.status = res.status;
      err.retryAfter = retryAfter;
      throw err;
    }
    return body;
  }

  // Crisp Lucide-style inline SVG Icons
  const ICON_PATHS = {
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    link2: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/>',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    code2: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
    userCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    share2: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    folderCode: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="m10 13-2 2 2 2"/><path d="m14 13 2 2-2 2"/>',
    bookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    fileBadge: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-1"/><circle cx="12" cy="14" r="2"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    graduationCap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    trash2: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    moreHorizontal: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    qrCode: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    ban: '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>',
  };

  function icon(name, cls = "dp-inline-icon") {
    const body = ICON_PATHS[name] || ICON_PATHS.sparkles;
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  // Application State
  const state = {
    mode: "self", // "self" | "public" | "directory"
    targetUsername: null,
    visitorPreview: false,
    activeTab: "overview",
    activityYear: "rolling",
    timelineType: "all",
    selectedDay: null,
    selectedDayItems: null,
    projectCategory: "All",
    projectSearch: "",
    config: null,
    meData: null,
    publicData: null,
    tabCache: {},
    signedMediaUrls: {},
    loading: false,
    error: null,
    settingsTab: "appearance",
    profileRetryAt: 0,
  };

  const formatDateShort = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val).slice(0, 10);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const formatDayNice = (iso) => {
    if (!iso) return "";
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  };

  function parseRouteFromUrl() {
    const pathname = (location.pathname || "/").replace(/\/+$/, "") || "/";
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") || "overview";
    if (pathname.startsWith("/u/")) {
      const uname = decodeURIComponent(pathname.slice(3).split("/")[0] || "");
      return { view: "profile", username: uname, tab, asVisitor: params.get("asVisitor") === "1" };
    }
    if (pathname === "/profile") {
      const dev = params.get("developer");
      return { view: "profile", username: dev || null, tab, asVisitor: params.get("asVisitor") === "1" };
    }
    if (pathname === "/profile/settings" || pathname === "/settings/profile") {
      return { view: "settings", settingsTab: "profile" };
    }
    if (pathname === "/profile/settings/privacy" || pathname === "/settings/privacy") {
      return { view: "settings", settingsTab: "privacy" };
    }
    if (pathname === "/theme") return { view: "settings", settingsTab: "appearance" };
    if (pathname === "/settings") {
      return { view: "settings", settingsTab: params.get("section") || "account" };
    }
    return null;
  }

  function updateQueryTab(tab) {
    try {
      const url = new URL(location.href);
      if (tab === "overview") url.searchParams.delete("tab");
      else url.searchParams.set("tab", tab);
      history.replaceState(null, "", url.pathname + url.search);
    } catch {}
  }

  async function ensureConfig() {
    if (state.config) return state.config;
    try {
      state.config = await api("/config");
    } catch {
      state.config = {
        enabled: true,
        categories: ["Programming Languages", "Frontend Development", "Backend Development", "Database", "Full Stack Development", "DevOps", "Cloud Computing", "Cybersecurity", "Mobile Development", "AI and Machine Learning", "Testing", "Developer Tools", "Other Skills"],
        proficiencies: ["Beginner", "Intermediate", "Advanced", "Expert"],
        sections: ["about", "location", "availability", "skills", "education", "experience", "activity", "certificates", "resume", "links", "projects", "statistics", "achievements", "hackathons", "learning", "developerId"],
        links: ["github", "linkedin", "portfolio", "website", "leetcode", "hackerrank", "codechef", "codeforces", "stackoverflow", "devto"],
      };
    }
    return state.config;
  }

  async function resolveMediaUrl(mediaId) {
    if (!mediaId) return "";
    if (state.signedMediaUrls[mediaId]) return state.signedMediaUrls[mediaId];
    try {
      const res = await api(`/media/${encodeURIComponent(mediaId)}`);
      if (res?.url) state.signedMediaUrls[mediaId] = res.url;
      return res?.url || "";
    } catch {
      return "";
    }
  }

  // =========================================================================
  // Component: Scenic Cover SVG Artwork (matching attached reference image)
  // =========================================================================
  function renderCoverBanner(cover, customCoverUrl, isOwnerEditable) {
    const mode = cover || "scenic";
    let inner = "";
    if (mode === "custom" && customCoverUrl) {
      inner = `<img class="dp-cover-img" src="${esc(customCoverUrl)}" alt="Developer profile banner">`;
    } else if (mode === "lavender" || mode === "scenic") {
      inner = `<svg class="dp-cover-art" viewBox="0 0 1440 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="dpSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D7C8F6"/>
            <stop offset="50%" stop-color="#ECE4FC"/>
            <stop offset="100%" stop-color="#DFD2FA"/>
          </linearGradient>
          <radialGradient id="dpMoon" cx="63%" cy="62%" r="36%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.96"/>
            <stop offset="50%" stop-color="#FBF8FF" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#E7DCFC" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="240" fill="url(#dpSky)"/>
        <circle cx="910" cy="148" r="180" fill="url(#dpMoon)"/>
        <circle cx="910" cy="148" r="46" fill="#FFFFFF" fill-opacity="0.72"/>
        <path d="M0 165 L140 92 L290 142 L450 86 L620 140 L790 98 L980 148 L1150 96 L1310 132 L1440 88 L1440 240 L0 240 Z" fill="#C9B6F0" fill-opacity="0.7"/>
        <path d="M0 190 L110 128 L250 174 L420 112 L590 168 L770 120 L950 176 L1120 132 L1290 166 L1440 126 L1440 240 L0 240 Z" fill="#9E7FD8" fill-opacity="0.82"/>
        <path d="M0 218 L180 156 L360 198 L540 148 L720 195 L910 162 L1100 198 L1280 146 L1440 178 L1440 240 L0 240 Z" fill="#6F4EAE"/>
        <path d="M0 236 C260 202 520 226 780 210 C1020 194 1240 218 1440 202 L1440 240 L0 240 Z" fill="#462B80"/>
        <g fill="#351E64">
          <path d="M26 240 L44 128 L62 240 Z M12 240 L34 148 L56 240 Z M54 240 L74 140 L94 240 Z M86 240 L102 165 L118 240 Z"/>
          <path d="M1320 240 L1342 150 L1364 240 Z M1352 240 L1376 112 L1400 240 Z M1388 240 L1412 132 L1436 240 Z M1288 240 L1308 176 L1328 240 Z"/>
        </g>
        <g stroke="#68509B" stroke-width="1.6" fill="none" stroke-linecap="round">
          <path d="M775 74 q6-5 11 0 q5-5 11 0"/>
          <path d="M808 62 q5-4 9 0 q4-4 9 0"/>
          <path d="M830 82 q4-3 7 0 q3-3 7 0"/>
        </g>
        <text x="1340" y="64" text-anchor="end" font-family="Inter,Manrope,sans-serif" font-size="13" font-weight="700" letter-spacing="3.5" fill="#49337A">BUILD · LEARN · COMPETE · GROW</text>
        <text x="1192" y="92" text-anchor="end" font-family="Inter,Manrope,sans-serif" font-size="12" font-weight="800" letter-spacing="2.8" fill="#5D4491">DEV HARBOUR</text>
      </svg>`;
    } else if (mode === "midnight") {
      inner = `<svg class="dp-cover-art" viewBox="0 0 1440 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient id="dpNight" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1A1330"/><stop offset="100%" stop-color="#362466"/></linearGradient></defs>
        <rect width="1440" height="240" fill="url(#dpNight)"/>
        <circle cx="1020" cy="96" r="140" fill="#9270D4" fill-opacity="0.22"/>
        <circle cx="240" cy="48" r="2" fill="#FFF" fill-opacity="0.6"/><circle cx="480" cy="70" r="1.5" fill="#FFF" fill-opacity="0.5"/><circle cx="720" cy="36" r="2" fill="#FFF" fill-opacity="0.7"/><circle cx="1180" cy="54" r="1.8" fill="#FFF" fill-opacity="0.6"/>
        <text x="1360" y="64" text-anchor="end" font-family="Inter,Manrope,sans-serif" font-size="13" font-weight="700" letter-spacing="3.5" fill="#DFD3F7">BUILD · LEARN · COMPETE · GROW</text>
        <text x="1360" y="90" text-anchor="end" font-family="Inter,Manrope,sans-serif" font-size="12" font-weight="800" letter-spacing="2.8" fill="#B89EF0">DEV HARBOUR</text>
      </svg>`;
    } else {
      inner = `<div style="position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:flex-end;padding:24px 36px;color:#5D4491;font-size:12px;font-weight:700;letter-spacing:3px;opacity:.75">BUILD · LEARN · COMPETE · GROW · DEV HARBOUR</div>`;
    }
    const coverClass = mode === "mesh" ? "dp-cover-mesh" : mode === "midnight" ? "dp-cover-midnight" : mode === "minimal" ? "dp-cover-minimal" : "";
    return `<div class="dp-cover ${coverClass}">
      ${inner}
      ${isOwnerEditable ? `<button type="button" class="dp-cover-edit-btn" data-dp-action="edit-cover" title="Customize cover banner">${icon("camera")} Cover</button>` : ""}
    </div>`;
  }

  // =========================================================================
  // Component: ProfileHeader + ProfileActionBar + ProfileStatistics
  // =========================================================================
  function renderHeaderCard(vm) {
    const { user, profile, stats, sections, links, bio, followers, following, viewerConnection, developerId, resume, resolvedAvatarUrl, resolvedCoverUrl } = vm;
    const isOwner = Boolean(viewerConnection?.isOwner && !state.visitorPreview);
    const initial = (user.fullName || user.username || "D").trim().charAt(0).toUpperCase();
    const avatarHtml = resolvedAvatarUrl || user.avatarUrl
      ? `<img src="${esc(safeHref(resolvedAvatarUrl || user.avatarUrl) || resolvedAvatarUrl)}" alt="${esc(user.fullName)}">`
      : esc(initial);

    const locationStr = sections.location ? [user.city, user.state, user.country].filter(Boolean).join(", ") : "";
    const orgStr = (sections.education && user.college) || (sections.experience && user.company) || "";
    const portfolioUrl = sections.links ? (safeHref(links.portfolio || links.website || "")) : "";
    const portfolioHost = portfolioUrl ? portfolioUrl.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "") : "";
    const githubUrl = sections.links ? safeHref(links.github) : "";
    const linkedinUrl = sections.links ? safeHref(links.linkedin) : "";
    const externalUrl = sections.links ? safeHref(links.website || links.devto || links.leetcode || "") : "";

    const availabilityBadges = [];
    if (sections.availability && profile.details?.openToWork) availabilityBadges.push("Open to Work");
    if (sections.availability && profile.details?.openToInternship) availabilityBadges.push("Open to Internships");
    if (sections.availability && profile.details?.collaboration) availabilityBadges.push("Open to Collaborate");

    // Action Bar
    let actionButtons = "";
    if (isOwner) {
      actionButtons = `
        <button type="button" class="dp-btn" data-dp-action="preview-visitor">${icon("eye")} View as Visitor</button>
        <button type="button" class="dp-btn" data-dp-action="share-profile">${icon("share2")} Share</button>
        <button type="button" class="dp-btn dp-btn-primary" data-dp-action="go-settings-profile">${icon("pencil")} Edit Profile</button>
      `;
    } else {
      const fStatus = viewerConnection?.followingStatus || "none";
      const followLabel = fStatus === "accepted" ? "Following" : fStatus === "pending" ? "Requested" : "Follow";
      const followCls = fStatus === "accepted" ? "dp-btn dp-btn-soft" : "dp-btn";
      const followIcon = fStatus === "accepted" ? "userCheck" : "userPlus";
      const collabAllowed = Boolean(sections.availability && profile.details?.collaboration);
      const canDownloadResume = Boolean(sections.resume && resume?.downloadAllowed);
      const disableVisitorActions = state.visitorPreview ? 'data-dp-preview-blocked="1"' : "";

      actionButtons = `
        <button type="button" class="${followCls}" data-dp-action="toggle-follow" ${disableVisitorActions}>${icon(followIcon)} ${followLabel}</button>
        ${collabAllowed ? `<button type="button" class="dp-btn" data-dp-action="request-collab" ${disableVisitorActions}>${viewerConnection?.collaborationStatus === "pending" ? "Requested" : viewerConnection?.collaborationStatus === "accepted" ? "Connected" : "Connect"}</button>` : ""}
        ${canDownloadResume ? `<button type="button" class="dp-btn" data-dp-action="download-public-resume">${icon("download")} Resume</button>` : ""}
        <button type="button" class="dp-btn dp-btn-primary" data-dp-action="scroll-projects">View Projects</button>
        <div class="dp-menu-wrap">
          <button type="button" class="dp-btn dp-btn-icon" data-dp-action="toggle-more-menu" aria-label="More options" aria-expanded="false">${icon("moreHorizontal")}</button>
          <div class="dp-dropdown-menu" id="dp-visitor-more-menu" hidden>
            <button type="button" data-dp-action="share-profile">${icon("share2")} Share &amp; QR Code</button>
            ${!state.visitorPreview ? `<button type="button" data-dp-action="report-user">${icon("flag")} Report Profile</button><button type="button" class="danger" data-dp-action="block-user">${icon("ban")} Block User</button>` : ""}
          </div>
        </div>
      `;
    }

    // 6-Stat Bar
    let statsBarHtml = "";
    if (sections.statistics && stats) {
      const rankStr = stats.globalRank ? `#${stats.globalRank}` : "Unranked";
      statsBarHtml = `
        <div class="dp-stats-bar" aria-label="Developer Statistics">
          <div class="dp-stat-cell">
            <span class="dp-stat-icon">${icon("zap")}</span>
            <span class="dp-stat-copy"><strong class="dp-stat-val">${Number(stats.totalXp || 0).toLocaleString()}</strong><span class="dp-stat-lbl">XP</span></span>
          </div>
          <div class="dp-stat-cell">
            <span class="dp-stat-icon">${icon("layers")}</span>
            <span class="dp-stat-copy"><strong class="dp-stat-val">Level ${Number(stats.level || 1)}</strong><span class="dp-stat-lbl">${esc(stats.title || "Code Rookie")}</span></span>
          </div>
          <div class="dp-stat-cell">
            <span class="dp-stat-icon streak">${icon("flame")}</span>
            <span class="dp-stat-copy"><strong class="dp-stat-val">${Number(stats.currentStreak || 0)} Days</strong><span class="dp-stat-lbl">Streak</span></span>
          </div>
          <button type="button" class="dp-stat-cell" data-dp-tab="coding">
            <span class="dp-stat-icon">${icon("code2")}</span>
            <span class="dp-stat-copy"><strong class="dp-stat-val">${Number(stats.problems || 0)}</strong><span class="dp-stat-lbl">Problems Solved</span></span>
          </button>
          <div class="dp-stat-cell">
            <span class="dp-stat-icon rank">${icon("trophy")}</span>
            <span class="dp-stat-copy"><strong class="dp-stat-val">${esc(rankStr)}</strong><span class="dp-stat-lbl">Global Rank</span></span>
          </div>
          <button type="button" class="dp-stat-cell" data-dp-tab="achievements">
            <span class="dp-stat-icon">${icon("award")}</span>
            <span class="dp-stat-copy"><strong class="dp-stat-val">${Number(stats.badges || vm.achievements?.length || 0)}</strong><span class="dp-stat-lbl">Achievements</span></span>
          </button>
        </div>
      `;
    }

    return `
      <header class="dp-card dp-header-card">
        ${renderCoverBanner(profile.cover, resolvedCoverUrl, isOwner)}
        <div class="dp-identity-band">
          <div class="dp-identity-left">
            <div class="dp-avatar-wrap">
              <div class="dp-avatar" aria-label="${esc(user.fullName)}">${avatarHtml}</div>
              ${isOwner ? `<button type="button" class="dp-avatar-edit-btn" data-dp-action="edit-avatar" title="Edit profile photo" aria-label="Edit profile photo">${icon("pencil")}</button>` : ""}
            </div>
            <div class="dp-identity-info">
              <div class="dp-name-row">
                <h1 class="dp-full-name">${esc(user.fullName || user.username)}</h1>
                ${user.verified ? `<span class="dp-verified-badge" title="Verified Dev Harbour Credential">${icon("check")}</span>` : ""}
                ${availabilityBadges.slice(0, 2).map((b) => `<span class="dp-badge-pill dp-badge-pill-green">${esc(b)}</span>`).join("")}
                ${isOwner ? `<span class="dp-badge-pill">${profile.visibility === "public" ? "Public Profile" : profile.visibility === "followers" ? "Followers Only" : "Private Profile"}</span>` : ""}
              </div>
              <div class="dp-handle">
                <span>@${esc(user.username)}</span>
                ${sections.developerId && developerId?.code ? `<span>· ID: ${esc(developerId.code)}</span>` : ""}
                ${viewerConnection?.isFollowedBy ? `<span class="dp-badge-pill">Follows you</span>` : ""}
              </div>
              ${profile.headline ? `<p class="dp-headline">${esc(profile.headline)}</p>` : ""}
              ${sections.about && bio ? `<p class="dp-bio-line">${esc(bio)}</p>` : ""}
              <div class="dp-meta-strip">
                ${locationStr ? `<span class="dp-meta-item">${icon("mapPin")} ${esc(locationStr)}</span>` : ""}
                ${orgStr ? `<span class="dp-meta-item">${icon(sections.education && user.college ? "graduationCap" : "briefcase")} ${esc(orgStr)}</span>` : ""}
                ${portfolioUrl ? `<a class="dp-meta-item" href="${esc(portfolioUrl)}" target="_blank" rel="noopener noreferrer">${icon("link2")} ${esc(portfolioHost)}</a>` : ""}
                ${(githubUrl || linkedinUrl || externalUrl) ? `<span class="dp-meta-icons">
                  ${githubUrl ? `<a class="dp-meta-social-btn" href="${esc(githubUrl)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">${icon("github")}</a>` : ""}
                  ${linkedinUrl ? `<a class="dp-meta-social-btn" href="${esc(linkedinUrl)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">${icon("linkedin")}</a>` : ""}
                  ${externalUrl ? `<a class="dp-meta-social-btn" href="${esc(externalUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Website" title="Website">${icon("externalLink")}</a>` : ""}
                </span>` : ""}
                <button type="button" class="dp-meta-item" data-dp-action="open-connections" data-kind="follow">${icon("users")} <strong>${Number(followers || 0)}</strong> followers · <strong>${Number(following || 0)}</strong> following</button>
                ${user.memberSince ? `<span class="dp-meta-item">${icon("calendar")} Member since ${esc(formatDateShort(user.memberSince))}</span>` : ""}
              </div>
            </div>
          </div>
          <div class="dp-actions">${actionButtons}</div>
        </div>
        ${statsBarHtml}
      </header>
    `;
  }

  // =========================================================================
  // Component: GitHub-Style Profile Tabs
  // =========================================================================
  function renderTabs(vm) {
    const { sections, projects, achievements, certificates, stats } = vm;
    const pCount = sections.projects ? (projects?.length ?? stats?.projects ?? 0) : null;
    const aCount = sections.achievements ? (achievements?.length ?? stats?.badges ?? 0) : null;
    const cCount = sections.certificates ? (certificates?.length ?? stats?.certificates ?? 0) : null;

    const tabs = [
      { id: "overview", label: "Overview", icon: "home", count: null },
      { id: "projects", label: "Projects", icon: "folderCode", count: pCount },
      { id: "coding", label: "Coding", icon: "code2", count: null },
      { id: "learning", label: "Learning", icon: "bookOpen", count: null },
      { id: "achievements", label: "Achievements", icon: "trophy", count: aCount },
      { id: "certificates", label: "Certificates", icon: "fileBadge", count: cCount },
      { id: "activity", label: "Activity", icon: "activity", count: null },
    ];

    return `
      <nav class="dp-tabs-bar" role="tablist" aria-label="Profile Sections">
        ${tabs
          .map(
            (t) => `<button type="button" role="tab" aria-selected="${state.activeTab === t.id}" class="dp-tab-btn${state.activeTab === t.id ? " active" : ""}" data-dp-tab="${t.id}">
              ${icon(t.icon)}
              <span>${t.label}</span>
              ${t.count !== null ? `<span class="dp-tab-count">${t.count}</span>` : ""}
            </button>`,
          )
          .join("")}
      </nav>
    `;
  }

  // =========================================================================
  // Component: Sidebar (About, Top Skills, Social Links, Developer ID)
  // =========================================================================
  function renderSidebar(vm) {
    const { user, profile, bio, skills, links, sections, developerId } = vm;
    const isOwner = Boolean(viewerIsOwner(vm));

    const locText = sections.location ? [user.city, user.state, user.country].filter(Boolean).join(", ") : "";
    const orgText = (sections.education && user.college) || "";
    const companyText = (sections.experience && (profile.title || user.title || user.company)) ? [user.title || profile.title, user.company].filter(Boolean).join(" · ") : "";

    // 1. About Card (Strictly clean: no email, no completion score, no goals)
    const aboutCard = `
      <section class="dp-card">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("user")} About</h2>
          ${isOwner ? `<button type="button" class="dp-icon-edit" data-dp-action="quick-edit-about" title="Edit About">${icon("pencil")}</button>` : ""}
        </div>
        ${sections.about
          ? `<p class="dp-about-copy">${bio ? esc(bio) : `<span class="dp-muted">${isOwner ? "Tell visitors what you enjoy building and learning." : "No bio added yet."}</span>`}</p>`
          : `<p class="dp-muted" style="margin:0 0 12px;font-size:13px;">${icon("lock")} About bio is private.</p>`}
        <ul class="dp-about-list">
          ${locText ? `<li>${icon("mapPin")} <span>${esc(locText)}</span></li>` : ""}
          ${orgText ? `<li>${icon("graduationCap")} <span>${esc(orgText)}</span></li>` : ""}
          ${companyText ? `<li>${icon("briefcase")} <span>${esc(companyText)}</span></li>` : ""}
          ${user.memberSince ? `<li>${icon("calendar")} <span>Member since ${esc(formatDateShort(user.memberSince))}</span></li>` : ""}
        </ul>
      </section>
    `;

    // 2. Top Skills Card
    const visibleSkills = Array.isArray(skills) ? skills.slice(0, 12) : [];
    const skillsCard = `
      <section class="dp-card">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("zap")} Top Skills</h2>
          <div class="dp-section-actions">
            ${isOwner ? `<button type="button" class="dp-icon-edit" data-dp-action="manage-skills" title="Manage Skills">${icon("pencil")}</button>` : ""}
          </div>
        </div>
        ${!sections.skills
          ? `<p class="dp-muted" style="margin:0;font-size:13px;">${icon("lock")} Skills are private.</p>`
          : visibleSkills.length
            ? `<div class="dp-skills-wrap">
                ${visibleSkills
                  .map((s) => {
                    const end = Number(s.endorsements || 0);
                    return `<span class="dp-skill-pill" title="${esc(s.category)} · ${esc(s.proficiency)}">${esc(s.name)}${end > 0 ? `<span class="dp-skill-endorse">+${end}</span>` : ""}</span>`;
                  })
                  .join("")}
              </div>
              <div style="margin-top:12px;"><button type="button" class="dp-link-action" data-dp-tab="coding">View skill radar ${icon("arrowRight")}</button></div>`
            : `<p class="dp-muted" style="margin:0;font-size:13px;">${isOwner ? "Add your languages, frameworks, and tools." : "No skills added yet."}</p>`}
      </section>
    `;

    // 3. Social Links Card
    const linkRows = [];
    if (sections.links && links) {
      const iconFor = { github: "github", linkedin: "linkedin", portfolio: "globe", website: "globe" };
      for (const key of ["github", "linkedin", "portfolio", "website", "leetcode", "hackerrank", "codechef", "codeforces", "stackoverflow", "devto"]) {
        const href = safeHref(links[key]);
        if (!href) continue;
        const cleanLabel = href.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
        linkRows.push({ key, href, label: cleanLabel, ic: iconFor[key] || "code2" });
      }
      if (Array.isArray(links.custom)) {
        for (const c of links.custom) {
          const href = safeHref(c.url);
          if (href) linkRows.push({ key: c.label, href, label: c.label || href, ic: "link2" });
        }
      }
    }
    const linksCard = `
      <section class="dp-card">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("link2")} Social Links</h2>
          ${isOwner ? `<button type="button" class="dp-icon-edit" data-dp-action="manage-links" title="Edit Links">${icon("pencil")}</button>` : ""}
        </div>
        ${!sections.links
          ? `<p class="dp-muted" style="margin:0;font-size:13px;">${icon("lock")} Links are private.</p>`
          : linkRows.length
            ? `<div class="dp-links-list">
                ${linkRows
                  .map(
                    (l) => `<a class="dp-link-row" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">
                      <span class="dp-link-row-left">${icon(l.ic)} <span>${esc(l.label)}</span></span>
                      ${icon("externalLink")}
                    </a>`,
                  )
                  .join("")}
              </div>`
            : `<p class="dp-muted" style="margin:0;font-size:13px;">${isOwner ? "Add GitHub, LinkedIn, or portfolio links." : "No links shared."}</p>`}
      </section>
    `;

    // 4. Developer Identity / QR Card
    let identityCard = "";
    if (sections.developerId && developerId?.code) {
      const qrSrc = `/api/profile/public/${encodeURIComponent(user.username)}/qr${state.visitorPreview ? "?asVisitor=1" : ""}`;
      identityCard = `
        <section class="dp-card">
          <div class="dp-section-head">
            <h2 class="dp-section-title">${icon("qrCode")} Developer Identity</h2>
            ${isOwner ? `<button type="button" class="dp-link-action" data-dp-action="download-id-card">Card SVG</button>` : ""}
          </div>
          <div class="dp-dev-id-box">
            <div>
              <div style="font-size:12px;color:var(--dp-muted);margin-bottom:2px;">Dev Harbour ID</div>
              <strong style="font-size:14px;letter-spacing:.03em;">${esc(developerId.code)}</strong>
              ${vm.stats?.title ? `<div style="font-size:12px;color:var(--dp-lavender-deep);font-weight:600;margin-top:4px;">${esc(vm.stats.title)}</div>` : ""}
            </div>
            ${developerId.showQrCode !== false ? `<div class="dp-dev-id-qr"><img src="${esc(qrSrc)}" alt="QR code to @${esc(user.username)} profile" loading="lazy"></div>` : ""}
          </div>
        </section>
      `;
    }

    return `<aside class="dp-sidebar-stack" aria-label="Developer Information">${aboutCard}${skillsCard}${linksCard}${identityCard}</aside>`;
  }

  // =========================================================================
  // Component: ContributionHeatmap
  // =========================================================================
  function renderHeatmapSection(vm) {
    if (!vm.sections.activity) {
      return `<section class="dp-card"><div class="dp-section-head"><h2 class="dp-section-title">${icon("calendar")} Contribution Activity</h2></div><p class="dp-muted" style="margin:0;font-size:13.5px;">${icon("lock")} Contribution heatmap is hidden by this developer's privacy settings.</p></section>`;
    }
    const act = vm.activity;
    const days = Array.isArray(act?.days) ? act.days : [];
    const total = Number(act?.total || 0);
    const activeDays = Number(act?.activeDays || vm.stats?.activeDays || 0);
    const currentStreak = Number(act?.streaks?.current ?? vm.stats?.currentStreak ?? 0);
    const longestStreak = Number(act?.streaks?.longest ?? vm.stats?.longestStreak ?? 0);

    // Build 53-week padded grid ending cleanly
    const dayMap = new Map(days.map((d) => [d.date, Number(d.count || 0)]));
    let cells = [];
    if (days.length) {
      const start = new Date(`${days[0].date}T00:00:00Z`);
      const padStart = start.getUTCDay();
      for (let i = 0; i < padStart; i++) cells.push(null);
      for (const d of days) cells.push(d);
    } else {
      const now = new Date();
      for (let i = 364; i >= 0; i--) {
        const dt = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
        cells.push({ date: dt, count: dayMap.get(dt) || 0 });
      }
    }

    const levelOf = (count) => (!count ? 0 : count >= 8 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : 1);

    // Month column indicators
    const monthsHtml = [];
    let lastMonth = "";
    for (let col = 0; col < 53; col++) {
      const firstInCol = cells[col * 7];
      if (firstInCol?.date) {
        const m = new Date(`${firstInCol.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
        if (m !== lastMonth) {
          monthsHtml.push(`<span style="grid-column:${col + 2}">${m}</span>`);
          lastMonth = m;
        }
      }
    }

    const currentYear = new Date().getUTCFullYear();
    const years = ["rolling", String(currentYear), String(currentYear - 1), String(currentYear - 2)];
    const yearLabel = state.activityYear === "rolling" ? "in the last year" : `in ${state.activityYear}`;

    return `
      <section class="dp-card">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("calendar")} Contribution Activity</h2>
          <select class="dp-select-sm" data-dp-action="change-activity-year" aria-label="Contribution year">
            ${years.map((y) => `<option value="${y}"${state.activityYear === y ? " selected" : ""}>${y === "rolling" ? "Last 12 months" : `Year: ${y}`}</option>`).join("")}
          </select>
        </div>
        <div class="dp-heatmap-shell">
          <div class="dp-heatmap-main">
            <p class="dp-heatmap-subtitle"><strong>${total}</strong> contributions ${yearLabel}</p>
            <div class="dp-heatmap-scroll">
              <div class="dp-heatmap-months">${monthsHtml.join("")}</div>
              <div class="dp-heatmap-body">
                <div class="dp-heatmap-weekdays"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>
                <div class="dp-heatmap-grid" role="grid" aria-label="Contribution activity grid">
                  ${cells
                    .map((cell) => {
                      if (!cell) return `<span style="width:13px;height:13px;display:inline-block;"></span>`;
                      const lv = levelOf(cell.count);
                      const sel = state.selectedDay === cell.date ? " selected" : "";
                      const label = `${cell.count} contribution${cell.count === 1 ? "" : "s"} on ${formatDayNice(cell.date)}`;
                      return `<button type="button" class="dp-heat-cell${sel}" data-level="${lv}" data-dp-day="${esc(cell.date)}" title="${esc(label)}" aria-label="${esc(label)}"></button>`;
                    })
                    .join("")}
                </div>
              </div>
            </div>
            <div class="dp-heatmap-legend">
              <span>Less</span>
              <i style="background:var(--dp-heat-0)"></i>
              <i style="background:var(--dp-heat-1)"></i>
              <i style="background:var(--dp-heat-2)"></i>
              <i style="background:var(--dp-heat-3)"></i>
              <i style="background:var(--dp-heat-4)"></i>
              <span>More</span>
            </div>
          </div>
          <div class="dp-streak-col">
            <div class="dp-streak-row">
              <span class="dp-streak-icon fire">${icon("flame")}</span>
              <div><strong>${currentStreak} Days</strong><span>Current Streak</span></div>
            </div>
            <div class="dp-streak-row">
              <span class="dp-streak-icon">${icon("trophy")}</span>
              <div><strong>${longestStreak} Days</strong><span>Longest Streak</span></div>
            </div>
            <div class="dp-streak-row">
              <span class="dp-streak-icon">${icon("calendar")}</span>
              <div><strong>${activeDays} Days</strong><span>Active Days</span></div>
            </div>
          </div>
        </div>
        ${state.selectedDay ? renderDayDrilldown() : ""}
      </section>
    `;
  }

  function renderDayDrilldown() {
    const items = state.selectedDayItems;
    return `
      <div class="dp-day-drilldown">
        <div class="dp-day-drilldown-head">
          <strong>Activity on ${esc(formatDayNice(state.selectedDay))}</strong>
          <button type="button" class="dp-btn dp-btn-sm" data-dp-action="close-day">Close</button>
        </div>
        ${items === null
          ? `<span class="dp-muted">Loading recorded contributions…</span>`
          : items.length === 0
            ? `<span class="dp-muted">No recorded contributions on this day.</span>`
            : `<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;">
                ${items.map((x) => `<li><strong>+${x.xp} XP</strong> · ${esc(x.title || x.type)}</li>`).join("")}
              </ul>`}
      </div>
    `;
  }

  // =========================================================================
  // Component: FeaturedProjects (2-column cards)
  // =========================================================================
  function renderProjectCard(project, idx, pinnedIds = []) {
    const isPinned = pinnedIds.includes(project.id);
    const thumbVariant = ["", "alt-1", "alt-2", "alt-3"][idx % 4];
    const demoUrl = safeHref(project.demoUrl || project.demo_url);
    const repoUrl = safeHref(project.repoUrl || project.repo_url);
    const stack = Array.isArray(project.techStack) ? project.techStack.slice(0, 4) : [];
    const stars = Number(project.votesCount ?? project.votes_count ?? 0);
    const bookmarks = Number(project.bookmarksCount ?? project.bookmarks_count ?? 0);
    const views = Number(project.viewsCount ?? project.views_count ?? 0);

    return `
      <article class="dp-project-card" data-project-id="${esc(project.id)}">
        <div class="dp-project-thumb ${thumbVariant}">
          ${isPinned ? `<span class="dp-project-pin-badge">Featured</span>` : ""}
          <div class="dp-project-thumb-mock">
            <small>${esc(project.category || "Project")}</small>
            <strong>${esc(project.title)}</strong>
          </div>
          ${icon("folderCode")}
        </div>
        <div class="dp-project-body">
          <div class="dp-project-title-row">
            <h3 class="dp-project-title">${esc(project.title)}</h3>
            ${demoUrl || repoUrl ? `<a class="dp-icon-edit" href="${esc(demoUrl || repoUrl)}" target="_blank" rel="noopener noreferrer" data-dp-track-view="${esc(project.id)}" title="Open Project">${icon("externalLink")}</a>` : ""}
          </div>
          <p class="dp-project-desc">${esc(project.description || "Built on Dev Harbour.")}</p>
          <div class="dp-project-tags">
            ${stack.length ? stack.map((t) => `<span class="dp-tag">${esc(t)}</span>`).join("") : `<span class="dp-tag">${esc(project.category || "Software")}</span>`}
          </div>
          <div class="dp-project-footer">
            <div class="dp-project-metrics">
              <span title="Stars / Likes">${icon("star")} ${stars}</span>
              <span title="Bookmarks">${icon("award")} ${bookmarks}</span>
              <span title="Views">${icon("eye")} ${views}</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              ${repoUrl ? `<a class="dp-link-action" href="${esc(repoUrl)}" target="_blank" rel="noopener noreferrer" data-dp-track-view="${esc(project.id)}">Code</a>` : ""}
              ${demoUrl ? `<a class="dp-link-action" href="${esc(demoUrl)}" target="_blank" rel="noopener noreferrer" data-dp-track-view="${esc(project.id)}">Live ${icon("externalLink")}</a>` : ""}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderFeaturedProjects(vm, maxCount = 4) {
    const isOwner = viewerIsOwner(vm);
    if (!vm.sections.projects) {
      return `<section class="dp-card" id="dp-projects-section"><div class="dp-section-head"><h2 class="dp-section-title">${icon("folderCode")} Featured Projects</h2></div><p class="dp-muted" style="margin:0;font-size:13.5px;">${icon("lock")} Projects are private.</p></section>`;
    }
    const list = (vm.projects || []).slice(0, maxCount);
    const pins = vm.profile.pins?.projects || [];
    return `
      <section class="dp-card" id="dp-projects-section">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("folderCode")} Featured Projects</h2>
          <div class="dp-section-actions">
            ${isOwner ? `<button type="button" class="dp-icon-edit" data-dp-action="manage-featured-projects" title="Pin or add projects">${icon("pencil")}</button>` : ""}
            <button type="button" class="dp-link-action" data-dp-tab="projects">View All Projects ${icon("arrowRight")}</button>
          </div>
        </div>
        ${list.length
          ? `<div class="dp-projects-grid">${list.map((p, idx) => renderProjectCard(p, idx, pins)).join("")}</div>`
          : `<div class="dp-empty-state">
              <p>${isOwner ? "Publish your first project to showcase your engineering work here." : "No public projects shared yet."}</p>
              ${isOwner ? `<button type="button" class="dp-btn dp-btn-primary dp-btn-sm" data-dp-action="open-add-project">${icon("plus")} Add Project</button>` : ""}
            </div>`}
      </section>
    `;
  }

  // =========================================================================
  // Component: Experience & Education Timelines
  // =========================================================================
  function renderExperienceSection(vm) {
    const isOwner = viewerIsOwner(vm);
    if (!vm.sections.experience) return "";
    const items = vm.experience || [];
    if (!items.length && !isOwner) return "";
    return `
      <section class="dp-card">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("briefcase")} Experience</h2>
          ${isOwner ? `<button type="button" class="dp-btn dp-btn-sm" data-dp-action="add-entry" data-kind="experience">${icon("plus")} Add Experience</button>` : ""}
        </div>
        ${items.length
          ? `<div class="dp-timeline">
              ${items
                .map((entry) => {
                  const d = entry.data || {};
                  const dateRange = [d.startDate, d.current ? "Present" : d.endDate].filter(Boolean).join(" – ");
                  return `<div class="dp-timeline-item">
                    <span class="dp-timeline-dot"></span>
                    <div class="dp-timeline-logo">${icon("briefcase")}</div>
                    <div class="dp-timeline-body">
                      <div class="dp-timeline-top">
                        <div>
                          <h3 class="dp-timeline-title">${esc(d.designation || "Developer")}</h3>
                          <div class="dp-timeline-sub">${esc(d.organization || "")}${d.type ? ` · ${esc(d.type)}` : ""}</div>
                          ${dateRange ? `<div class="dp-timeline-date">${icon("calendar")} ${esc(dateRange)}${d.location ? ` · ${esc(d.location)}` : ""}</div>` : ""}
                        </div>
                        ${isOwner ? `<div style="display:flex;gap:4px;">
                          <button type="button" class="dp-icon-edit" data-dp-action="edit-entry" data-entry-id="${esc(entry.id)}" title="Edit">${icon("pencil")}</button>
                          <button type="button" class="dp-icon-edit" data-dp-action="delete-entry" data-entry-id="${esc(entry.id)}" title="Delete">${icon("trash2")}</button>
                        </div>` : ""}
                      </div>
                      ${d.description ? `<p class="dp-timeline-desc">${esc(d.description)}</p>` : ""}
                    </div>
                  </div>`;
                })
                .join("")}
            </div>`
          : `<div class="dp-empty-state"><p>Add internships, freelance work, or open-source roles.</p><button type="button" class="dp-btn dp-btn-sm" data-dp-action="add-entry" data-kind="experience">${icon("plus")} Add Experience</button></div>`}
      </section>
    `;
  }

  function renderEducationSection(vm) {
    const isOwner = viewerIsOwner(vm);
    if (!vm.sections.education) return "";
    const items = vm.education || [];
    if (!items.length && !isOwner) return "";
    return `
      <section class="dp-card">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("graduationCap")} Education</h2>
          ${isOwner ? `<button type="button" class="dp-btn dp-btn-sm" data-dp-action="add-entry" data-kind="education">${icon("plus")} Add Education</button>` : ""}
        </div>
        ${items.length
          ? `<div class="dp-timeline">
              ${items
                .map((entry) => {
                  const d = entry.data || {};
                  const years = [d.startYear, d.current ? "Present" : d.endYear].filter(Boolean).join(" – ");
                  return `<div class="dp-timeline-item">
                    <span class="dp-timeline-dot"></span>
                    <div class="dp-timeline-logo">${icon("graduationCap")}</div>
                    <div class="dp-timeline-body">
                      <div class="dp-timeline-top">
                        <div>
                          <h3 class="dp-timeline-title">${esc(d.institution || "Institution")}</h3>
                          <div class="dp-timeline-sub">${esc([d.degree, d.field].filter(Boolean).join(" · "))}</div>
                          ${years ? `<div class="dp-timeline-date">${icon("calendar")} ${esc(years)}${d.grade ? ` · Grade: ${esc(d.grade)}` : ""}</div>` : ""}
                        </div>
                        ${isOwner ? `<div style="display:flex;gap:4px;">
                          <button type="button" class="dp-icon-edit" data-dp-action="edit-entry" data-entry-id="${esc(entry.id)}" title="Edit">${icon("pencil")}</button>
                          <button type="button" class="dp-icon-edit" data-dp-action="delete-entry" data-entry-id="${esc(entry.id)}" title="Delete">${icon("trash2")}</button>
                        </div>` : ""}
                      </div>
                      ${d.description ? `<p class="dp-timeline-desc">${esc(d.description)}</p>` : ""}
                    </div>
                  </div>`;
                })
                .join("")}
            </div>`
          : `<div class="dp-empty-state"><p>Add your school, college, or university education.</p><button type="button" class="dp-btn dp-btn-sm" data-dp-action="add-entry" data-kind="education">${icon("plus")} Add Education</button></div>`}
      </section>
    `;
  }

  // =========================================================================
  // Component: Certificates & Achievements Showcases
  // =========================================================================
  function renderCertificatesSection(vm, maxCount = 3) {
    const isOwner = viewerIsOwner(vm);
    if (!vm.sections.certificates) return "";
    const list = (vm.certificates || []).slice(0, maxCount);
    if (!list.length && !isOwner) return "";
    return `
      <section class="dp-card">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("fileBadge")} Certificates <span class="dp-muted" style="font-weight:500;">(${vm.certificates?.length || 0})</span></h2>
          <div class="dp-section-actions">
            ${isOwner ? `<button type="button" class="dp-icon-edit" data-dp-action="manage-certificates" title="Add or manage certificates">${icon("pencil")}</button>` : ""}
            <button type="button" class="dp-link-action" data-dp-tab="certificates">View All ${icon("arrowRight")}</button>
          </div>
        </div>
        ${list.length
          ? `<div class="dp-cert-list">
              ${list
                .map((c) => {
                  const verifyUrl = safeHref(c.verificationUrl || (c.source === "platform" && c.id ? `/verify-certificate?id=${encodeURIComponent(c.id)}` : ""));
                  return `<div class="dp-cert-row">
                    <div class="dp-cert-left">
                      <div class="dp-cert-thumb"><span>CERTIFICATE</span><span>DEV HARBOUR</span></div>
                      <div class="dp-cert-meta">
                        <h4>${esc(c.title || "Developer Credential")}</h4>
                        <p>${esc(c.issuer || "Dev Harbour")} · Issued ${esc(c.issueDate || "Verified")} · Credential ID: ${esc(c.id)}</p>
                      </div>
                    </div>
                    <div class="dp-cert-right">
                      <span class="dp-verified-pill">${icon("checkCircle")} Verified</span>
                      ${verifyUrl ? `<a class="dp-btn dp-btn-sm" href="${esc(verifyUrl)}" target="${verifyUrl.startsWith("/") ? "_self" : "_blank"}" rel="noopener noreferrer">Verify ${icon("externalLink")}</a>` : ""}
                    </div>
                  </div>`;
                })
                .join("")}
            </div>`
          : `<div class="dp-empty-state"><p>Showcase verified Dev Harbour credentials or external certifications.</p><button type="button" class="dp-btn dp-btn-sm" data-dp-action="manage-certificates">${icon("plus")} Add Certificate</button></div>`}
      </section>
    `;
  }

  function renderAchievementsSection(vm, maxCount = 6) {
    const isOwner = viewerIsOwner(vm);
    if (!vm.sections.achievements) return "";
    const list = (vm.achievements || []).slice(0, maxCount);
    if (!list.length && !isOwner) return "";
    const badgeIcon = (k) => {
      const s = String(k || "").toLowerCase();
      if (s.includes("streak") || s.includes("fire")) return "flame";
      if (s.includes("project") || s.includes("ship")) return "folderCode";
      if (s.includes("book") || s.includes("learn") || s.includes("lesson")) return "bookOpen";
      if (s.includes("code") || s.includes("solve")) return "code2";
      return "trophy";
    };
    return `
      <section class="dp-card">
        <div class="dp-section-head">
          <h2 class="dp-section-title">${icon("trophy")} Achievements &amp; Badges <span class="dp-muted" style="font-weight:500;">(${vm.achievements?.length || 0})</span></h2>
          <button type="button" class="dp-link-action" data-dp-tab="achievements">View All ${icon("arrowRight")}</button>
        </div>
        ${list.length
          ? `<div class="dp-badges-grid">
              ${list
                .map((b) => {
                  const rarity = ["gold", "silver", "bronze"].includes(b.badgeType) ? b.badgeType : "";
                  const unlocked = b.unlockedAt ? `Unlocked ${formatDateShort(b.unlockedAt)}` : "";
                  const tip = [b.description, b.xpBonus ? `+${b.xpBonus} XP` : "", unlocked].filter(Boolean).join(" · ");
                  return `<div class="dp-badge-tile" title="${esc(tip)}">
                    <div class="dp-badge-emblem ${rarity}">${icon(badgeIcon(b.badgeIcon || b.key || b.title))}</div>
                    <span class="dp-badge-title">${esc(b.title)}</span>
                    <span class="dp-badge-sub">${b.xpBonus ? `+${b.xpBonus} XP` : esc(unlocked)}</span>
                  </div>`;
                })
                .join("")}
            </div>`
          : `<div class="dp-empty-state"><p>Complete coding challenges, learning modules, and projects to unlock achievements.</p></div>`}
      </section>
    `;
  }

  // =========================================================================
  // Tab Renderers (Projects, Coding, Learning, Achievements, Certificates, Activity)
  // =========================================================================
  function renderTabBody(vm, tabData) {
    const isOwner = viewerIsOwner(vm);

    if (state.activeTab === "overview") {
      return `
        <div class="dp-overview-grid">
          ${renderSidebar(vm)}
          <div class="dp-main-stack">
            ${renderHeatmapSection(vm)}
            ${renderFeaturedProjects(vm, 4)}
            ${renderExperienceSection(vm)}
            ${renderEducationSection(vm)}
            ${renderCertificatesSection(vm, 3)}
            ${renderAchievementsSection(vm, 6)}
          </div>
        </div>
      `;
    }

    if (tabData === "__loading") {
      return `<section class="dp-card"><p class="dp-muted" style="margin:0;">Loading section…</p></section>`;
    }

    if (state.activeTab === "projects") {
      if (!vm.sections.projects) {
        return `<section class="dp-card"><p class="dp-muted" style="margin:0;">${icon("lock")} Projects are private for this profile.</p></section>`;
      }
      const projects = tabData?.projects || vm.projects || [];
      const cats = ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))];
      const q = state.projectSearch.trim().toLowerCase();
      const filtered = projects.filter(
        (p) =>
          (state.projectCategory === "All" || p.category === state.projectCategory) &&
          (!q || `${p.title} ${p.description} ${(p.techStack || []).join(" ")}`.toLowerCase().includes(q)),
      );
      const pins = vm.profile.pins?.projects || [];
      return `
        <section class="dp-card">
          <div class="dp-section-head">
            <h2 class="dp-section-title">${icon("folderCode")} Projects (${projects.length})</h2>
            <div class="dp-section-actions">
              <select class="dp-select-sm" data-dp-action="filter-project-cat">
                ${cats.map((c) => `<option value="${esc(c)}"${state.projectCategory === c ? " selected" : ""}>${esc(c)}</option>`).join("")}
              </select>
              <input class="dp-select-sm" type="search" placeholder="Filter projects…" value="${esc(state.projectSearch)}" data-dp-action="search-project">
              ${isOwner ? `<button type="button" class="dp-btn dp-btn-primary dp-btn-sm" data-dp-action="open-add-project">${icon("plus")} Publish Project</button>` : ""}
            </div>
          </div>
          ${filtered.length
            ? `<div class="dp-projects-grid">${filtered.map((p, i) => renderProjectCard(p, i, pins)).join("")}</div>`
            : `<div class="dp-empty-state"><p>No projects match this filter.</p></div>`}
        </section>
      `;
    }

    if (state.activeTab === "coding") {
      if (!vm.sections.statistics) {
        return `<section class="dp-card"><p class="dp-muted" style="margin:0;">${icon("lock")} Coding analytics are private.</p></section>`;
      }
      const coding = tabData?.coding;
      const diffRows = coding?.difficulty || [];
      const totalSolved = diffRows.reduce((s, r) => s + Number(r.solved || 0), 0) || vm.stats?.problems || 0;
      const langs = coding?.languages || [];
      const maxLang = Math.max(1, ...langs.map((l) => Number(l.submissions || 0)));
      const topics = coding?.topics || [];
      const recent = coding?.recent || [];

      return `
        <div class="dp-two-col">
          <section class="dp-card">
            <div class="dp-section-head"><h2 class="dp-section-title">${icon("code2")} Problem Solving Breakdown</h2></div>
            <p class="dp-muted" style="font-size:13px;margin-top:-6px;"><strong>${totalSolved}</strong> distinct coding problems solved · ${vm.stats?.acceptanceRate || 0}% recorded pass rate</p>
            ${["Easy", "Medium", "Hard"]
              .map((lvl) => {
                const count = Number(diffRows.find((r) => String(r.difficulty).toLowerCase() === lvl.toLowerCase())?.solved || 0);
                const pct = totalSolved ? Math.round((count / totalSolved) * 100) : 0;
                return `<div class="dp-progress-row"><div class="dp-progress-label"><span>${lvl}</span><span>${count} solved</span></div><div class="dp-progress-track"><div class="dp-progress-fill" style="width:${pct}%"></div></div></div>`;
              })
              .join("")}
            <p class="dp-muted" style="font-size:12px;margin:14px 0 0;">${esc(coding?.notice || "Statistics reflect verified submission records.")}</p>
          </section>
          <section class="dp-card">
            <div class="dp-section-head"><h2 class="dp-section-title">${icon("layers")} Languages &amp; Topics</h2></div>
            ${langs.length
              ? langs
                  .map((l) => {
                    const c = Number(l.submissions || 0);
                    return `<div class="dp-progress-row"><div class="dp-progress-label"><span>${esc(l.language || "JavaScript")}</span><span>${c} runs</span></div><div class="dp-progress-track"><div class="dp-progress-fill" style="width:${Math.round((c / maxLang) * 100)}%"></div></div></div>`;
                  })
                  .join("")
              : `<p class="dp-muted" style="font-size:13px;">No recorded language submissions yet.</p>`}
            ${topics.length ? `<div class="dp-skills-wrap" style="margin-top:14px;">${topics.map((t) => `<span class="dp-skill-pill">${esc(t.topic)} · ${t.solved}</span>`).join("")}</div>` : ""}
          </section>
        </div>
        ${renderSkillRadarCard(vm.skills)}
        ${recent.length
          ? `<section class="dp-card" style="margin-top:20px;">
              <div class="dp-section-head"><h2 class="dp-section-title">${icon("activity")} Recent Recorded Submissions</h2></div>
              <div style="overflow-x:auto;"><table class="dp-table"><thead><tr><th>Challenge</th><th>Status</th><th>Language</th><th>Date</th></tr></thead><tbody>
                ${recent.map((r) => `<tr><td><strong>${esc(r.title)}</strong></td><td>${esc(r.status)}</td><td>${esc(r.language)}</td><td>${esc(formatDayNice(String(r.created_at).slice(0, 10)))}</td></tr>`).join("")}
              </tbody></table></div>
            </section>`
          : ""}
      `;
    }

    if (state.activeTab === "learning") {
      if (!vm.sections.learning) {
        return `<section class="dp-card"><p class="dp-muted" style="margin:0;">${icon("lock")} Learning milestones are private.</p></section>`;
      }
      const list = tabData?.learning || vm.learning || [];
      return `
        <section class="dp-card">
          <div class="dp-section-head">
            <h2 class="dp-section-title">${icon("bookOpen")} Learning Milestones</h2>
            ${!isOwner && !vm.profile.details?.shareInProgressLearning ? `<span class="dp-badge-pill">Completed Courses Only</span>` : ""}
          </div>
          ${list.length
            ? `<div class="dp-two-col">
                ${list
                  .map((c) => {
                    const tot = Number(c.total_lessons || 0);
                    const done = Number(c.completed_lessons || 0);
                    const pct = tot ? Math.round((done / tot) * 100) : 0;
                    const mins = Math.round(Number(c.reading_seconds || 0) / 60);
                    return `<div class="dp-card" style="padding:18px;box-shadow:none;">
                      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:8px;">
                        <div><strong style="font-size:14.5px;">${esc(c.title)}</strong><div class="dp-muted" style="font-size:12px;">${esc(c.category)} · ${mins} mins read</div></div>
                        ${c.completed ? `<span class="dp-verified-pill">Completed</span>` : `<span class="dp-tag">${pct}%</span>`}
                      </div>
                      <div class="dp-progress-track"><div class="dp-progress-fill" style="width:${pct}%"></div></div>
                      <div class="dp-muted" style="font-size:12px;margin-top:6px;">${done} of ${tot} lessons completed</div>
                    </div>`;
                  })
                  .join("")}
              </div>`
            : `<div class="dp-empty-state"><p>${isOwner ? "Complete lessons in Learn paths to track your progress." : "No completed courses shared publicly yet."}</p></div>`}
        </section>
      `;
    }

    if (state.activeTab === "achievements") {
      const list = tabData?.achievements || vm.achievements || [];
      return renderAchievementsSection({ ...vm, achievements: list }, 100);
    }

    if (state.activeTab === "certificates") {
      const list = tabData?.certificates || vm.certificates || [];
      return renderCertificatesSection({ ...vm, certificates: list }, 100);
    }

    if (state.activeTab === "activity") {
      if (!vm.sections.activity) {
        return `<section class="dp-card"><p class="dp-muted" style="margin:0;">${icon("lock")} Activity timeline is private.</p></section>`;
      }
      const tl = tabData?.timeline || { items: [], nextCursor: null };
      const items = tl.items || [];
      return `
        ${renderHeatmapSection({ ...vm, activity: tabData?.activity || vm.activity })}
        <section class="dp-card" style="margin-top:20px;">
          <div class="dp-section-head">
            <h2 class="dp-section-title">${icon("activity")} Chronological Activity</h2>
            <select class="dp-select-sm" data-dp-action="filter-timeline-type">
              ${[["all", "All Activity"], ["coding", "Coding"], ["projects", "Projects"], ["learning", "Learning"], ["badges", "Achievements"]]
                .map(([k, lbl]) => `<option value="${k}"${state.timelineType === k ? " selected" : ""}>${lbl}</option>`)
                .join("")}
            </select>
          </div>
          ${items.length
            ? `<div class="dp-timeline-feed">
                ${items
                  .map(
                    (it) => `<div class="dp-feed-row">
                      <div><strong>${esc(it.title)}</strong><div class="dp-muted" style="font-size:12px;">${esc(formatDayNice(String(it.date).slice(0, 10)))} · ${esc(String(it.type || "").replace(/_/g, " "))}</div></div>
                      <span class="dp-badge-pill">+${Number(it.xp || 0)} XP</span>
                    </div>`,
                  )
                  .join("")}
              </div>
              ${tl.nextCursor ? `<div style="margin-top:16px;text-align:center;"><button type="button" class="dp-btn" data-dp-action="load-more-timeline" data-cursor="${esc(tl.nextCursor)}">Load Older Activity</button></div>` : ""}`
            : `<div class="dp-empty-state"><p>No recorded activity events in this filter.</p></div>`}
        </section>
      `;
    }
    return "";
  }

  function renderSkillRadarCard(skills = []) {
    if (!skills.length) return "";
    const scores = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
    const byCat = new Map();
    for (const s of skills) {
      byCat.set(s.category, Math.max(byCat.get(s.category) || 0, scores[s.proficiency] || 1));
    }
    const cats = [...byCat.entries()].slice(0, 8);
    if (cats.length < 3) return "";
    const cx = 140, cy = 130, rMax = 88;
    const pts = cats
      .map(([, val], i) => {
        const ang = (Math.PI * 2 * i) / cats.length - Math.PI / 2;
        const r = (val / 4) * rMax;
        return `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
      })
      .join(" ");
    const labels = cats
      .map(([cat], i) => {
        const ang = (Math.PI * 2 * i) / cats.length - Math.PI / 2;
        const lx = (cx + Math.cos(ang) * (rMax + 20)).toFixed(1);
        const ly = (cy + Math.sin(ang) * (rMax + 14)).toFixed(1);
        return `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="10" fill="#777384">${esc(cat.split(" ")[0])}</text>`;
      })
      .join("");
    return `
      <section class="dp-card" style="margin-top:20px;">
        <div class="dp-section-head"><h2 class="dp-section-title">${icon("sparkles")} Skill Matrix (Self-Reported)</h2></div>
        <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;">
          <svg viewBox="0 0 280 260" width="260" height="240" aria-label="Skill category radar">
            ${[1, 2, 3, 4].map((lv) => `<circle cx="${cx}" cy="${cy}" r="${(lv / 4) * rMax}" fill="none" stroke="#E8E3F2" stroke-dasharray="3 3"/>`).join("")}
            <polygon points="${pts}" fill="rgba(146,112,212,0.22)" stroke="#9270D4" stroke-width="2"/>
            ${labels}
          </svg>
          <div class="dp-skills-wrap" style="flex:1;">
            ${skills.map((s) => `<span class="dp-skill-pill">${esc(s.name)} <small class="dp-muted">· ${esc(s.proficiency)}</small></span>`).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function viewerIsOwner(vm) {
    return Boolean(vm?.viewerConnection?.isOwner && !state.visitorPreview);
  }

  // =========================================================================
  // Data Loading & View Model Assembly
  // =========================================================================
  async function fetchViewModel() {
    await ensureConfig();
    const viewer = getViewer();
    const isSignedIn = Boolean(viewer && getToken());

    // Public profile mode (/u/:username OR ?developer=... OR previewing as visitor)
    const targetUsername = state.targetUsername || (state.visitorPreview ? viewer?.username : null);
    if (state.mode === "public" || targetUsername) {
      const qs = new URLSearchParams();
      if (state.visitorPreview) qs.set("asVisitor", "1");
      const data = await api(`/public/${encodeURIComponent(targetUsername)}${qs.toString() ? "?" + qs.toString() : ""}`);
      if (data.previewPrivate) return data;
      const [avatarUrl, coverUrl] = await Promise.all([
        data.media?.avatarMediaId ? resolveMediaUrl(data.media.avatarMediaId) : "",
        data.media?.coverMediaId ? resolveMediaUrl(data.media.coverMediaId) : "",
      ]);
      return {
        ...data,
        resolvedAvatarUrl: avatarUrl,
        resolvedCoverUrl: coverUrl,
      };
    }

    // Signed-out /profile directory fallback
    if (!isSignedIn) {
      return { signedOut: true };
    }

    // Owner view (/profile)
    const [me, ov, projects, act, certs, achs] = await Promise.all([
      api("/me"),
      api("/me/progress/overview").catch(() => ({ data: {} })),
      api("/me/progress/projects").catch(() => ({ data: [] })),
      api(`/me/activity?year=${encodeURIComponent(state.activityYear)}`).catch(() => null),
      api("/me/progress/certificates").catch(() => ({ data: [] })),
      api("/me/progress/achievements").catch(() => ({ data: [] })),
    ]);
    state.meData = me;
    const allSections = Object.fromEntries((state.config?.sections || []).map((k) => [k, true]));
    const avatarMedia = (me.uploads || []).find((u) => u.kind === "avatar");
    const coverMedia = (me.uploads || []).find((u) => u.kind === "cover");
    const [resolvedAvatarUrl, resolvedCoverUrl] = await Promise.all([
      avatarMedia ? resolveMediaUrl(avatarMedia.id) : "",
      coverMedia ? resolveMediaUrl(coverMedia.id) : "",
    ]);

    const entries = me.entries || [];
    const extCerts = entries
      .filter((e) => e.kind === "external-certificate")
      .map((e) => ({
        id: e.id,
        title: e.data.title,
        issuer: e.data.issuer,
        issueDate: e.data.issueDate,
        verificationUrl: e.data.credentialUrl,
        status: "valid",
        source: "external",
      }));
    const platCerts = (certs.data || []).filter((c) => String(c.status || "").toLowerCase() === "valid");
    const achievements = (achs.data || []).map((a) => ({
      id: a.id,
      key: a.key || a.id,
      title: a.title,
      description: a.description,
      badgeIcon: a.badge_icon || a.icon || "trophy",
      badgeType: a.badge_type || "bronze",
      xpBonus: Number(a.xp_bonus || 50),
      unlockedAt: a.unlocked_at,
    }));
    const hasValidCert = platCerts.length > 0;
    const pins = me.profile.pins || {};
    const resumeMedia = (me.uploads || []).find((u) => u.kind === "resume");

    return {
      user: {
        id: me.user.id,
        username: me.user.username,
        fullName: me.user.fullName,
        avatarUrl: me.user.avatarUrl || "",
        city: me.profile.city || "",
        state: me.profile.state || "",
        country: me.profile.country || "",
        college: me.profile.college || "",
        company: me.profile.company || "",
        title: me.profile.title || "",
        memberSince: me.user.memberSince,
        verified: Boolean(me.user.emailVerified && hasValidCert),
        emailVerified: Boolean(me.user.emailVerified),
      },
      profile: me.profile,
      entries,
      bio: me.user.bio || "",
      links: me.profile.links || {},
      skills: me.skills || [],
      education: entries.filter((e) => e.kind === "education"),
      experience: entries.filter((e) => e.kind === "experience"),
      followers: me.connections?.followers || 0,
      following: me.connections?.following || 0,
      stats: ov.data || {},
      projects: projects.data || [],
      activity: act,
      certificates: [...platCerts, ...extCerts],
      achievements,
      resume: resumeMedia ? { id: resumeMedia.id, label: resumeMedia.label, downloadAllowed: true } : null,
      developerId: me.profile.details?.showDeveloperId !== false
        ? { code: "DH-" + String(me.user.id || "").replace(/^usr-/i, "").toUpperCase(), showQrCode: me.profile.details?.showQrCode !== false }
        : null,
      sections: allSections,
      viewerConnection: { isOwner: true, isVisitorPreview: false },
      resolvedAvatarUrl,
      resolvedCoverUrl,
      pins,
    };
  }

  async function loadTabData(vm) {
    const tab = state.activeTab;
    if (tab === "overview") return null;
    const uname = vm.user.username;
    const key = `${uname}:${state.visitorPreview ? "v" : "o"}:${tab}:${tab === "activity" ? `${state.activityYear}:${state.timelineType}` : ""}`;
    if (state.tabCache[key]) return state.tabCache[key];

    const isOwner = viewerIsOwner(vm);
    if (tab === "coding" && isOwner) {
      const res = await api("/me/progress/coding");
      state.tabCache[key] = { coding: res.data };
      return state.tabCache[key];
    }
    if (tab === "learning" && isOwner) {
      const res = await api("/me/progress/learning");
      state.tabCache[key] = { learning: res.data };
      return state.tabCache[key];
    }
    if (tab === "activity" && isOwner) {
      const tFilter = state.timelineType !== "all" ? `&type=${encodeURIComponent(state.timelineType)}` : "";
      const [activity, timeline] = await Promise.all([
        api(`/me/activity?year=${encodeURIComponent(state.activityYear)}`),
        api(`/me/timeline?limit=20${tFilter}`),
      ]);
      state.tabCache[key] = { activity, timeline };
      return state.tabCache[key];
    }
    const qs = new URLSearchParams();
    if (state.visitorPreview) qs.set("asVisitor", "1");
    if (tab === "activity") {
      qs.set("year", state.activityYear);
      if (state.timelineType !== "all") qs.set("type", state.timelineType);
    }
    const res = await api(`/public/${encodeURIComponent(uname)}/tab/${tab}?${qs.toString()}`);
    state.tabCache[key] = res;
    return res;
  }

  // Navigation and account updates may both request a forced refresh. Only one
  // profile load should be in flight; replay navigation only when its target changes.
  let activeProfileRenderKey = null;
  let queuedProfileRenderKey = null;
  function profileRenderKey() {
    return JSON.stringify([
      state.mode, state.targetUsername, state.visitorPreview, state.activeTab,
      state.activityYear, state.timelineType,
    ]);
  }

  async function renderDeveloperProfile(forceRefresh = false) {
    // Respect the server's cooldown, including queued navigation refreshes.
    if (Date.now() < state.profileRetryAt) return;
    const renderKey = profileRenderKey();
    if (state.loading) {
      if (renderKey !== activeProfileRenderKey) queuedProfileRenderKey = renderKey;
      return;
    }
    activeProfileRenderKey = renderKey;
    state.loading = true;
    state.error = null;
    root.innerHTML = `<div class="dp-wrap"><div class="dp-card"><p class="dp-muted" style="margin:0;">Loading developer profile…</p></div></div>`;

    try {
      const vm = await fetchViewModel();
      if (vm.signedOut) {
        await renderSignedOutProfileHub();
        return;
      }
      if (vm.previewPrivate) {
        root.innerHTML = `
          <div class="dp-wrap">
            <div class="dp-preview-banner">
              <div class="dp-preview-banner-left"><span class="dp-preview-pill">${icon("eye")} Visitor Preview</span><span>Your profile visibility is set to <strong>${esc(vm.visibility)}</strong>.</span></div>
              <div class="dp-preview-actions">
                <button type="button" class="dp-btn dp-btn-sm" data-dp-action="go-settings-privacy">Open Privacy Settings</button>
                <button type="button" class="dp-btn dp-btn-primary dp-btn-sm" data-dp-action="exit-visitor-preview">Exit Visitor View</button>
              </div>
            </div>
            <section class="dp-card" style="text-align:center;padding:48px 24px;">
              <div style="width:52px;height:52px;margin:0 auto 14px;border-radius:14px;background:var(--dp-lavender-soft);color:var(--dp-lavender);display:grid;place-items:center;">${icon("lock")}</div>
              <h2 style="margin:0 0 8px;">This Developer Profile Is Private</h2>
              <p class="dp-muted" style="max-width:460px;margin:0 auto 20px;">Public visitors and non-followers cannot view <strong>@${esc(vm.user.username)}</strong> right now because your profile visibility is set to <strong>${esc(vm.visibility)}</strong>.</p>
              <button type="button" class="dp-btn dp-btn-primary" data-dp-action="go-settings-privacy">${icon("shield")} Manage Privacy Settings</button>
            </section>
          </div>
        `;
        return;
      }

      state.publicData = vm;
      let tabData = null;
      if (state.activeTab !== "overview") {
        root.innerHTML = buildProfileShell(vm, "__loading");
        try {
          tabData = await loadTabData(vm);
        } catch {
          tabData = null;
        }
      }
      root.innerHTML = buildProfileShell(vm, tabData);
    } catch (err) {
      const rateLimited = err.status === 429;
      const retrySeconds = rateLimited ? Math.max(1, err.retryAfter || 60) : 0;
      if (rateLimited) state.profileRetryAt = Date.now() + retrySeconds * 1000;
      const explanation = rateLimited
        ? `Too many requests. Please wait ${retrySeconds} seconds before retrying.`
        : err.message || "This developer profile is private or could not be found.";
      root.innerHTML = `
        <div class="dp-wrap">
          <section class="dp-card" style="text-align:center;padding:48px 24px;">
            <div style="width:52px;height:52px;margin:0 auto 14px;border-radius:14px;background:var(--dp-lavender-soft);color:var(--dp-lavender);display:grid;place-items:center;">${icon("lock")}</div>
            <h2 style="margin:0 0 8px;">${rateLimited ? "Profile Temporarily Unavailable" : "Profile Unavailable"}</h2>
            <p class="dp-muted" style="max-width:440px;margin:0 auto 20px;">${esc(explanation)}</p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
              <button type="button" class="dp-btn" data-dp-action="go-home">${icon("home")} Go to Dashboard</button>
              <button type="button" class="dp-btn dp-btn-primary" data-dp-action="retry-profile">${icon("activity")} Retry Profile</button>
            </div>
          </section>
        </div>
      `;
    } finally {
      state.loading = false;
      activeProfileRenderKey = null;
      if (queuedProfileRenderKey) {
        queuedProfileRenderKey = null;
        void renderDeveloperProfile(true);
      }
    }
  }

  function buildProfileShell(vm, tabData) {
    const banner = state.visitorPreview
      ? `<div class="dp-preview-banner">
          <div class="dp-preview-banner-left"><span class="dp-preview-pill">${icon("eye")} Visitor Preview</span><span>Viewing your profile exactly as public visitors see it (${esc(vm.profile.visibility)}).</span></div>
          <div class="dp-preview-actions">
            <button type="button" class="dp-btn dp-btn-sm" data-dp-action="go-settings-privacy">Privacy Settings</button>
            <button type="button" class="dp-btn dp-btn-primary dp-btn-sm" data-dp-action="exit-visitor-preview">Exit Visitor View</button>
          </div>
        </div>`
      : "";
    return `
      <div class="dp-wrap">
        ${banner}
        ${renderHeaderCard(vm)}
        ${renderTabs(vm)}
        ${renderTabBody(vm, tabData)}
      </div>
    `;
  }

  // =========================================================================
  // Developer Discovery Hub (when signed out on /profile or browsing directory)
  // =========================================================================
  async function renderSignedOutProfileHub(searchQuery = "") {
    let developers = [];
    try {
      const res = await api(`/discover${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`);
      developers = res.developers || [];
    } catch {}
    const viewer = getViewer();
    root.innerHTML = `
      <div class="dp-wrap">
        ${!viewer ? `
          <section class="dp-card" style="display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;">
            <div>
              <span class="dp-badge-pill">Dev Harbour Portfolio</span>
              <h1 style="margin:8px 0 6px;font-size:24px;">Create Your Public Developer Profile</h1>
              <p class="dp-muted" style="margin:0;max-width:56ch;">Showcase verified coding progress, featured projects, certificates, and skills at <code>devharbour.in/u/yourname</code>.</p>
            </div>
            <div style="display:flex;gap:10px;">
              <button type="button" class="dp-btn" onclick="openAuthModal('login')">Sign In</button>
              <button type="button" class="dp-btn dp-btn-primary" onclick="openAuthModal('signup')">Create Account</button>
            </div>
          </section>` : ""}
        <section class="dp-card">
          <div class="dp-section-head">
            <h2 class="dp-section-title">${icon("search")} Developer Directory</h2>
            <input id="dp-dir-search-input" class="dp-select-sm" style="min-width:240px;" type="search" placeholder="Search by name, @username, skill, or city…" value="${esc(searchQuery)}">
          </div>
          ${developers.length
            ? `<div class="dp-dir-grid">
                ${developers
                  .map((d) => {
                    const name = d.user?.fullName || d.user?.username || "Developer";
                    const uname = d.user?.username || "";
                    const av = safeHref(d.user?.avatarUrl);
                    return `<a class="dp-dir-card" href="/u/${encodeURIComponent(uname)}" data-dp-profile-link="${esc(uname)}">
                      <div style="display:flex;align-items:center;gap:12px;">
                        <div class="dp-avatar" style="width:48px;height:48px;font-size:18px;border:2px solid var(--dp-border);box-shadow:none;">${av ? `<img src="${esc(av)}" alt="${esc(name)}">` : esc(name[0].toUpperCase())}</div>
                        <div style="min-width:0;">
                          <strong style="display:block;font-size:15px;">${esc(name)}</strong>
                          <span class="dp-muted" style="font-size:12.5px;">@${esc(uname)}${d.location ? ` · ${esc(d.location)}` : ""}</span>
                        </div>
                      </div>
                      ${d.headline ? `<p class="dp-muted" style="margin:0;font-size:13px;line-height:1.45;">${esc(d.headline)}</p>` : ""}
                      ${(d.skills || []).length ? `<div class="dp-skills-wrap">${d.skills.slice(0, 4).map((sk) => `<span class="dp-tag">${esc(sk)}</span>`).join("")}</div>` : ""}
                    </a>`;
                  })
                  .join("")}
              </div>`
            : `<div class="dp-empty-state"><p>No public developers match that search yet.</p></div>`}
        </section>
      </div>
    `;
    const input = document.getElementById("dp-dir-search-input");
    if (input) {
      let timer = null;
      input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => renderSignedOutProfileHub(input.value.trim()), 260);
      });
    }
  }

  // =========================================================================
  // Owner Modals (Lightweight editing without cluttering profile surface)
  // =========================================================================
  function openModal(title, bodyHtml, onMount) {
    closeModal();
    const wrap = document.createElement("div");
    wrap.className = "dp-modal-backdrop";
    wrap.id = "dp-active-modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.innerHTML = `
      <div class="dp-modal-card">
        <div class="dp-modal-head">
          <h3>${esc(title)}</h3>
          <button type="button" class="dp-icon-edit" data-dp-close-modal aria-label="Close">✕</button>
        </div>
        ${bodyHtml}
      </div>
    `;
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.closest("[data-dp-close-modal]")) closeModal();
    });
    document.body.appendChild(wrap);
    if (typeof onMount === "function") onMount(wrap);
  }

  function closeModal() {
    document.getElementById("dp-active-modal")?.remove();
  }

  async function openQuickEditAboutModal() {
    const me = state.meData || (await api("/me"));
    const p = me.profile;
    openModal(
      "Edit Profile Info",
      `<form id="dp-form-about" class="dp-form-grid">
        <div class="dp-field"><label>Full Name</label><input name="fullName" required minlength="2" maxlength="70" value="${esc(me.user.fullName || "")}"></div>
        <div class="dp-field"><label>Username</label><input name="username" required minlength="3" maxlength="30" value="${esc(me.user.username || "")}"></div>
        <div class="dp-field dp-field-full"><label>Headline</label><input name="headline" maxlength="160" placeholder="e.g. Full Stack Developer · Problem Solver" value="${esc(p.headline || "")}"></div>
        <div class="dp-field dp-field-full"><label>Bio</label><textarea name="bio" rows="3" maxlength="500" placeholder="What do you build and enjoy solving?">${esc(me.user.bio || "")}</textarea></div>
        <div class="dp-field"><label>City</label><input name="city" maxlength="80" value="${esc(p.city || "")}"></div>
        <div class="dp-field"><label>Country</label><input name="country" maxlength="80" value="${esc(p.country || "")}"></div>
        <div class="dp-field"><label>College / University</label><input name="college" maxlength="160" value="${esc(p.college || "")}"></div>
        <div class="dp-field"><label>Current Company / Org</label><input name="company" maxlength="160" value="${esc(p.company || "")}"></div>
        <div class="dp-field dp-field-full">
          <label class="dp-check-row"><span>Open to Work</span><input type="checkbox" name="openToWork" ${p.details?.openToWork ? "checked" : ""}></label>
          <label class="dp-check-row"><span>Open to Internships</span><input type="checkbox" name="openToInternship" ${p.details?.openToInternship ? "checked" : ""}></label>
          <label class="dp-check-row"><span>Open to Collaborate</span><input type="checkbox" name="collaboration" ${p.details?.collaboration ? "checked" : ""}></label>
        </div>
        <div class="dp-modal-foot dp-field-full">
          <span class="dp-status-text" id="dp-modal-status"></span>
          <div style="display:flex;gap:8px;">
            <button type="button" class="dp-btn" data-dp-action="go-settings-profile">All Settings</button>
            <button type="submit" class="dp-btn dp-btn-primary">Save</button>
          </div>
        </div>
      </form>`,
      (el) => {
        el.querySelector("#dp-form-about").onsubmit = async (e) => {
          e.preventDefault();
          const st = el.querySelector("#dp-modal-status");
          const fd = new FormData(e.target);
          st.className = "dp-status-text";
          st.textContent = "Saving…";
          try {
            const loc = [fd.get("city"), fd.get("country")].filter(Boolean).join(", ");
            await api("/me", {
              method: "PATCH",
              body: {
                version: p.version,
                headline: fd.get("headline"),
                city: fd.get("city"),
                country: fd.get("country"),
                college: fd.get("college"),
                company: fd.get("company"),
                details: {
                  openToWork: el.querySelector("[name=openToWork]").checked,
                  openToInternship: el.querySelector("[name=openToInternship]").checked,
                  collaboration: el.querySelector("[name=collaboration]").checked,
                },
                account: {
                  fullName: fd.get("fullName"),
                  username: fd.get("username"),
                  bio: fd.get("bio"),
                  location: loc,
                },
              },
            });
            closeModal();
            notify("Profile updated.");
            renderDeveloperProfile(true);
          } catch (err) {
            st.className = "dp-status-text error";
            st.textContent = err.message;
          }
        };
      },
    );
  }

  async function openCoverModal() {
    const me = state.meData || (await api("/me"));
    const p = me.profile;
    openModal(
      "Customize Cover Banner",
      `<form id="dp-form-cover">
        <div class="dp-field">
          <label>Banner Theme Preset</label>
          <select name="cover">
            ${[["scenic", "Scenic Lavender Mountains (Default)"], ["mesh", "Soft Pastel Mesh"], ["midnight", "Midnight Galaxy"], ["minimal", "Minimal Clean Lavender"]]
              .map(([v, lbl]) => `<option value="${v}"${p.cover === v || (p.cover === "lavender" && v === "scenic") ? " selected" : ""}>${lbl}</option>`)
              .join("")}
          </select>
        </div>
        <div class="dp-modal-foot">
          <span class="dp-status-text" id="dp-modal-status"></span>
          <button type="submit" class="dp-btn dp-btn-primary">Apply Cover</button>
        </div>
      </form>`,
      (el) => {
        el.querySelector("#dp-form-cover").onsubmit = async (e) => {
          e.preventDefault();
          const st = el.querySelector("#dp-modal-status");
          try {
            await api("/me", {
              method: "PATCH",
              body: { version: p.version, cover: e.target.cover.value, details: { coverSelected: true } },
            });
            closeModal();
            notify("Cover updated.");
            renderDeveloperProfile(true);
          } catch (err) {
            st.className = "dp-status-text error";
            st.textContent = err.message;
          }
        };
      },
    );
  }

  async function openAvatarModal() {
    const me = state.meData || (await api("/me"));
    const p = me.profile;
    openModal(
      "Update Profile Photo",
      `<form id="dp-form-avatar">
        <div class="dp-field">
          <label>HTTPS Image URL</label>
          <input type="url" name="avatarUrl" placeholder="https://..." value="${esc(me.user.avatarUrl || "")}">
          <small class="dp-muted">Enter a public HTTPS portrait URL, or leave blank to use your initials avatar.</small>
        </div>
        <div class="dp-modal-foot">
          <span class="dp-status-text" id="dp-modal-status"></span>
          <button type="submit" class="dp-btn dp-btn-primary">Save Photo</button>
        </div>
      </form>`,
      (el) => {
        el.querySelector("#dp-form-avatar").onsubmit = async (e) => {
          e.preventDefault();
          const st = el.querySelector("#dp-modal-status");
          try {
            const urlVal = e.target.avatarUrl.value.trim();
            await api("/me", {
              method: "PATCH",
              body: { version: p.version, account: { avatarUrl: urlVal } },
            });
            closeModal();
            notify("Profile photo updated.");
            renderDeveloperProfile(true);
          } catch (err) {
            st.className = "dp-status-text error";
            st.textContent = err.message;
          }
        };
      },
    );
  }

  async function openSkillsModal() {
    const cfg = await ensureConfig();
    const me = await api("/me");
    const skills = me.skills || [];
    openModal(
      "Manage Top Skills",
      `<div>
        <form id="dp-form-skill" class="dp-form-grid" style="margin-bottom:16px;">
          <div class="dp-field"><label>Skill Name</label><input name="name" required maxlength="60" placeholder="e.g. React, PostgreSQL"></div>
          <div class="dp-field"><label>Category</label><select name="category">${(cfg.categories || []).map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}</select></div>
          <div class="dp-field"><label>Proficiency</label><select name="proficiency">${(cfg.proficiencies || []).map((pr) => `<option value="${esc(pr)}">${esc(pr)}</option>`).join("")}</select></div>
          <div class="dp-field" style="justify-content:flex-end;"><button type="submit" class="dp-btn dp-btn-primary">${icon("plus")} Add Skill</button></div>
        </form>
        <div id="dp-skill-list-modal" class="dp-skills-wrap">
          ${skills.map((s) => `<span class="dp-skill-pill">${esc(s.name)} <small class="dp-muted">${esc(s.proficiency)}</small><button type="button" style="border:0;background:none;cursor:pointer;color:var(--dp-muted);padding:0 2px;" data-del-skill="${esc(s.id)}" aria-label="Remove ${esc(s.name)}">✕</button></span>`).join("")}
        </div>
        <div class="dp-status-text" id="dp-modal-status" style="margin-top:10px;"></div>
      </div>`,
      (el) => {
        el.querySelector("#dp-form-skill").onsubmit = async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const st = el.querySelector("#dp-modal-status");
          try {
            await api("/me/skills", {
              method: "POST",
              body: { name: fd.get("name"), category: fd.get("category"), proficiency: fd.get("proficiency"), pinned: true },
            });
            closeModal();
            notify("Skill added.");
            await renderDeveloperProfile(true);
            openSkillsModal();
          } catch (err) {
            st.className = "dp-status-text error";
            st.textContent = err.message;
          }
        };
        el.querySelectorAll("[data-del-skill]").forEach((btn) => {
          btn.onclick = async () => {
            await api(`/me/skills/${encodeURIComponent(btn.dataset.delSkill)}`, { method: "DELETE" });
            closeModal();
            notify("Skill removed.");
            await renderDeveloperProfile(true);
            openSkillsModal();
          };
        });
      },
    );
  }

  async function openLinksModal() {
    const cfg = await ensureConfig();
    const me = await api("/me");
    const links = me.profile.links || {};
    openModal(
      "Edit Social Links",
      `<form id="dp-form-links" class="dp-form-grid">
        ${(cfg.links || []).map((k) => `<div class="dp-field"><label style="text-transform:capitalize;">${esc(k)}</label><input type="url" name="${esc(k)}" placeholder="https://..." value="${esc(links[k] || "")}"></div>`).join("")}
        <div class="dp-modal-foot dp-field-full">
          <span class="dp-status-text" id="dp-modal-status"></span>
          <button type="submit" class="dp-btn dp-btn-primary">Save Links</button>
        </div>
      </form>`,
      (el) => {
        el.querySelector("#dp-form-links").onsubmit = async (e) => {
          e.preventDefault();
          const payload = {};
          for (const k of cfg.links || []) payload[k] = e.target[k].value.trim();
          const st = el.querySelector("#dp-modal-status");
          try {
            await api("/me", { method: "PATCH", body: { version: me.profile.version, links: payload } });
            closeModal();
            notify("Links updated.");
            renderDeveloperProfile(true);
          } catch (err) {
            st.className = "dp-status-text error";
            st.textContent = err.message;
          }
        };
      },
    );
  }

  async function openEntryModal(kind, entryObj = null) {
    const d = entryObj?.data || {};
    const fields =
      kind === "experience"
        ? `
          <div class="dp-field"><label>Role / Designation</label><input name="designation" required maxlength="120" value="${esc(d.designation || "")}" placeholder="Software Engineering Intern"></div>
          <div class="dp-field"><label>Organization / Company</label><input name="organization" required maxlength="160" value="${esc(d.organization || "")}"></div>
          <div class="dp-field"><label>Employment Type</label><input name="type" maxlength="40" value="${esc(d.type || "")}" placeholder="Internship, Full-time, Open Source"></div>
          <div class="dp-field"><label>Location</label><input name="location" maxlength="100" value="${esc(d.location || "")}" placeholder="Remote / City"></div>
          <div class="dp-field"><label>Start Date (YYYY-MM-DD)</label><input type="date" name="startDate" value="${esc(d.startDate || "")}"></div>
          <div class="dp-field"><label>End Date (YYYY-MM-DD)</label><input type="date" name="endDate" value="${esc(d.endDate || "")}"></div>
          <div class="dp-field dp-field-full"><label class="dp-check-row"><span>Currently working here</span><input type="checkbox" name="current" ${d.current ? "checked" : ""}></label></div>
          <div class="dp-field dp-field-full"><label>Highlights &amp; Responsibilities</label><textarea name="description" rows="4" maxlength="1500">${esc(d.description || "")}</textarea></div>
        `
        : kind === "education"
          ? `
            <div class="dp-field dp-field-full"><label>Institution / School</label><input name="institution" required maxlength="160" value="${esc(d.institution || "")}"></div>
            <div class="dp-field"><label>Degree / Program</label><input name="degree" maxlength="120" value="${esc(d.degree || "")}" placeholder="B.Tech, Class 12, etc."></div>
            <div class="dp-field"><label>Field of Study</label><input name="field" maxlength="120" value="${esc(d.field || "")}" placeholder="Computer Science"></div>
            <div class="dp-field"><label>Start Year (YYYY)</label><input name="startYear" pattern="\\d{4}" maxlength="4" value="${esc(d.startYear || "")}" placeholder="2024"></div>
            <div class="dp-field"><label>End Year (YYYY)</label><input name="endYear" pattern="\\d{4}" maxlength="4" value="${esc(d.endYear || "")}" placeholder="2028"></div>
            <div class="dp-field"><label>Grade / GPA (Optional)</label><input name="grade" maxlength="30" value="${esc(d.grade || "")}"></div>
            <div class="dp-field" style="justify-content:flex-end;"><label class="dp-check-row"><span>Currently studying</span><input type="checkbox" name="current" ${d.current ? "checked" : ""}></label></div>
            <div class="dp-field dp-field-full"><label>Coursework &amp; Notes</label><textarea name="description" rows="3" maxlength="1500">${esc(d.description || "")}</textarea></div>
          `
          : `
            <div class="dp-field dp-field-full"><label>Certificate Title</label><input name="title" required maxlength="160" value="${esc(d.title || "")}"></div>
            <div class="dp-field"><label>Issuing Organization</label><input name="issuer" required maxlength="160" value="${esc(d.issuer || "")}"></div>
            <div class="dp-field"><label>Issue Date (YYYY-MM-DD)</label><input type="date" name="issueDate" value="${esc(d.issueDate || "")}"></div>
            <div class="dp-field dp-field-full"><label>Credential Verification URL (HTTPS)</label><input type="url" name="credentialUrl" value="${esc(d.credentialUrl || "")}"></div>
          `;

    openModal(
      `${entryObj ? "Edit" : "Add"} ${kind === "external-certificate" ? "External Certificate" : kind[0].toUpperCase() + kind.slice(1)}`,
      `<form id="dp-form-entry" class="dp-form-grid">
        ${fields}
        <div class="dp-modal-foot dp-field-full">
          <span class="dp-status-text" id="dp-modal-status"></span>
          <button type="submit" class="dp-btn dp-btn-primary">Save</button>
        </div>
      </form>`,
      (el) => {
        el.querySelector("#dp-form-entry").onsubmit = async (e) => {
          e.preventDefault();
          const body = {};
          new FormData(e.target).forEach((val, key) => {
            if (key !== "current") body[key] = String(val).trim();
          });
          if (e.target.current) body.current = e.target.current.checked;
          const st = el.querySelector("#dp-modal-status");
          try {
            if (entryObj?.id) {
              await api(`/me/entries/${encodeURIComponent(kind)}/${encodeURIComponent(entryObj.id)}`, { method: "PUT", body });
            } else {
              await api(`/me/entries/${encodeURIComponent(kind)}`, { method: "POST", body });
            }
            closeModal();
            notify("Entry saved.");
            renderDeveloperProfile(true);
          } catch (err) {
            st.className = "dp-status-text error";
            st.textContent = err.message;
          }
        };
      },
    );
  }

  async function openManageFeaturedProjectsModal() {
    const me = state.meData || (await api("/me"));
    const projects = state.publicData?.projects || (await api("/me/progress/projects")).data || [];
    const currentPins = new Set(me.profile.pins?.projects || []);
    openModal(
      "Manage Featured Projects",
      `<form id="dp-form-pins">
        <p class="dp-muted" style="margin-top:0;font-size:13px;">Choose up to 4 projects to prioritize in your Overview grid.</p>
        ${projects.length
          ? projects.map((p) => `<label class="dp-check-row"><span><strong>${esc(p.title)}</strong> <small class="dp-muted">${esc(p.category)}</small></span><input type="checkbox" name="proj" value="${esc(p.id)}" ${currentPins.has(p.id) ? "checked" : ""}></label>`).join("")
          : `<p class="dp-muted">You haven't published any approved projects yet.</p>`}
        <div class="dp-modal-foot">
          <button type="button" class="dp-btn" data-dp-action="open-add-project">${icon("plus")} Publish New Project</button>
          <button type="submit" class="dp-btn dp-btn-primary">Save Featured Order</button>
        </div>
      </form>`,
      (el) => {
        el.querySelector("#dp-form-pins").onsubmit = async (e) => {
          e.preventDefault();
          const selected = [...el.querySelectorAll("[name=proj]:checked")].map((c) => c.value).slice(0, 6);
          await api("/me", { method: "PATCH", body: { version: me.profile.version, pins: { projects: selected } } });
          closeModal();
          notify("Featured projects updated.");
          renderDeveloperProfile(true);
        };
      },
    );
  }

  async function openManageCertificatesModal() {
    const vm = state.publicData;
    const certs = vm?.certificates || [];
    const currentPins = new Set(vm?.profile?.pins?.certificates || []);
    openModal(
      "Manage Featured Certificates",
      `<div>
        <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <span class="dp-muted" style="font-size:13px;">Pin credentials or add an external certificate.</span>
          <button type="button" class="dp-btn dp-btn-sm" id="dp-add-ext-cert-btn">${icon("plus")} External Certificate</button>
        </div>
        <form id="dp-form-cert-pins">
          ${certs.length
            ? certs.map((c) => `<label class="dp-check-row"><span><strong>${esc(c.title)}</strong> · <small class="dp-muted">${esc(c.id)}</small></span><input type="checkbox" name="cert" value="${esc(c.id)}" ${currentPins.has(c.id) ? "checked" : ""}></label>`).join("")
            : `<p class="dp-muted">No certificates found yet.</p>`}
          ${certs.length ? `<div class="dp-modal-foot"><button type="submit" class="dp-btn dp-btn-primary">Save Pinned Certificates</button></div>` : ""}
        </form>
      </div>`,
      (el) => {
        el.querySelector("#dp-add-ext-cert-btn").onclick = () => {
          closeModal();
          openEntryModal("external-certificate");
        };
        const f = el.querySelector("#dp-form-cert-pins");
        if (f) {
          f.onsubmit = async (e) => {
            e.preventDefault();
            const me = state.meData || (await api("/me"));
            const ids = [...el.querySelectorAll("[name=cert]:checked")].map((c) => c.value).slice(0, 6);
            await api("/me", { method: "PATCH", body: { version: me.profile.version, pins: { certificates: ids } } });
            closeModal();
            notify("Certificate showcase updated.");
            renderDeveloperProfile(true);
          };
        }
      },
    );
  }

  async function openConnectionsModal(username, kind = "follow") {
    openModal(
      kind === "following" ? `Following · @${username}` : `Followers · @${username}`,
      `<div id="dp-conn-list"><p class="dp-muted">Loading…</p></div>`,
      async (el) => {
        try {
          const res = await api(`/public/${encodeURIComponent(username)}/connections?kind=${encodeURIComponent(kind)}${state.visitorPreview ? "&asVisitor=1" : ""}`);
          const list = res.items || [];
          el.querySelector("#dp-conn-list").innerHTML = list.length
            ? `<div style="display:flex;flex-direction:column;gap:8px;">
                ${list
                  .map(
                    (u) => `<a href="/u/${encodeURIComponent(u.username)}" class="dp-link-row" data-dp-profile-link="${esc(u.username)}">
                      <span class="dp-link-row-left"><strong>${esc(u.fullName || u.username)}</strong> <span class="dp-muted">@${esc(u.username)}</span></span>
                      ${icon("arrowRight")}
                    </a>`,
                  )
                  .join("")}
              </div>`
            : `<p class="dp-muted">No public ${kind === "following" ? "following" : "followers"} to display yet.</p>`;
        } catch (err) {
          el.querySelector("#dp-conn-list").innerHTML = `<p class="dp-muted">${esc(err.message)}</p>`;
        }
      },
    );
  }

  function openShareModal(vm) {
    const shareUrl = `${location.origin}/u/${encodeURIComponent(vm.user.username)}`;
    const qrSrc = `/api/profile/public/${encodeURIComponent(vm.user.username)}/qr${state.visitorPreview ? "?asVisitor=1" : ""}`;
    openModal(
      "Share Developer Profile",
      `<div style="display:flex;flex-direction:column;gap:14px;">
        <div class="dp-field" style="margin:0;">
          <label>Public Profile URL</label>
          <div style="display:flex;gap:8px;">
            <input readonly value="${esc(shareUrl)}" id="dp-share-url-input">
            <button type="button" class="dp-btn dp-btn-primary" id="dp-copy-share-btn">Copy Link</button>
          </div>
        </div>
        ${vm.sections.developerId && vm.profile.visibility === "public"
          ? `<div style="display:flex;align-items:center;gap:16px;padding:14px;border-radius:10px;background:var(--dp-surface-soft);border:1px solid var(--dp-border);">
              <img src="${esc(qrSrc)}" width="92" height="92" alt="QR Code" style="border-radius:8px;background:#fff;padding:4px;border:1px solid var(--dp-border);">
              <div>
                <strong>Scan to view @${esc(vm.user.username)}</strong>
                <p class="dp-muted" style="margin:4px 0 0;font-size:12.5px;">Anyone with this link can view your shared public sections.</p>
              </div>
            </div>`
          : ""}
      </div>`,
      (el) => {
        el.querySelector("#dp-copy-share-btn").onclick = async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
            notify("Public profile URL copied!");
          } catch {
            el.querySelector("#dp-share-url-input").select();
            document.execCommand("copy");
            notify("Profile URL copied.");
          }
        };
      },
    );
  }

  // =========================================================================
  // Settings Views: /profile/settings & /profile/settings/privacy
  // =========================================================================
  async function renderSettingsHub(activeSubTab = null) {
    const settingsView = document.getElementById("v-settings");
    if (!settingsView) return;
    if (activeSubTab) state.settingsTab = activeSubTab;

    // Preserve the existing Theme/Appearance `.g` element on first init
    let shell = document.getElementById("dp-settings-shell");
    if (!shell) {
      const origGrid = settingsView.querySelector(".g");
      shell = document.createElement("div");
      shell.id = "dp-settings-shell";
      shell.className = "dp-settings-shell";
      shell.innerHTML = `
        <div class="dp-settings-nav">
          <div class="dp-settings-tabs" role="tablist">
            <button type="button" class="dp-settings-tab" data-dp-settab="appearance">Appearance &amp; Theme</button>
            <button type="button" class="dp-settings-tab" data-dp-settab="profile">Profile Settings</button>
            <button type="button" class="dp-settings-tab" data-dp-settab="privacy">Privacy &amp; Visibility</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <a href="/profile" class="dp-btn dp-btn-sm" data-dp-nav-profile>View My Profile ${icon("arrowRight")}</a>
          </div>
        </div>
        <div id="dp-settings-pane-appearance"></div>
        <div id="dp-settings-pane-profile" hidden></div>
        <div id="dp-settings-pane-privacy" hidden></div>
      `;
      if (origGrid) {
        const appPane = shell.querySelector("#dp-settings-pane-appearance");
        appPane.appendChild(origGrid);
      }
      settingsView.appendChild(shell);

      shell.querySelectorAll("[data-dp-settab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = btn.dataset.dpSettab;
          const targetPath = next === "profile" ? "/profile/settings" : next === "privacy" ? "/profile/settings/privacy" : "/theme";
          if (location.pathname !== targetPath) history.pushState(null, "", targetPath);
          renderSettingsHub(next);
        });
      });
    }

    shell.querySelector(".dp-settings-nav").hidden = state.settingsTab === "appearance";
    shell.querySelectorAll("[data-dp-settab]").forEach((b) => {
      b.hidden = b.dataset.dpSettab === "appearance";
      b.classList.toggle("active", b.dataset.dpSettab === state.settingsTab);
    });
    const pApp = shell.querySelector("#dp-settings-pane-appearance");
    const pProf = shell.querySelector("#dp-settings-pane-profile");
    const pPriv = shell.querySelector("#dp-settings-pane-privacy");
    pApp.hidden = state.settingsTab !== "appearance";
    pProf.hidden = state.settingsTab !== "profile";
    pPriv.hidden = state.settingsTab !== "privacy";

    if (state.settingsTab === "appearance") return;
    if (state.settingsTab === "account") {
      pProf.hidden = false; pPriv.hidden = true;
      pProf.innerHTML = '<section class="dp-card"><h1>Settings</h1><p>Manage your account and developer profile.</p><p><a href="/profile/settings" data-dp-nav-settings-profile>Profile settings →</a></p><p><a href="/profile/settings/privacy" data-dp-nav-settings-privacy>Privacy and visibility →</a></p><p><a href="/theme">Theme and appearance →</a></p></section>';
      return;
    }

    const targetPane = state.settingsTab === "profile" ? pProf : pPriv;
    if (!getToken() || !getViewer()) {
      targetPane.innerHTML = `<div class="dp-card" style="text-align:center;padding:40px 24px;"><h3>Sign In Required</h3><p class="dp-muted">Sign in to manage your developer profile and privacy settings.</p><button type="button" class="dp-btn dp-btn-primary" onclick="openAuthModal('login')">Sign In</button></div>`;
      return;
    }

    targetPane.innerHTML = `<div class="dp-card"><p class="dp-muted" style="margin:0;">Loading settings…</p></div>`;
    try {
      const [me, cfg] = await Promise.all([api("/me"), ensureConfig()]);
      state.meData = me;
      if (state.settingsTab === "profile") renderProfileSettingsPane(pProf, me, cfg);
      else await renderPrivacySettingsPane(pPriv, me);
    } catch (err) {
      targetPane.innerHTML = `<div class="dp-card"><p class="dp-muted">${esc(err.message)}</p></div>`;
    }
  }

  function renderProfileSettingsPane(container, me, cfg) {
    const p = me.profile;
    const links = p.links || {};
    container.innerHTML = `
      <form id="dp-settings-profile-form" class="dp-two-col">
        <div style="display:flex;flex-direction:column;gap:20px;">
          <section class="dp-card">
            <div class="dp-section-head"><h2 class="dp-section-title">${icon("user")} Public Identity</h2></div>
            <div class="dp-form-grid">
              <div class="dp-field"><label>Full Name</label><input name="fullName" required minlength="2" maxlength="70" value="${esc(me.user.fullName || "")}"></div>
              <div class="dp-field"><label>Username (<code>/u/username</code>)</label><input name="username" required minlength="3" maxlength="30" value="${esc(me.user.username || "")}"></div>
              <div class="dp-field dp-field-full"><label>Professional Headline</label><input name="headline" maxlength="160" placeholder="Full Stack Developer · Problem Solver" value="${esc(p.headline || "")}"></div>
              <div class="dp-field dp-field-full"><label>About / Bio</label><textarea name="bio" rows="4" maxlength="500">${esc(me.user.bio || "")}</textarea></div>
              <div class="dp-field"><label>City</label><input name="city" maxlength="80" value="${esc(p.city || "")}"></div>
              <div class="dp-field"><label>Country</label><input name="country" maxlength="80" value="${esc(p.country || "")}"></div>
              <div class="dp-field"><label>College / School</label><input name="college" maxlength="160" value="${esc(p.college || "")}"></div>
              <div class="dp-field"><label>Company / Organization</label><input name="company" maxlength="160" value="${esc(p.company || "")}"></div>
              <div class="dp-field dp-field-full"><label>Avatar HTTPS URL</label><input type="url" name="avatarUrl" value="${esc(me.user.avatarUrl || "")}" placeholder="https://..."></div>
              <div class="dp-field dp-field-full">
                <label>Cover Banner Style</label>
                <select name="cover">
                  ${[["scenic", "Scenic Lavender Mountains (Default)"], ["mesh", "Pastel Gradient Mesh"], ["midnight", "Midnight Galaxy"], ["minimal", "Minimal Lavender"]]
                    .map(([v, l]) => `<option value="${v}"${p.cover === v || (p.cover === "lavender" && v === "scenic") ? " selected" : ""}>${l}</option>`).join("")}
                </select>
              </div>
            </div>
          </section>
          <section class="dp-card">
            <div class="dp-section-head"><h2 class="dp-section-title">${icon("briefcase")} Availability &amp; Discovery</h2></div>
            <label class="dp-check-row"><span>Open to Work (Full-time)</span><input type="checkbox" name="openToWork" ${p.details?.openToWork ? "checked" : ""}></label>
            <label class="dp-check-row"><span>Open to Internships</span><input type="checkbox" name="openToInternship" ${p.details?.openToInternship ? "checked" : ""}></label>
            <label class="dp-check-row"><span>Open to Project Collaboration</span><input type="checkbox" name="collaboration" ${p.details?.collaboration ? "checked" : ""}></label>
            <label class="dp-check-row"><span>Remote Friendly</span><input type="checkbox" name="remote" ${p.details?.remote ? "checked" : ""}></label>
            <div class="dp-field" style="margin-top:10px;"><label>Preferred Roles</label><input name="preferredRoles" maxlength="250" value="${esc(p.details?.preferredRoles || "")}" placeholder="Frontend Engineer, Backend Developer"></div>
          </section>
        </div>
        <div style="display:flex;flex-direction:column;gap:20px;">
          <section class="dp-card">
            <div class="dp-section-head"><h2 class="dp-section-title">${icon("link2")} Social &amp; Coding Profiles</h2></div>
            <div class="dp-form-grid">
              ${(cfg.links || []).map((k) => `<div class="dp-field"><label style="text-transform:capitalize;">${esc(k)}</label><input type="url" name="link_${esc(k)}" value="${esc(links[k] || "")}" placeholder="https://..."></div>`).join("")}
            </div>
          </section>
          <section class="dp-card">
            <div class="dp-section-head"><h2 class="dp-section-title">${icon("download")} Exports &amp; Resume</h2></div>
            <p class="dp-muted" style="margin-top:-6px;font-size:13px;">Download your profile data, ATS-friendly PDF resume, or offline HTML portfolio.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="dp-btn dp-btn-sm" data-dp-export="resume">${icon("download")} Resume PDF</button>
              <button type="button" class="dp-btn dp-btn-sm" data-dp-export="id">${icon("qrCode")} ID Card PDF</button>
              <button type="button" class="dp-btn dp-btn-sm" data-dp-export="data">${icon("download")} JSON Data</button>
            </div>
          </section>
          <section class="dp-card">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
              <span class="dp-status-text" id="dp-prof-save-status"></span>
              <button type="submit" class="dp-btn dp-btn-primary">Save Profile Settings</button>
            </div>
          </section>
        </div>
      </form>
    `;

    container.querySelectorAll("[data-dp-export]").forEach((btn) => {
      btn.onclick = () => downloadOwnerExport(btn.dataset.dpExport);
    });

    container.querySelector("#dp-settings-profile-form").onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData(form);
      const st = container.querySelector("#dp-prof-save-status");
      st.className = "dp-status-text";
      st.textContent = "Saving…";
      const nextLinks = {};
      for (const k of cfg.links || []) nextLinks[k] = String(fd.get(`link_${k}`) || "").trim();
      try {
        const res = await api("/me", {
          method: "PATCH",
          body: {
            version: state.meData.profile.version,
            headline: String(fd.get("headline") || ""),
            city: String(fd.get("city") || ""),
            country: String(fd.get("country") || ""),
            college: String(fd.get("college") || ""),
            company: String(fd.get("company") || ""),
            cover: String(fd.get("cover") || "scenic"),
            links: nextLinks,
            details: {
              openToWork: form.openToWork.checked,
              openToInternship: form.openToInternship.checked,
              collaboration: form.collaboration.checked,
              remote: form.remote.checked,
              preferredRoles: String(fd.get("preferredRoles") || ""),
            },
            account: {
              fullName: String(fd.get("fullName") || ""),
              username: String(fd.get("username") || ""),
              bio: String(fd.get("bio") || ""),
              avatarUrl: String(fd.get("avatarUrl") || ""),
              location: [fd.get("city"), fd.get("country")].filter(Boolean).join(", "),
            },
          },
        });
        state.meData.profile = res.profile;
        state.tabCache = {};
        if (typeof refreshCurrentUser === "function") refreshCurrentUser().catch(() => {});
        st.textContent = "Saved!";
        notify("Profile settings saved.");
      } catch (err) {
        st.className = "dp-status-text error";
        st.textContent = err.message;
      }
    };
  }

  async function renderPrivacySettingsPane(container, me) {
    const p = me.profile;
    const priv = p.privacy || {};
    const details = p.details || {};
    const sectionMeta = [
      ["about", "About & Bio"],
      ["location", "Location (City / Country)"],
      ["availability", "Availability Badges"],
      ["skills", "Skills & Endorsements"],
      ["projects", "Featured Projects"],
      ["statistics", "XP, Level & Coding Stats"],
      ["achievements", "Achievements & Badges"],
      ["activity", "Contribution Activity Heatmap"],
      ["education", "Education Timeline"],
      ["experience", "Experience Timeline"],
      ["certificates", "Verified Certificates"],
      ["links", "Social & Portfolio Links"],
      ["learning", "Learning Milestones"],
      ["hackathons", "Hackathons & Events"],
      ["resume", "Public Resume PDF"],
      ["developerId", "Developer ID & QR Code"],
    ];

    const blockedRes = await api("/me/connections?kind=block").catch(() => ({ items: [] }));
    const pendingReqs = me.connections?.incoming || [];

    container.innerHTML = `
      <form id="dp-settings-privacy-form" class="dp-two-col">
        <div style="display:flex;flex-direction:column;gap:20px;">
          <section class="dp-card">
            <div class="dp-section-head">
              <h2 class="dp-section-title">${icon("shield")} Profile Visibility</h2>
              <button type="button" class="dp-btn dp-btn-sm" id="dp-priv-preview-btn">${icon("eye")} Preview as Visitor</button>
            </div>
            <div class="dp-field">
              <label>Overall Profile Access</label>
              <select name="visibility">
                <option value="public"${p.visibility === "public" ? " selected" : ""}>Public — Anyone with /u/${esc(me.user.username)}</option>
                <option value="followers"${p.visibility === "followers" ? " selected" : ""}>Followers Only — Accepted followers</option>
                <option value="private"${p.visibility === "private" ? " selected" : ""}>Private — Only you</option>
              </select>
            </div>
            <label class="dp-check-row"><span>List my profile in Developer Discovery Directory</span><input type="checkbox" name="discovery" ${p.discovery ? "checked" : ""}></label>
            <label class="dp-check-row"><span>Accept Recruiter Contact Requests</span><input type="checkbox" name="recruitment" ${p.recruitment ? "checked" : ""}></label>
            <label class="dp-check-row"><span>Allow Resume PDF Download on Public Profile</span><input type="checkbox" name="allowResumeDownload" ${details.allowResumeDownload !== false ? "checked" : ""}></label>
            <label class="dp-check-row"><span>Show Public Developer ID</span><input type="checkbox" name="showDeveloperId" ${details.showDeveloperId !== false ? "checked" : ""}></label>
            <label class="dp-check-row"><span>Show QR Code Badge</span><input type="checkbox" name="showQrCode" ${details.showQrCode !== false ? "checked" : ""}></label>
            <label class="dp-check-row"><span>Share In-Progress Learning Milestones (otherwise completed only)</span><input type="checkbox" name="shareInProgressLearning" ${details.shareInProgressLearning ? "checked" : ""}></label>
          </section>
          <section class="dp-card">
            <div class="dp-section-head"><h2 class="dp-section-title">${icon("users")} Requests &amp; Blocked Accounts</h2></div>
            ${pendingReqs.length
              ? `<div style="margin-bottom:14px;"><strong style="font-size:13px;">Pending Requests</strong>
                  ${pendingReqs.map((r) => `<div class="dp-privacy-row"><span><strong>@${esc(r.from?.username)}</strong> (${esc(r.kind)})</span><div style="display:flex;gap:6px;"><button type="button" class="dp-btn dp-btn-sm dp-btn-primary" data-req-id="${esc(r.id)}" data-req-act="accepted">Accept</button><button type="button" class="dp-btn dp-btn-sm" data-req-id="${esc(r.id)}" data-req-act="declined">Decline</button></div></div>`).join("")}
                </div>`
              : `<p class="dp-muted" style="font-size:13px;margin-top:0;">No pending follow or collaboration requests.</p>`}
            ${blockedRes.items?.length
              ? `<div><strong style="font-size:13px;">Blocked Accounts</strong>
                  ${blockedRes.items.map((b) => `<div class="dp-privacy-row"><span>@${esc(b.user?.username)}</span><button type="button" class="dp-btn dp-btn-sm" data-unblock-user="${esc(b.user?.username)}">Unblock</button></div>`).join("")}
                </div>`
              : `<p class="dp-muted" style="font-size:13px;margin:0;">No blocked accounts.</p>`}
          </section>
        </div>
        <div style="display:flex;flex-direction:column;gap:20px;">
          <section class="dp-card">
            <div class="dp-section-head"><h2 class="dp-section-title">${icon("lock")} Granular Section Privacy</h2></div>
            <p class="dp-muted" style="margin-top:-6px;font-size:13px;">Control exactly what visitors and followers can see. Personal email and private workspace notes are always private.</p>
            ${sectionMeta
              .map(([k, label]) => {
                const cur = priv[k] || "private";
                return `<div class="dp-privacy-row">
                  <label for="priv-${k}" style="font-size:13.5px;font-weight:600;">${esc(label)}</label>
                  <select id="priv-${k}" name="priv_${k}">
                    <option value="public"${cur === "public" ? " selected" : ""}>Public</option>
                    <option value="followers"${cur === "followers" ? " selected" : ""}>Followers</option>
                    <option value="private"${cur === "private" ? " selected" : ""}>Private</option>
                  </select>
                </div>`;
              })
              .join("")}
            <div style="margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
              <span class="dp-status-text" id="dp-priv-save-status"></span>
              <button type="submit" class="dp-btn dp-btn-primary">Save Privacy Settings</button>
            </div>
          </section>
        </div>
      </form>
    `;

    container.querySelector("#dp-priv-preview-btn").onclick = () => {
      state.mode = "public";
      state.targetUsername = me.user.username;
      state.visitorPreview = true;
      state.activeTab = "overview";
      if (typeof show === "function") show("profile", true, false);
      history.pushState(null, "", `/u/${encodeURIComponent(me.user.username)}?asVisitor=1`);
      renderDeveloperProfile(true);
    };

    container.querySelectorAll("[data-req-id]").forEach((btn) => {
      btn.onclick = async () => {
        await api(`/me/requests/${encodeURIComponent(btn.dataset.reqId)}`, { method: "PATCH", body: { status: btn.dataset.reqAct } });
        notify("Request updated.");
        const updated = await api("/me");
        renderPrivacySettingsPane(container, updated);
      };
    });

    container.querySelectorAll("[data-unblock-user]").forEach((btn) => {
      btn.onclick = async () => {
        await api(`/connect/${encodeURIComponent(btn.dataset.unblockUser)}/block`, { method: "DELETE" });
        notify("Account unblocked.");
        const updated = await api("/me");
        renderPrivacySettingsPane(container, updated);
      };
    });

    container.querySelector("#dp-settings-privacy-form").onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const st = container.querySelector("#dp-priv-save-status");
      st.className = "dp-status-text";
      st.textContent = "Saving…";
      const nextPrivacy = {};
      for (const [k] of sectionMeta) nextPrivacy[k] = form[`priv_${k}`].value;
      const vis = form.visibility.value;
      try {
        const res = await api("/me", {
          method: "PATCH",
          body: {
            version: state.meData.profile.version,
            visibility: vis,
            discovery: vis === "public" ? form.discovery.checked : false,
            recruitment: vis === "public" && form.discovery.checked ? form.recruitment.checked : false,
            details: {
              allowResumeDownload: form.allowResumeDownload.checked,
              showDeveloperId: form.showDeveloperId.checked,
              showQrCode: form.showQrCode.checked,
              shareInProgressLearning: form.shareInProgressLearning.checked,
            },
            privacy: nextPrivacy,
          },
        });
        state.meData.profile = res.profile;
        state.tabCache = {};
        st.textContent = "Privacy preferences saved!";
        notify("Privacy settings saved.");
      } catch (err) {
        st.className = "dp-status-text error";
        st.textContent = err.message;
      }
    };
  }

  async function downloadOwnerExport(kind) {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/profile/me/exports/${encodeURIComponent(kind)}`, { headers, credentials: "same-origin" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = kind === "data" ? "devharbour-profile.json" : `devharbour-${kind}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (err) {
      notify(err.message);
    }
  }

  // =========================================================================
  // Dashboard Learning Goals & Profile Readiness Widget (Separated from Profile!)
  // =========================================================================
  window.renderDashboardGoalsAndReadiness = async function () {
    const host = document.getElementById("dh-home-goals-widget");
    if (!host) return;
    if (!getToken() || !getViewer()) {
      host.innerHTML = "";
      host.hidden = true;
      return;
    }
    try {
      const [gRes, rRes] = await Promise.all([api("/me/goals"), api("/me/readiness")]);
      const goals = gRes.goals || [];
      const pct = Math.min(100, Math.round(((rRes.completed || 0) / Math.max(1, rRes.total || 1)) * 100));
      host.hidden = false;
      host.innerHTML = `
        <div class="c s6" style="display:flex;flex-direction:column;gap:12px;">
          <div class="h"><h3>Profile Readiness</h3><span class="tag">${pct}%</span></div>
          <p class="mut" style="margin:0;font-size:13px;">Complete your profile in <a href="/profile/settings" data-dp-nav-settings-profile>Profile Settings</a> to stand out in the directory.</p>
          <div class="dp-progress-track"><div class="dp-progress-fill" style="width:${pct}%"></div></div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${(rRes.checks || []).map((c) => `<span class="tag" style="${c.done ? "background:var(--dp-lavender-soft);color:var(--dp-lavender-deep);" : ""}">${c.done ? "✓" : "○"} ${esc(c.label)}</span>`).join("")}
          </div>
        </div>
        <div class="c s6" style="display:flex;flex-direction:column;gap:10px;">
          <div class="h"><h3>My Learning Goals</h3><button type="button" class="dp-btn dp-btn-sm" id="dh-add-goal-btn">+ Goal</button></div>
          ${goals.length
            ? goals.map((g) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:6px 0;border-bottom:1px solid var(--line);">
                <div><strong>${esc(g.title)}</strong> <span class="mut">(${g.progress || 0}/${g.target} ${esc(g.metric)})</span></div>
                <button type="button" class="dp-icon-edit" data-del-goal="${esc(g.id)}" title="Delete goal">✕</button>
              </div>`).join("")
            : `<p class="mut" style="margin:0;font-size:13px;">Track private XP, problem-solving, or course milestones here on your dashboard.</p>`}
        </div>
      `;
      const addBtn = host.querySelector("#dh-add-goal-btn");
      if (addBtn) {
        addBtn.onclick = () => {
          openModal(
            "Add Private Learning Goal",
            `<form id="dp-form-goal">
              <div class="dp-field"><label>Goal Title</label><input name="title" required maxlength="120" placeholder="e.g. Solve 25 DSA problems"></div>
              <div class="dp-field"><label>Metric</label><select name="metric"><option value="problems">Problems Solved</option><option value="xp">Total XP</option><option value="projects">Projects</option><option value="lessons">Lessons Completed</option><option value="activeDays">Active Days</option></select></div>
              <div class="dp-field"><label>Target</label><input type="number" name="target" min="1" max="100000" required value="10"></div>
              <div class="dp-modal-foot"><button type="submit" class="dp-btn dp-btn-primary">Create Goal</button></div>
            </form>`,
            (el) => {
              el.querySelector("#dp-form-goal").onsubmit = async (ev) => {
                ev.preventDefault();
                const fd = new FormData(ev.target);
                await api("/me/goals", { method: "POST", body: { title: fd.get("title"), metric: fd.get("metric"), target: Number(fd.get("target")) } });
                closeModal();
                window.renderDashboardGoalsAndReadiness();
              };
            },
          );
        };
      }
      host.querySelectorAll("[data-del-goal]").forEach((b) => {
        b.onclick = async () => {
          await api(`/me/goals/${encodeURIComponent(b.dataset.delGoal)}`, { method: "DELETE" });
          window.renderDashboardGoalsAndReadiness();
        };
      });
    } catch {
      host.hidden = true;
    }
  };

  // =========================================================================
  // Event Delegation on Profile Root
  // =========================================================================
  root.addEventListener("click", async (e) => {
    const profileLink = e.target.closest("[data-dp-profile-link]");
    if (profileLink) {
      e.preventDefault();
      closeModal();
      window.openPublicProfile(profileLink.dataset.dpProfileLink);
      return;
    }

    const tabBtn = e.target.closest("[data-dp-tab]");
    if (tabBtn) {
      e.preventDefault();
      state.activeTab = tabBtn.dataset.dpTab;
      updateQueryTab(state.activeTab);
      renderDeveloperProfile(true);
      return;
    }

    const dayBtn = e.target.closest("[data-dp-day]");
    if (dayBtn) {
      const day = dayBtn.dataset.dpDay;
      state.selectedDay = day;
      state.selectedDayItems = null;
      const cacheKey = Object.keys(state.tabCache).find((k) => k.endsWith(`:${state.activeTab}`) || k.includes(`:${state.activeTab}:`));
      const curTabData = state.activeTab === "overview" ? null : (cacheKey ? state.tabCache[cacheKey] : null);
      if (state.publicData) root.innerHTML = buildProfileShell(state.publicData, curTabData);
      try {
        const vm = state.publicData;
        const res = viewerIsOwner(vm)
          ? await api(`/me/activity/${encodeURIComponent(day)}`)
          : await api(`/public/${encodeURIComponent(vm.user.username)}/activity/${encodeURIComponent(day)}${state.visitorPreview ? "?asVisitor=1" : ""}`);
        state.selectedDayItems = res.items || [];
      } catch {
        state.selectedDayItems = [];
      }
      if (state.publicData) root.innerHTML = buildProfileShell(state.publicData, curTabData);
      return;
    }

    const trackLink = e.target.closest("[data-dp-track-view]");
    if (trackLink) {
      const id = trackLink.dataset.dpTrackView;
      if (id) fetch(`/api/projects/${encodeURIComponent(id)}/view`, { method: "POST" }).catch(() => {});
      return;
    }

    const actBtn = e.target.closest("[data-dp-action]");
    if (!actBtn) return;
    const act = actBtn.dataset.dpAction;
    const vm = state.publicData;

    if (act === "retry-profile") {
      const remaining = Math.ceil((state.profileRetryAt - Date.now()) / 1000);
      if (remaining > 0) {
        notify(`Please wait ${remaining} seconds before retrying your profile.`);
        return;
      }
      state.profileRetryAt = 0;
      await renderDeveloperProfile(true);
      return;
    }

    if (act === "close-day") {
      state.selectedDay = null;
      state.selectedDayItems = null;
      const cacheKey = Object.keys(state.tabCache).find((k) => k.endsWith(`:${state.activeTab}`) || k.includes(`:${state.activeTab}:`));
      if (state.publicData) root.innerHTML = buildProfileShell(state.publicData, cacheKey ? state.tabCache[cacheKey] : null);
    } else if (act === "go-home") {
      if (typeof show === "function") show("home", true, true);
    } else if (act === "browse-directory") {
      state.mode = "self";
      state.targetUsername = null;
      history.pushState(null, "", "/profile");
      renderSignedOutProfileHub("");
    } else if (act === "go-settings-profile") {
      closeModal();
      window.openProfileSettings();
    } else if (act === "go-settings-privacy") {
      closeModal();
      window.openPrivacySettings();
    } else if (act === "preview-visitor") {
      state.visitorPreview = true;
      state.mode = "public";
      state.targetUsername = vm?.user?.username || getViewer()?.username;
      history.pushState(null, "", `/u/${encodeURIComponent(state.targetUsername)}?asVisitor=1`);
      renderDeveloperProfile(true);
    } else if (act === "exit-visitor-preview") {
      state.visitorPreview = false;
      state.mode = "self";
      state.targetUsername = null;
      history.pushState(null, "", "/profile");
      renderDeveloperProfile(true);
    } else if (act === "share-profile" && vm) {
      openShareModal(vm);
    } else if (act === "scroll-projects") {
      document.getElementById("dp-projects-section")?.scrollIntoView({ behavior: "smooth" });
    } else if (act === "toggle-more-menu") {
      const menu = document.getElementById("dp-visitor-more-menu");
      if (menu) menu.hidden = !menu.hidden;
    } else if (act === "quick-edit-about") {
      openQuickEditAboutModal();
    } else if (act === "edit-cover") {
      openCoverModal();
    } else if (act === "edit-avatar") {
      openAvatarModal();
    } else if (act === "manage-skills") {
      openSkillsModal();
    } else if (act === "manage-links") {
      openLinksModal();
    } else if (act === "add-entry") {
      openEntryModal(actBtn.dataset.kind);
    } else if (act === "edit-entry") {
      const entry = (state.meData?.entries || []).find((x) => x.id === actBtn.dataset.entryId);
      if (entry) openEntryModal(entry.kind, entry);
    } else if (act === "delete-entry") {
      await api(`/me/entries/${encodeURIComponent(actBtn.dataset.entryId)}`, { method: "DELETE" });
      notify("Entry removed.");
      renderDeveloperProfile(true);
    } else if (act === "manage-featured-projects") {
      openManageFeaturedProjectsModal();
    } else if (act === "manage-certificates") {
      openManageCertificatesModal();
    } else if (act === "open-add-project") {
      closeModal();
      if (typeof openAddProjectModal === "function") openAddProjectModal();
      else if (typeof show === "function") show("projects", true, true);
    } else if (act === "open-connections" && vm) {
      openConnectionsModal(vm.user.username, actBtn.dataset.kind || "follow");
    } else if (act === "download-public-resume" && vm) {
      window.open(`/api/profile/public/${encodeURIComponent(vm.user.username)}/resume${state.visitorPreview ? "?asVisitor=1" : ""}`, "_blank", "noopener,noreferrer");
    } else if (act === "download-id-card") {
      downloadOwnerExport("id");
    } else if (act === "load-more-timeline" && vm) {
      const next = await api(`/public/${encodeURIComponent(vm.user.username)}/activity?year=${encodeURIComponent(state.activityYear)}&before=${encodeURIComponent(actBtn.dataset.cursor)}&type=${encodeURIComponent(state.timelineType)}`);
      const feed = root.querySelector(".dp-timeline-feed");
      if (feed && next.timeline?.items?.length) {
        feed.insertAdjacentHTML(
          "beforeend",
          next.timeline.items
            .map((it) => `<div class="dp-feed-row"><div><strong>${esc(it.title)}</strong><div class="dp-muted" style="font-size:12px;">${esc(formatDayNice(String(it.date).slice(0, 10)))}</div></div><span class="dp-badge-pill">+${Number(it.xp || 0)} XP</span></div>`)
            .join(""),
        );
        if (next.timeline.nextCursor) actBtn.dataset.cursor = next.timeline.nextCursor;
        else actBtn.remove();
      }
    } else if (["toggle-follow", "request-collab", "report-user", "block-user"].includes(act) && vm) {
      if (actBtn.dataset.dpPreviewBlocked === "1") {
        notify("Visitor actions are disabled while previewing your own profile.");
        return;
      }
      if (!getToken() || !getViewer()) {
        if (typeof openAuthModal === "function") openAuthModal("login");
        return;
      }
      const target = vm.user.username;
      try {
        if (act === "toggle-follow") {
          const cur = vm.viewerConnection?.followingStatus || "none";
          if (cur === "accepted" || cur === "pending") {
            await api(`/connect/${encodeURIComponent(target)}/follow`, { method: "DELETE" });
            notify("Unfollowed developer.");
          } else {
            await api(`/connect/${encodeURIComponent(target)}/follow`, { method: "POST", body: {} });
            notify(vm.profile.visibility === "public" ? `Following @${target}` : "Follow request sent.");
          }
          renderDeveloperProfile(true);
        } else if (act === "request-collab") {
          await api(`/connect/${encodeURIComponent(target)}/collaboration`, { method: "POST", body: { message: "Would love to collaborate!" } });
          notify("Collaboration request sent!");
          renderDeveloperProfile(true);
        } else if (act === "report-user") {
          const reason = prompt("Optional reason for reporting this profile:");
          if (reason !== null) {
            await api(`/connect/${encodeURIComponent(target)}/report`, { method: "POST", body: { message: reason } });
            notify("Report submitted for moderation review.");
          }
        } else if (act === "block-user") {
          await api(`/connect/${encodeURIComponent(target)}/block`, { method: "POST", body: {} });
          notify(`Blocked @${target}.`);
          renderDeveloperProfile(true);
        }
      } catch (err) {
        notify(err.message);
      }
    }
  });

  root.addEventListener("change", (e) => {
    const target = e.target;
    if (target.matches("[data-dp-action='change-activity-year']")) {
      state.activityYear = target.value;
      state.tabCache = {};
      renderDeveloperProfile(true);
    } else if (target.matches("[data-dp-action='filter-timeline-type']")) {
      state.timelineType = target.value;
      state.tabCache = {};
      renderDeveloperProfile(true);
    } else if (target.matches("[data-dp-action='filter-project-cat']")) {
      state.projectCategory = target.value;
      if (state.publicData) root.innerHTML = buildProfileShell(state.publicData, state.tabCache[Object.keys(state.tabCache).find((k) => k.endsWith(":projects")) || ""]);
    }
  });

  root.addEventListener("input", (e) => {
    if (e.target.matches("[data-dp-action='search-project']")) {
      state.projectSearch = e.target.value;
      if (state.publicData) {
        const key = Object.keys(state.tabCache).find((k) => k.endsWith(":projects"));
        root.innerHTML = buildProfileShell(state.publicData, key ? state.tabCache[key] : null);
        const inp = root.querySelector("[data-dp-action='search-project']");
        if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
      }
    }
  });

  // =========================================================================
  // Global Navigation Helpers & Route Integration
  // =========================================================================
  window.openPublicProfile = function (username, options = {}) {
    if (!username) return window.openProfilePage();
    const clean = String(username).replace(/^@+/, "").trim();
    state.mode = "public";
    state.targetUsername = clean;
    state.visitorPreview = Boolean(options.asVisitor);
    state.activeTab = options.tab || "overview";
    state.selectedDay = null;
    state.tabCache = {};
    if (typeof show === "function") show("profile", true, false);
    const qs = new URLSearchParams();
    if (state.activeTab !== "overview") qs.set("tab", state.activeTab);
    if (state.visitorPreview) qs.set("asVisitor", "1");
    const targetPath = `/u/${encodeURIComponent(clean)}${qs.toString() ? "?" + qs.toString() : ""}`;
    if (location.pathname + location.search !== targetPath) history.pushState(null, "", targetPath);
    renderDeveloperProfile(true);
  };

  window.openProfilePage = function () {
    state.mode = "self";
    state.targetUsername = null;
    state.visitorPreview = false;
    state.activeTab = "overview";
    state.tabCache = {};
    if (typeof show === "function") show("profile", true, false);
    if (location.pathname !== "/profile") history.pushState(null, "", "/profile");
    renderDeveloperProfile(true);
  };

  window.renderProfilePage = function (force = false) {
    if (!root.classList.contains("on") && !force) return;
    renderDeveloperProfile(force);
  };

  window.openProfileSettings = function () {
    if (typeof show === "function") show("settings", true, false);
    if (location.pathname !== "/profile/settings") history.pushState(null, "", "/profile/settings");
    renderSettingsHub("profile");
  };

  window.openPrivacySettings = function () {
    if (typeof show === "function") show("settings", true, false);
    if (location.pathname !== "/profile/settings/privacy") history.pushState(null, "", "/profile/settings/privacy");
    renderSettingsHub("privacy");
  };

  window.renderSettingsSubRoute = function (sub) {
    const path = location.pathname.replace(/\/+$/, "");
    renderSettingsHub(path === "/theme" ? "appearance" : path.endsWith("/privacy") ? "privacy" : ["/profile/settings", "/settings/profile"].includes(path) ? "profile" : "account");
  };

  // Delegate settings navigation clicks from navbar & cards
  document.addEventListener("click", (e) => {
    const profLink = e.target.closest("[data-dp-nav-profile], a[href='/profile'], a[href^='/u/']");
    if (profLink && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      const href = profLink.getAttribute("href") || "";
      if (href.startsWith("/u/")) {
        e.preventDefault();
        window.openPublicProfile(decodeURIComponent(href.slice(3).split("?")[0]));
      } else if (href === "/profile" || profLink.hasAttribute("data-dp-nav-profile")) {
        e.preventDefault();
        window.openProfilePage();
      }
      return;
    }
    const setProfLink = e.target.closest("[data-dp-nav-settings-profile], a[href='/profile/settings']");
    if (setProfLink && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      window.openProfileSettings();
      return;
    }
    const setPrivLink = e.target.closest("[data-dp-nav-settings-privacy], a[href='/profile/settings/privacy']");
    if (setPrivLink && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      window.openPrivacySettings();
    }
  });

  document.addEventListener("click", (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const settingsLink = e.target.closest('a[href="/profile/settings"],a[href="/settings/profile"],a[href="/profile/settings/privacy"],a[href="/settings/privacy"]');
    if (settingsLink) {
      e.preventDefault(); e.stopImmediatePropagation();
      document.querySelectorAll('.nav-account[open]').forEach(menu => menu.open = false);
      if (settingsLink.getAttribute('href').endsWith('/privacy')) window.openPrivacySettings();
      else window.openProfileSettings();
      return;
    }
    const theme = e.target.closest('[data-v="settings"], a[href="/theme"]');
    if (!theme) return;
    e.preventDefault(); e.stopImmediatePropagation();
    history.pushState(null, "", "/theme");
    if (typeof show === "function") show("settings", true, false);
    renderSettingsHub("appearance");
  }, true);
  // Handle initial route on load + popstate
  function syncFromLocation() {
    const parsed = parseRouteFromUrl();
    if (!parsed) return;
    if (parsed.view === "profile") {
      state.mode = parsed.username ? "public" : "self";
      state.targetUsername = parsed.username;
      state.visitorPreview = parsed.asVisitor;
      state.activeTab = parsed.tab || "overview";
      if (typeof show === "function") show("profile", true, false);
      renderDeveloperProfile(true);
    } else if (parsed.view === "settings") {
      if (typeof show === "function") show("settings", true, false);
      renderSettingsHub(parsed.settingsTab);
    }
  }

  window.addEventListener("popstate", syncFromLocation);

  // Sync Dashboard widgets on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      syncFromLocation();
      window.renderDashboardGoalsAndReadiness();
    });
  } else {
    syncFromLocation();
    window.renderDashboardGoalsAndReadiness();
  }
})();
