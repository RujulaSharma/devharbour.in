const progress = require("./progress");

// Uses recorded timestamps and the same event definitions as the activity calendar.
// Registration counts are never presented as wins or completed participation.
async function recap(user, year) {
  const calendar = await progress.activity(user.id, String(year));
  const start = `${year}-01-01`,
    end = `${year + 1}-01-01`;
  const inYear = "created_at >= $2 AND created_at < $3";
  const [xp, problems, projects, lessons, badges, events, language] =
    await Promise.all([
      progress.scalar(
        `SELECT coalesce(sum(amount),0) AS value FROM xp_ledger WHERE user_id=$1 AND ${inYear}`,
        [user.id, start, end],
      ),
      progress.scalar(
        `SELECT count(DISTINCT challenge_id) AS value FROM submissions WHERE user_id=$1 AND status='passed' AND ${inYear}`,
        [user.id, start, end],
      ),
      progress.scalar(
        `SELECT count(*) AS value FROM projects WHERE user_id=$1 AND ${inYear}`,
        [user.id, start, end],
      ),
      progress.scalar(
        "SELECT count(*) AS value FROM lesson_progress WHERE user_id=$1 AND status='completed' AND completed_at >= $2 AND completed_at < $3",
        [user.id, start, end],
      ),
      progress.scalar(
        "SELECT count(*) AS value FROM user_achievements WHERE user_id=$1 AND unlocked_at >= $2 AND unlocked_at < $3",
        [user.id, start, end],
      ),
      progress.scalar(
        `SELECT count(*) AS value FROM event_participants WHERE lower(candidate_email)=lower($1) AND ${inYear}`,
        [user.email, start, end],
      ),
      progress.rows(
        `SELECT language,count(*) AS submissions FROM submissions WHERE user_id=$1 AND ${inYear} GROUP BY language ORDER BY count(*) DESC,language LIMIT 1`,
        [user.id, start, end],
      ),
    ]);
  const months = new Map();
  for (const day of calendar.days) {
    const key = day.date.slice(0, 7);
    months.set(key, (months.get(key) || 0) + day.count);
  }
  const ordered = [...months].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const streak = progress.streaks(calendar.days.map((x) => x.date));
  return {
    year,
    xp,
    problems,
    projects,
    lessons,
    badges,
    eventRegistrations: events,
    contributions: calendar.total,
    activeDays: calendar.activeDays,
    longestStreak: streak.longest,
    mostActiveMonth: ordered[0]?.[0] || null,
    mostUsedLanguage: language[0]?.language || null,
    monthly: [...months].map(([month, count]) => ({ month, count })),
    note: "Only recorded platform activity is counted. Projects are submissions, events are registrations, and lessons use saved completion dates. Contest results and coding hours are unavailable.",
  };
}

function readiness(profile, stats, uploads) {
  const role = profile.details?.targetRole || null;
  const checks = [
    { label: "Add a target role", done: !!role, action: "edit" },
    {
      label: "Record an accepted coding solution",
      done: stats.problems > 0,
      action: "coding",
    },
    {
      label: "Build a project portfolio",
      done: stats.projects > 0,
      action: "projects",
    },
    { label: "Complete a lesson", done: stats.lessons > 0, action: "learning" },
    {
      label: "Upload a resume",
      done: uploads.some((x) => x.kind === "resume"),
      action: "upload",
    },
  ];
  return {
    role,
    checks,
    completed: checks.filter((x) => x.done).length,
    total: checks.length,
    unavailable: [
      "Verified role-specific assessments",
      "Interview performance",
    ],
    notice:
      "This checklist tracks profile and learning evidence. It does not measure employment eligibility, guarantee a job, or verify self-reported skills.",
  };
}
module.exports = { recap, readiness };
