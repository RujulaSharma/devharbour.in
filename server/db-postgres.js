// PostgreSQL implementation of the existing backend's data-access contract.
const crypto = require('node:crypto');
const { AsyncLocalStorage } = require('node:async_hooks');
const { getPrisma } = require('./prisma');
const context = new AsyncLocalStorage();
const p = () => context.getStore() || getPrisma();
const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const id = (prefix = '') => prefix + crypto.randomUUID();
const clean = value => (value || '').trim();
const email = value => clean(value).toLowerCase();

// Serialize multi-step rewards/toggles for each user. Nested helpers share the
// same transaction, so an error cannot leave progress, counters or XP half saved.
async function transaction(userId, action) {
  if (context.getStore()) return action();
  return getPrisma().$transaction(tx => context.run(tx, async () => {
    if (userId) await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
    return action();
  }), { maxWait: 15000, timeout: 60000 });
}

function calculateLevel(xp) {
  const thresholds = [100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000];
  const index = thresholds.findIndex(t => xp < t);
  return index < 0 ? 10 + Math.floor((xp - 12000) / 5000) : index + 1;
}

async function getUserById(userId) {
  const user = await p().users.findUnique({ where: { id: userId } });
  if (!user) return null;
  const { password_hash, salt, updated_at, ...profile } = user;
  return profile;
}
const getUserByEmail = value => p().users.findFirst({ where: { email: { equals: email(value), mode: 'insensitive' } } });
const getUserByUsername = value => p().users.findFirst({ where: { username: { equals: email(value), mode: 'insensitive' } } });

async function createUser({ email: address, username, fullName, passwordHash, salt, role = 'student', location = '', bio = '' }) {
  return transaction(null, async () => {
    const userId = id('usr-');
    await p().users.create({ data: {
      id: userId, email: email(address), username: email(username), full_name: clean(fullName),
      password_hash: passwordHash, salt, role, location: clean(location), bio: clean(bio),
    } });
    await p().user_settings.create({ data: { user_id: userId, theme: 'light' } });
    return getUserById(userId);
  });
}

async function updateUserProfile(userId, { fullName, bio, githubUrl, portfolioUrl, location, avatarUrl }) {
  await p().users.update({ where: { id: userId }, data: {
    full_name: fullName, bio, github_url: githubUrl, portfolio_url: portfolioUrl,
    location, avatar_url: avatarUrl, updated_at: now(),
  } });
  return getUserById(userId);
}

async function updateStreak(userId) {
  return transaction(userId, async () => {
    const user = await getUserById(userId);
    if (!user) return 0;
    const today = new Date().toISOString().slice(0, 10);
    if (user.last_active_date === today) return user.streak_days;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const streak = user.last_active_date === yesterday ? (user.streak_days || 0) + 1 : 1;
    await p().users.update({ where: { id: userId }, data: { streak_days: streak, last_active_date: today } });
    return streak;
  });
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + Number(process.env.TOKEN_EXPIRY_DAYS || 7) * 86400000).toISOString();
  await p().sessions.create({ data: { id: id(), user_id: userId, token, expires_at: expiresAt } });
  return { token, expiresAt };
}
async function getSession(token) {
  if (!token) return null;
  const session = await p().sessions.findUnique({ where: { token } });
  return session && Date.parse(session.expires_at) > Date.now() ? session : null;
}
const deleteSession = token => p().sessions.deleteMany({ where: { token } });

async function getUserTotalXp(userId) {
  const result = await p().xp_ledger.aggregate({ where: { user_id: userId }, _sum: { amount: true } });
  return result._sum.amount || 0;
}
const getXpHistory = (userId, limit = 20) => p().xp_ledger.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' }, take: limit });

async function awardXp(userId, amount, sourceType, referenceId, note = '') {
  return transaction(userId, async () => {
    const inserted = await p().xp_ledger.createMany({ data: [{
      id: id(), user_id: userId, amount, source_type: sourceType, reference_id: referenceId, note,
    }], skipDuplicates: true });
    // Preserve the existing API's event total; achievement bonuses are separate
    // ledger events and appear in the next profile/leaderboard fetch.
    const totalXp = await getUserTotalXp(userId);
    if (inserted.count) {
      await updateStreak(userId);
      await checkAndUnlockAchievements(userId);
    }
    return inserted.count ? { awarded: true, amount, currentXp: totalXp, level: calculateLevel(totalXp) }
      : { awarded: false, reason: 'Already awarded for this activity', currentXp: totalXp, level: calculateLevel(totalXp) };
  });
}

async function getLeaderboard(timeframe = 'All-time', limit = 20) {
  const days = timeframe === 'Weekly' ? 7 : timeframe === 'Monthly' ? 30 : null;
  const cutoff = days ? new Date(Date.now() - days * 86400000).toISOString().replace('T', ' ').slice(0, 19) : '';
  const rows = await p().$queryRaw`
    SELECT u.id AS user_id, u.username, u.full_name, u.avatar_url, u.streak_days,
      COALESCE(SUM(l.amount), 0)::int AS total_xp,
      COUNT(DISTINCT CASE WHEN l.source_type = 'challenge_pass' THEN l.reference_id END)::int AS challenges_solved
    FROM users u LEFT JOIN xp_ledger l ON u.id = l.user_id AND l.created_at >= ${cutoff}
    GROUP BY u.id ORDER BY total_xp DESC, challenges_solved DESC, u.created_at ASC LIMIT ${limit}`;
  return rows.map((r, index) => ({ rank: index + 1, userId: r.user_id, username: r.username,
    fullName: r.full_name, avatarUrl: r.avatar_url, xp: r.total_xp, level: calculateLevel(r.total_xp),
    challengesSolved: r.challenges_solved, streakDays: r.streak_days }));
}

const getCourses = category => p().courses.findMany({ where: category && category !== 'All' ? { category } : {}, orderBy: [{ is_featured: 'desc' }, { rating: 'desc' }] });
const getCourseById = courseId => p().courses.findUnique({ where: { id: courseId } });
const getCourseLessons = courseId => p().lessons.findMany({ where: { course_id: courseId }, orderBy: { order_index: 'asc' }, select: { id: true, course_id: true, title: true, slug: true, reading_time_mins: true, order_index: true } });
const getLessonById = lessonId => p().lessons.findUnique({ where: { id: lessonId } });
const getLessonProgress = (userId, lessonId) => p().lesson_progress.findUnique({ where: { user_id_lesson_id: { user_id: userId, lesson_id: lessonId } } });
async function saveLessonProgress(userId, lessonId, readingSeconds, markCompleted = false) {
  return transaction(userId, async () => {
    const existing = await getLessonProgress(userId, lessonId);
    const data = { status: markCompleted ? 'completed' : existing?.status || 'in_progress',
      completed_at: markCompleted ? new Date().toISOString() : existing?.completed_at || null };
    const progress = await p().lesson_progress.upsert({
      where: { user_id_lesson_id: { user_id: userId, lesson_id: lessonId } },
      create: { id: id(), user_id: userId, lesson_id: lessonId, ...data, reading_seconds: readingSeconds },
      update: { ...data, reading_seconds: { increment: readingSeconds } },
    });
    const xp = markCompleted ? await awardXp(userId, 10, 'lesson_complete', lessonId, 'Completed reading lesson') : null;
    return { progress, xp };
  });
}

function getChallenges(category, difficulty, search = '') {
  return p().challenges.findMany({ where: {
    ...(category && category !== 'All' ? { category } : {}),
    ...(difficulty && difficulty !== 'All' ? { difficulty } : {}),
    ...(search ? { OR: ['title', 'description'].map(field => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}),
  }, orderBy: { id: 'asc' }, select: { id: true, title: true, slug: true, difficulty: true, category: true, time_estimate: true, description: true, xp_reward: true } });
}
async function getChallengeById(challengeId, includeHidden = false) {
  const ch = await p().challenges.findFirst({ where: { OR: [{ id: challengeId }, { slug: challengeId }] } });
  if (!ch) return null;
  return { id: ch.id, title: ch.title, slug: ch.slug, difficulty: ch.difficulty, category: ch.category,
    timeEstimate: ch.time_estimate, description: ch.description, examples: JSON.parse(ch.examples_json || '[]'),
    starterCodeJs: ch.starter_code_js, publicTests: JSON.parse(ch.public_tests_json || '[]'),
    hiddenTests: includeHidden ? JSON.parse(ch.hidden_tests_json || '[]') : undefined, xpReward: ch.xp_reward };
}
async function recordSubmission({ userId, challengeId, code, language, status, executionTimeMs, passedTests, totalTests, errorMessage }) {
  return transaction(userId, async () => {
    const submissionId = id();
    await p().submissions.create({ data: { id: submissionId, user_id: userId, challenge_id: challengeId,
      code, language, status, execution_time_ms: Math.round(executionTimeMs || 0), passed_tests: passedTests,
      total_tests: totalTests, error_message: errorMessage || '' } });
    const ch = status === 'passed' ? await getChallengeById(challengeId) : null;
    const xp = ch ? await awardXp(userId, ch.xpReward, 'challenge_pass', challengeId, `Passed challenge ${ch.title}`) : null;
    return { submissionId, status, xp };
  });
}
const getUserSubmissions = (userId, challengeId) => p().submissions.findMany({ where: { user_id: userId, ...(challengeId ? { challenge_id: challengeId } : {}) }, orderBy: { created_at: 'desc' }, ...(challengeId ? {} : { take: 50 }) });

function projectView(row, detailed = false) {
  const owner = row.relation_user_id;
  return { id: row.id, ...(detailed ? { userId: row.user_id } : {}), title: row.title, description: row.description,
    category: row.category, techStack: JSON.parse(row.tech_stack_json || '[]'), repoUrl: row.repo_url,
    demoUrl: row.demo_url, votesCount: row.votes_count, bookmarksCount: row.bookmarks_count,
    status: row.status, createdAt: row.created_at,
    owner: { id: owner.id, username: owner.username, fullName: owner.full_name, avatarUrl: owner.avatar_url } };
}
const ownerInclude = { relation_user_id: { select: { id: true, username: true, full_name: true, avatar_url: true } } };
async function getProjects({ category = 'All', search = '', status = 'approved' } = {}) {
  const rows = await p().projects.findMany({ where: { status,
    ...(category && category !== 'All' ? { category } : {}),
    ...(search ? { OR: ['title', 'description', 'tech_stack_json'].map(field => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}),
  }, orderBy: [{ votes_count: 'desc' }, { created_at: 'desc' }], include: ownerInclude });
  return rows.map(row => projectView(row));
}
async function getProjectById(projectId) {
  const row = await p().projects.findUnique({ where: { id: projectId }, include: ownerInclude });
  return row ? projectView(row, true) : null;
}
async function createProject({ userId, title, description, category, techStack = [], repoUrl, demoUrl = '' }) {
  return transaction(userId, async () => {
    const projectId = id('prj-');
    await p().projects.create({ data: { id: projectId, user_id: userId, title: clean(title), description: clean(description),
      category: clean(category), tech_stack_json: JSON.stringify(techStack), repo_url: clean(repoUrl), demo_url: clean(demoUrl), status: 'approved' } });
    await awardXp(userId, 50, 'project_submit', projectId, `Submitted project: ${title}`);
    return getProjectById(projectId);
  });
}
async function updateProject(projectId, userId, { title, description, category, techStack, repoUrl, demoUrl }) {
  return transaction(userId, async () => {
    const project = await getProjectById(projectId);
    if (!project) return null;
    if (project.userId !== userId) throw new Error('Unauthorized');
    await p().projects.update({ where: { id: projectId }, data: {
      title: title ? clean(title) : undefined, description: description ? clean(description) : undefined,
      category: category ? clean(category) : undefined, tech_stack_json: techStack ? JSON.stringify(techStack) : undefined,
      repo_url: repoUrl ? clean(repoUrl) : undefined, demo_url: demoUrl ? clean(demoUrl) : undefined, updated_at: now(),
    } });
    return getProjectById(projectId);
  });
}
async function deleteProject(projectId, userId, isAdmin = false) {
  return transaction(userId, async () => {
    const project = await getProjectById(projectId);
    if (!project) return false;
    if (!isAdmin && project.userId !== userId) throw new Error('Unauthorized');
    await p().projects.delete({ where: { id: projectId } });
    return true;
  });
}
async function incrementProjectVotes(projectId) {
  await p().projects.update({ where: { id: projectId }, data: { votes_count: { increment: 1 } } });
  return getProjectById(projectId);
}
async function toggleInteraction(model, counter, userId, projectId) {
  return transaction(userId, async () => {
    await p().$queryRaw`SELECT id FROM projects WHERE id = ${projectId} FOR UPDATE`;
    const where = { user_id_project_id: { user_id: userId, project_id: projectId } };
    const existing = await p()[model].findUnique({ where });
    if (existing) await p()[model].delete({ where });
    else await p()[model].create({ data: { id: id(), user_id: userId, project_id: projectId } });
    const row = await p().projects.findUnique({ where: { id: projectId } });
    const count = Math.max(0, (row[counter] || 0) + (existing ? -1 : 1));
    await p().projects.update({ where: { id: projectId }, data: { [counter]: count } });
    if (model === 'project_votes' && !existing) await awardXp(userId, 5, 'project_submit', `vote-${projectId}`, 'Voted on community project');
    return model === 'project_votes' ? { voted: !existing, votesCount: count } : { bookmarked: !existing, bookmarksCount: count };
  });
}
const toggleProjectVote = (userId, projectId) => toggleInteraction('project_votes', 'votes_count', userId, projectId);
const toggleProjectBookmark = (userId, projectId) => toggleInteraction('project_bookmarks', 'bookmarks_count', userId, projectId);
async function getUserInteractions(userId) {
  const votes = await p().project_votes.findMany({ where: { user_id: userId }, select: { project_id: true } });
  const bookmarks = await p().project_bookmarks.findMany({ where: { user_id: userId }, select: { project_id: true } });
  return { votes: votes.map(v => v.project_id), bookmarks: bookmarks.map(b => b.project_id) };
}

const getAchievements = () => p().achievements.findMany({ orderBy: { xp_bonus: 'asc' } });
async function checkAndUnlockAchievements(userId) {
  return transaction(userId, async () => {
    const achievements = await getAchievements();
    const unlocked = [];
    for (const achievement of achievements) {
      const where = { user_id_achievement_id: { user_id: userId, achievement_id: achievement.id } };
      if (await p().user_achievements.findUnique({ where })) continue;
      let count = 0;
      if (achievement.condition_type === 'lessons_completed') count = await p().lesson_progress.count({ where: { user_id: userId, status: 'completed' } });
      else if (achievement.condition_type === 'challenges_passed') count = (await p().submissions.findMany({ where: { user_id: userId, status: 'passed' }, distinct: ['challenge_id'], select: { challenge_id: true } })).length;
      else if (achievement.condition_type === 'projects_submitted') count = await p().projects.count({ where: { user_id: userId } });
      else if (achievement.condition_type === 'projects_voted') count = await p().project_votes.count({ where: { user_id: userId } });
      if (count >= achievement.condition_value) {
        await p().user_achievements.create({ data: { id: id(), user_id: userId, achievement_id: achievement.id } });
        // Insert the unlock before awarding XP so recursive achievement checks terminate.
        await awardXp(userId, achievement.xp_bonus, 'achievement_unlock', achievement.id, `Unlocked achievement: ${achievement.title}`);
        unlocked.push(achievement);
      }
    }
    return unlocked;
  });
}
async function getUserAchievements(userId) {
  const rows = await p().user_achievements.findMany({ where: { user_id: userId }, orderBy: { unlocked_at: 'desc' }, include: { relation_achievement_id: true } });
  return rows.map(row => {
    const a = row.relation_achievement_id;
    return { id: a.id, key: a.key, title: a.title, description: a.description, badge_icon: a.badge_icon, xp_bonus: a.xp_bonus, unlocked_at: row.unlocked_at };
  });
}
async function getUserSettings(userId) {
  return await p().user_settings.findUnique({ where: { user_id: userId }, select: { theme: true, email_notifications: true, profile_public: true } })
    || { theme: 'light', email_notifications: 1, profile_public: 1 };
}
async function saveUserSettings(userId, { theme, emailNotifications, profilePublic }) {
  const data = { theme: theme || 'light', email_notifications: emailNotifications === undefined ? 1 : Number(!!emailNotifications), profile_public: profilePublic === undefined ? 1 : Number(!!profilePublic) };
  await p().user_settings.upsert({ where: { user_id: userId }, create: { user_id: userId, ...data }, update: { ...data, updated_at: now() } });
  return getUserSettings(userId);
}
async function getUserSummaryCounts(userId) {
  return {
    completedLessons: await p().lesson_progress.count({ where: { user_id: userId, status: 'completed' } }),
    solvedChallenges: (await p().submissions.findMany({ where: { user_id: userId, status: 'passed' }, distinct: ['challenge_id'], select: { challenge_id: true } })).length,
    submittedProjects: await p().projects.count({ where: { user_id: userId } }),
  };
}
async function getUserPublicProjects(userId) {
  const rows = await p().projects.findMany({ where: { user_id: userId, status: 'approved' }, select: { id: true, title: true, description: true, category: true, tech_stack_json: true, repo_url: true, demo_url: true, votes_count: true } });
  return rows.map(row => ({ ...row, techStack: JSON.parse(row.tech_stack_json || '[]') }));
}

async function getWorkspaceData(userId) {
  return {
    tasks: await p().workspace_tasks.findMany({ where: { user_id: userId }, orderBy: [{ status: 'asc' }, { due_date: { sort: 'asc', nulls: 'first' } }, { created_at: 'desc' }] }),
    notes: await p().workspace_notes.findMany({ where: { user_id: userId }, orderBy: [{ is_pinned: 'desc' }, { updated_at: 'desc' }] }),
    assignments: await p().workspace_assignments.findMany({ where: { user_id: userId }, orderBy: [{ due_date: { sort: 'asc', nulls: 'first' } }, { created_at: 'desc' }] }),
    snippets: await p().workspace_snippets.findMany({ where: { user_id: userId }, orderBy: { updated_at: 'desc' } }),
    bookmarks: await p().workspace_bookmarks.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' } }),
  };
}
const createWorkspaceTask = (userId, { title, subject, priority, dueDate }) => p().workspace_tasks.create({ data: {
  id: id('tsk-'), user_id: userId, title: clean(title), subject: clean(subject || 'General'), priority: priority || 'medium', due_date: dueDate || null, status: 'pending',
} });
async function updateOwned(model, userId, itemId, data) {
  // Ownership stays in the UPDATE predicate, so it cannot change between a read and write.
  const result = await p()[model].updateMany({ where: { id: itemId, user_id: userId }, data: { ...data, updated_at: now() } });
  return result.count ? p()[model].findFirst({ where: { id: itemId, user_id: userId } }) : null;
}
const trimIfDefined = value => value === undefined ? undefined : clean(value);
const updateWorkspaceTask = (userId, itemId, { title, subject, priority, dueDate, status }) => updateOwned('workspace_tasks', userId, itemId, {
  title: trimIfDefined(title), subject: trimIfDefined(subject), priority, due_date: dueDate, status,
});
const createWorkspaceNote = (userId, { title, content, subject, tags, link, isPinned }) => p().workspace_notes.create({ data: {
  id: id('not-'), user_id: userId, title: clean(title), content: clean(content), subject: clean(subject || 'General'), tags: clean(tags), link: clean(link), is_pinned: Number(!!isPinned),
} });
const updateWorkspaceNote = (userId, itemId, { title, content, subject, tags, link, isPinned }) => updateOwned('workspace_notes', userId, itemId, {
  title: trimIfDefined(title), content: trimIfDefined(content), subject: trimIfDefined(subject), tags: trimIfDefined(tags), link: trimIfDefined(link), is_pinned: isPinned === undefined ? undefined : Number(!!isPinned),
});
const createWorkspaceAssignment = (userId, { title, description, dueDate, priority, status, link }) => p().workspace_assignments.create({ data: {
  id: id('asg-'), user_id: userId, title: clean(title), description: clean(description), due_date: dueDate || null, priority: priority || 'medium', status: status || 'pending', link: clean(link),
} });
const updateWorkspaceAssignment = (userId, itemId, { title, description, dueDate, priority, status, link }) => updateOwned('workspace_assignments', userId, itemId, {
  title: trimIfDefined(title), description: trimIfDefined(description), due_date: dueDate, priority, status, link: trimIfDefined(link),
});
const saveWorkspaceSnippet = (userId, { name, language, code, input }) => p().workspace_snippets.create({ data: {
  id: id('snp-'), user_id: userId, name: clean(name), language: language || 'javascript', code, input: input || '',
} });
const removeOwned = async (model, userId, itemId) => (await p()[model].deleteMany({ where: { id: itemId, user_id: userId } })).count > 0;
const deleteWorkspaceTask = (userId, itemId) => removeOwned('workspace_tasks', userId, itemId);
const deleteWorkspaceNote = (userId, itemId) => removeOwned('workspace_notes', userId, itemId);
const deleteWorkspaceAssignment = (userId, itemId) => removeOwned('workspace_assignments', userId, itemId);
const deleteWorkspaceSnippet = (userId, itemId) => removeOwned('workspace_snippets', userId, itemId);
const deleteWorkspaceBookmark = (userId, itemId) => removeOwned('workspace_bookmarks', userId, itemId);
const addWorkspaceBookmark = (userId, { itemId, itemType, title, url, category }) => p().workspace_bookmarks.upsert({
  where: { user_id_url: { user_id: userId, url: clean(url) } },
  create: { id: id('bmk-'), user_id: userId, item_id: itemId || null, item_type: itemType || 'resource', title: clean(title), url: clean(url), category: category || 'general' },
  update: { title: clean(title) },
});

const event = 'orca-coders-orcathon-2026';
const findParticipantByEmail = (value, eventSlug = event) => value ? p().event_participants.findFirst({ where: { candidate_email: { equals: email(value), mode: 'insensitive' }, event_slug: eventSlug } }) : null;
const findParticipantByEmailAndName = (value, name, eventSlug = event) => findParticipantByEmail(value, eventSlug);
function certificateView(row) {
  if (!row) return null;
  const { relation_participant_id: participant, ...certificate } = row;
  return { ...certificate, candidate_mobile: participant?.candidate_mobile || null, candidate_location: participant?.candidate_location || null, team_name: participant?.team_name || null, team_id: participant?.team_id || null };
}
const certificateInclude = { relation_participant_id: { select: { candidate_mobile: true, candidate_location: true, team_name: true, team_id: true } } };
async function getIssuedCertificateById(credentialId) {
  if (!credentialId) return null;
  const value = credentialId.trim().toUpperCase();
  let row = await p().issued_certificates.findUnique({ where: { credential_id: value }, include: certificateInclude });
  return certificateView(row);
}
async function getIssuedCertificateByEmail(value, eventSlug = event) {
  if (!value) return null;
  return certificateView(await p().issued_certificates.findFirst({ where: { recipient_email: { equals: email(value), mode: 'insensitive' }, event_slug: eventSlug }, include: certificateInclude }));
}
function generateUniqueCredentialId(participantId, address) {
  const number = String(participantId || '1').padStart(4, '0');
  let hash = 0;
  for (const character of `${email(address)}-${number}`) { hash = ((hash << 5) - hash) + character.charCodeAt(0); hash |= 0; }
  return `DH-ORCA-2026-${number}-${Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(-4)}`.toUpperCase();
}
async function issueCertificate({ participantId, recipientName, recipientEmail, recipientOrganisation, eventSlug = event, certificateType = 'Participation', issueDate = 'October 25, 2026', status = 'Valid' }) {
  const address = email(recipientEmail);
  const existing = await getIssuedCertificateByEmail(address, eventSlug);
  if (existing) return existing;
  await p().issued_certificates.createMany({ data: [{
    credential_id: generateUniqueCredentialId(participantId, address), event_slug: eventSlug,
    participant_id: participantId == null ? null : String(participantId), recipient_name: clean(recipientName),
    recipient_email: address, recipient_organisation: clean(recipientOrganisation), certificate_type: certificateType, issue_date: issueDate, status,
  }], skipDuplicates: true });
  return getIssuedCertificateByEmail(address, eventSlug);
}
const insertParticipant = candidate => p().event_participants.create({ data: {
  id: id(), event_slug: candidate.eventSlug || event, team_id: candidate.teamId || '', team_name: candidate.teamName || '',
  candidate_role: candidate.candidateRole || 'Participant', candidate_name: candidate.candidateName, candidate_email: email(candidate.candidateEmail),
  candidate_mobile: candidate.candidateMobile || '', candidate_location: candidate.candidateLocation || '', candidate_organisation: candidate.candidateOrganisation || '',
  is_eligible: candidate.isEligible === undefined ? 1 : Number(!!candidate.isEligible),
} });
const countParticipants = (eventSlug = event) => p().event_participants.count({ where: { event_slug: eventSlug } });
const countIssuedCertificates = (eventSlug = event) => p().issued_certificates.count({ where: { event_slug: eventSlug } });

module.exports = {
  provider: 'postgresql',
  ready: () => getPrisma().$queryRaw`SELECT 1`,
  close: () => getPrisma().$disconnect(),
  calculateLevel, getUserById, getUserByEmail, getUserByUsername, createUser, updateUserProfile, updateStreak,
  createSession, getSession, deleteSession, awardXp, getUserTotalXp, getXpHistory, getLeaderboard,
  getCourses, getCourseById, getCourseLessons, getLessonById, getLessonProgress, saveLessonProgress,
  getChallenges, getChallengeById, recordSubmission, getUserSubmissions,
  getProjects, getProjectById, createProject, updateProject, deleteProject, incrementProjectVotes,
  toggleProjectVote, toggleProjectBookmark, getUserInteractions,
  getAchievements, checkAndUnlockAchievements, getUserAchievements, getUserSettings, saveUserSettings,
  getUserSummaryCounts, getUserPublicProjects,
  getWorkspaceData, createWorkspaceTask, updateWorkspaceTask, deleteWorkspaceTask,
  createWorkspaceNote, updateWorkspaceNote, deleteWorkspaceNote,
  createWorkspaceAssignment, updateWorkspaceAssignment, deleteWorkspaceAssignment,
  saveWorkspaceSnippet, deleteWorkspaceSnippet, addWorkspaceBookmark, deleteWorkspaceBookmark,
  findParticipantByEmail, findParticipantByEmailAndName, getIssuedCertificateById, getIssuedCertificateByEmail,
  issueCertificate, insertParticipant, countParticipants, countIssuedCertificates,
};
