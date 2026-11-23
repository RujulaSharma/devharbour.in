const dayMs = 24 * 60 * 60 * 1000;
const indiaOffsetMs = 330 * 60 * 1000;

function currentActivityStreaks(rows, now = Date.now()) {
  const today = Math.floor((now + indiaOffsetMs) / dayMs);
  const daysByUser = new Map();
  for (const { user_id: userId, activity_day: date } of rows) {
    const day = Date.parse(date + 'T00:00:00Z') / dayMs;
    if (!Number.isFinite(day) || day > today) continue;
    if (!daysByUser.has(userId)) daysByUser.set(userId, new Set());
    daysByUser.get(userId).add(day);
  }

  const streaks = new Map();
  for (const [userId, days] of daysByUser) {
    let day = days.has(today) ? today : today - 1;
    let streak = 0;
    while (days.has(day)) {
      streak++;
      day--;
    }
    streaks.set(userId, streak);
  }
  return streaks;
}

module.exports = { currentActivityStreaks };
