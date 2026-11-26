const db = require("../db");
const { levelTitle } = require("./policy");
const dayMs = 86400000;
const sources = {
  lesson_complete: ["learning", "Completed a lesson"],
  challenge_pass: ["coding", "Solved a coding challenge"],
  project_submit: ["projects", "Submitted a project"],
  achievement_unlock: ["achievements", "Unlocked an achievement"],
  streak_bonus: ["study", "Completed a study activity"],
};
async function rows(sql, params = []) {
  if (db.isPostgres())
    return (await require("../db-postgres").query(sql, params)).rows;
  return db.db.prepare(sql.replace(/\$\d+/g, "?")).all(...params);
}
function daySql() {
  return db.isPostgres()
    ? "to_char(created_at::timestamptz AT TIME ZONE 'Asia/Kolkata','YYYY-MM-DD')"
    : "strftime('%Y-%m-%d',created_at,'+330 minutes')";
}
function metricValue(stats, key) {
  return Number(stats[key === "xp" ? "totalXp" : key] || 0);
}
async function scalar(sql, params) {
  return Number((await rows(sql, params))[0]?.value || 0);
}
function meaningfulXp(alias = "") {
  const x = alias ? alias + "." : "";
  return `(${x}source_type IN ('lesson_complete','challenge_pass','achievement_unlock') OR (${x}source_type='project_submit' AND ${x}reference_id NOT LIKE 'vote-%') OR (${x}source_type='streak_bonus' AND (${x}reference_id LIKE 'focus:%' OR ${x}reference_id LIKE 'assignment:%')))`;
}
function streaks(days, now = new Date()) {
  const today = new Date(now.getTime() + 330 * 60000)
      .toISOString()
      .slice(0, 10),
    set = new Set(days),
    sorted = [...set].filter((x) => x <= today).sort();
  let longest = 0,
    run = 0,
    last = null;
  for (const day of sorted) {
    const n = Date.parse(day + "T00:00:00Z") / dayMs;
    run = last === n - 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    last = n;
  }
  let cursor = Date.parse(today + "T00:00:00Z") / dayMs;
  if (!set.has(today)) cursor--;
  let current = 0;
  while (set.has(new Date(cursor * dayMs).toISOString().slice(0, 10))) {
    current++;
    cursor--;
  }
  return { current, longest, activeDays: sorted.length };
}
async function overview(user) {
  const id = user.id;
  const [
    totalXp,
    problems,
    submissions,
    accepted,
    projects,
    lessons,
    certificates,
    badges,
    events,
    activityDays,
    courseProgress,
  ] = await Promise.all([
    db.getUserTotalXp(id),
    scalar(
      "SELECT count(DISTINCT challenge_id) AS value FROM submissions WHERE user_id=$1 AND status='passed'",
      [id],
    ),
    scalar("SELECT count(*) AS value FROM submissions WHERE user_id=$1", [id]),
    scalar(
      "SELECT count(*) AS value FROM submissions WHERE user_id=$1 AND status='passed'",
      [id],
    ),
    scalar("SELECT count(*) AS value FROM projects WHERE user_id=$1 AND status='approved'", [id]),
    scalar(
      "SELECT count(*) AS value FROM lesson_progress WHERE user_id=$1 AND status='completed'",
      [id],
    ),
    scalar(
      "SELECT count(*) AS value FROM issued_certificates WHERE lower(recipient_email)=lower($1) AND lower(status)='valid'",
      [user.email],
    ),
    scalar("SELECT count(*) AS value FROM user_achievements WHERE user_id=$1", [
      id,
    ]),
    scalar(
      "SELECT count(DISTINCT event_slug) AS value FROM event_participants WHERE lower(candidate_email)=lower($1)",
      [user.email],
    ),
    rows(
      `SELECT DISTINCT ${daySql()} AS day FROM xp_ledger WHERE user_id=$1 AND ${meaningfulXp()}`,
      [id],
    ),
    learning(id),
  ]);
  const coursesCompleted = courseProgress.filter(
    (c) => Number(c.total_lessons) > 0 && Number(c.completed_lessons) >= Number(c.total_lessons),
  ).length;
  const streak = streaks(activityDays.map((x) => x.day));
  const level = db.calculateLevel(totalXp);
  const nextXp = 100 * level * level,
    previousXp = 100 * (level - 1) * (level - 1);
  const rankRows = await db.getLeaderboard("All-time", 5, id);
  const monthlyRows = await db.getLeaderboard("Monthly", 5, id);
  const rank = rankRows.find((x) => x.userId === id)?.rank ?? null,
    monthlyRank = monthlyRows.find((x) => x.userId === id)?.rank ?? null;
  return {
    totalXp,
    level,
    title: levelTitle(level),
    nextXp,
    xpToNext: Math.max(0, nextXp - totalXp),
    levelPercent: Math.max(
      0,
      Math.min(
        100,
        Math.round(((totalXp - previousXp) / (nextXp - previousXp)) * 100),
      ),
    ),
    currentStreak: streak.current,
    longestStreak: streak.longest,
    activeDays: streak.activeDays,
    problems,
    submissions,
    accepted,
    acceptanceRate: submissions
      ? Math.round((accepted / submissions) * 100)
      : 0,
    projects,
    lessons,
    coursesCompleted,
    certificates,
    badges,
    hackathons: events,
    globalRank: rank,
    monthlyRank,
    collegeRank: null,
    contestRating: null,
    codingHours: null,
    profileViews: null,
    contests: null,
    hackathonsWon: null,
  };
}
async function activity(userId, year) {
  const localNow = Date.now() + 330 * 60000;
  const y = Number(year),
    start =
      year === "rolling"
        ? new Date(localNow - 364 * dayMs).toISOString().slice(0, 10)
        : `${y}-01-01`,
    end =
      year === "rolling"
        ? new Date(localNow + dayMs).toISOString().slice(0, 10)
        : `${y + 1}-01-01`;
  const days = await rows(
    `SELECT ${daySql()} AS day,count(*) AS count FROM xp_ledger WHERE user_id=$1 AND ${daySql()} >= $2 AND ${daySql()} < $3 AND ${meaningfulXp()} GROUP BY ${daySql()} ORDER BY day`,
    [userId, start, end],
  );
  return {
    start,
    end,
    timezone: "Asia/Kolkata",
    days: days.map((x) => ({ date: x.day, count: Number(x.count) })),
    total: days.reduce((n, x) => n + Number(x.count), 0),
    activeDays: days.length,
    definition:
      "One recorded, idempotent platform XP event per completed learning, coding, project, achievement or study activity. Refreshes and votes do not add contributions.",
  };
}
async function timeline(userId, { before, limit = 20, type } = {}) {
  const n = Math.max(1, Math.min(50, Number(limit) || 20));
  let filter = "",
    params = [userId];
  if (before) {
    let cursor;
    try {
      cursor = JSON.parse(Buffer.from(before, "base64url").toString());
    } catch {
      throw Object.assign(new Error("Invalid cursor."), { status: 400 });
    }
    if (
      !Array.isArray(cursor) ||
      cursor.length !== 2 ||
      typeof cursor[0] !== "string" ||
      !Number.isFinite(Date.parse(cursor[0])) ||
      typeof cursor[1] !== "string" ||
      cursor[1].length > 120
    )
      throw Object.assign(new Error("Invalid cursor."), { status: 400 });
    params.push(cursor[0], cursor[0], cursor[1]);
    filter += ` AND (created_at < $${params.length - 2} OR (created_at=$${params.length - 1} AND id < $${params.length}))`;
  }
  if (type && type !== "all") {
    const keys = Object.entries(sources)
      .filter(([, v]) => v[0] === type)
      .map(([k]) => k);
    if (!keys.length) return { items: [], next: null };
    filter +=
      " AND source_type IN (" +
      keys
        .map((k) => {
          params.push(k);
          return "$" + params.length;
        })
        .join(",") +
      ")";
  }
  params.push(n + 1);
  const result = await rows(
    `SELECT id,amount,source_type,reference_id,created_at FROM xp_ledger WHERE user_id=$1 AND ${meaningfulXp()} ${filter} ORDER BY created_at DESC,id DESC LIMIT $${params.length}`,
    params,
  );
  return {
    items: result.slice(0, n).map((x) => ({
      id: x.id,
      type: sources[x.source_type]?.[0] || "study",
      title: sources[x.source_type]?.[1] || "Platform activity",
      xp: x.amount,
      date: x.created_at,
    })),
    next:
      result.length > n
        ? Buffer.from(
            JSON.stringify([result[n - 1].created_at, result[n - 1].id]),
          ).toString("base64url")
        : null,
  };
}
async function coding(userId) {
  const [difficulty, topics, languages, recent, monthly] = await Promise.all([
    rows(
      "SELECT c.difficulty,count(DISTINCT s.challenge_id) AS solved FROM submissions s JOIN challenges c ON c.id=s.challenge_id WHERE s.user_id=$1 AND s.status='passed' GROUP BY c.difficulty",
      [userId],
    ),
    rows(
      "SELECT c.category AS topic,count(DISTINCT s.challenge_id) AS solved FROM submissions s JOIN challenges c ON c.id=s.challenge_id WHERE s.user_id=$1 AND s.status='passed' GROUP BY c.category",
      [userId],
    ),
    rows(
      "SELECT language,count(*) AS submissions FROM submissions WHERE user_id=$1 GROUP BY language",
      [userId],
    ),
    rows(
      "SELECT s.id,s.challenge_id,s.status,s.language,s.created_at,c.title FROM submissions s JOIN challenges c ON c.id=s.challenge_id WHERE s.user_id=$1 ORDER BY s.created_at DESC LIMIT 20",
      [userId],
    ),
    rows(
      "SELECT substr(created_at,1,7) AS month,count(DISTINCT challenge_id) AS solved FROM submissions WHERE user_id=$1 AND status='passed' GROUP BY substr(created_at,1,7) ORDER BY month DESC LIMIT 12",
      [userId],
    ),
  ]);
  return {
    difficulty: difficulty.map((r) => ({ ...r, solved: Number(r.solved || 0) })),
    topics: topics.map((r) => ({ ...r, solved: Number(r.solved || 0) })),
    languages: languages.map((r) => ({ ...r, submissions: Number(r.submissions || 0) })),
    recent,
    monthly: monthly.map((r) => ({ ...r, solved: Number(r.solved || 0) })),
    gradingAvailable: false,
    notice:
      "Statistics use recorded submissions. Official server grading is currently unavailable; running samples does not create accepted results.",
    contestRating: null,
    personalBestRating: null,
  };
}
async function learning(userId) {
  const list = await rows(
    `SELECT c.id,c.title,c.category,count(l.id) AS total_lessons,coalesce(sum(CASE WHEN lp.status='completed' THEN 1 ELSE 0 END),0) AS completed_lessons,coalesce(sum(coalesce(lp.reading_seconds,0)),0) AS reading_seconds FROM courses c JOIN lessons l ON l.course_id=c.id LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=$1 GROUP BY c.id,c.title,c.category ORDER BY c.title`,
    [userId],
  );
  return list.map((r) => ({
    ...r,
    total_lessons: Number(r.total_lessons || 0),
    completed_lessons: Number(r.completed_lessons || 0),
    reading_seconds: Number(r.reading_seconds || 0),
    completed: Number(r.total_lessons || 0) > 0 && Number(r.completed_lessons || 0) >= Number(r.total_lessons || 0),
  }));
}
async function eventHistory(user) {
  return (
    await rows(
      "SELECT event_slug,team_name,candidate_role,is_eligible,created_at FROM event_participants WHERE lower(candidate_email)=lower($1) ORDER BY created_at DESC LIMIT 100",
      [user.email],
    )
  ).map((r) => ({
    event: r.event_slug,
    team: r.team_name || null,
    role: r.candidate_role || null,
    eligible: r.is_eligible === true || r.is_eligible === 1,
    date: r.created_at,
    rank: null,
    prize: null,
    status: "registered",
  }));
}
async function certificateList(user) {
  return (await db.getUserCertificates(user.email)).map((c) => ({
    id: c.credential_id,
    title: c.event_slug,
    type: c.certificate_type,
    issueDate: c.issue_date,
    status: c.status,
    verificationUrl:
      c.event_slug === "innovative-india-2026"
        ? "/api/certificates/innovative-india/verify/" +
          encodeURIComponent(c.credential_id)
        : "/api/certificates/verify/" + encodeURIComponent(c.credential_id),
    downloadUrl: c.event_slug === "orca-coders-orcathon-2026" ? "/orcathon-certificate/" : "/my-certificate",
  }));
}
async function workspace(userId) {
  const result = {};
  for (const table of [
    "workspace_tasks",
    "workspace_notes",
    "workspace_assignments",
    "workspace_snippets",
    "workspace_bookmarks",
  ])
    result[table.replace("workspace_", "")] = await scalar(
      `SELECT count(*) AS value FROM ${table} WHERE user_id=$1`,
      [userId],
    );
  return result;
}
async function xpSources(userId) {
  return rows(
    "SELECT source_type AS source,sum(amount) AS xp FROM xp_ledger WHERE user_id=$1 GROUP BY source_type",
    [userId],
  );
}
module.exports = {
  rows,
  scalar,
  overview,
  activity,
  timeline,
  coding,
  learning,
  eventHistory,
  certificateList,
  workspace,
  xpSources,
  streaks,
  meaningfulXp,
  daySql,
  metricValue,
};
