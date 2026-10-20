/**
 * Dev Harbour — Full-Stack Interactive Frontend Controller
 * Connects all existing views, modals, and workspaces to the live backend.
 */

const API_BASE = '/api';

// Authentication & Session State
const Auth = {
  token: localStorage.getItem('dh_token') || null,
  user: null,

  async init() {
    if (this.token) {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          this.user = data.user;
          this.renderUser();
        } else {
          this.logout();
        }
      } catch (e) {
        console.warn('Auth verification failed:', e);
      }
    }
    this.renderUser();
  },

  async login(login, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('dh_token', data.token);
    this.renderUser();
    return data;
  },

  async signup(email, username, fullName, password) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, fullName, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('dh_token', data.token);
    this.renderUser();
    return data;
  },

  logout() {
    if (this.token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      }).catch(() => {});
    }
    this.token = null;
    this.user = null;
    localStorage.removeItem('dh_token');
    this.renderUser();
    toast('Signed out successfully');
  },

  renderUser() {
    const actContainer = document.querySelector('.top .act');
    if (!actContainer) return;

    if (this.user) {
      const initials = (this.user.fullName || this.user.username || 'D').slice(0, 2).toUpperCase();
      actContainer.innerHTML = `
        <div class="user-pill">
          <span class="lvl-badge">LVL ${this.user.level || 1}</span>
          <span class="xp-text">${(this.user.totalXp || 0).toLocaleString()} XP</span>
          <span>${this.user.username}</span>
        </div>
        <button class="btn-logout" id="btn-logout-trigger">Sign out</button>
        <button class="ci se" id="sb" aria-label="Search">
          <svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <div class="av" style="display:grid;place-items:center;font-weight:800;font-size:14px;color:#fff">${initials}</div>
      `;
      const logoutBtn = document.getElementById('btn-logout-trigger');
      if (logoutBtn) logoutBtn.onclick = () => Auth.logout();
    } else {
      actContainer.innerHTML = `
        <button class="btn-auth" id="btn-open-signup">+ Sign up</button>
        <button class="pill" id="btn-open-login" style="padding:10px 18px;font-weight:700">Log in</button>
        <button class="ci se" id="sb" aria-label="Search">
          <svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <div class="av"></div>
      `;
      const signupBtn = document.getElementById('btn-open-signup');
      const loginBtn = document.getElementById('btn-open-login');
      if (signupBtn) signupBtn.onclick = () => Modal.open('signup');
      if (loginBtn) loginBtn.onclick = () => Modal.open('login');
    }

    // Reattach search modal trigger
    const sb = document.getElementById('sb');
    if (sb) {
      sb.onclick = () => {
        const sr = document.getElementById('sr');
        if (sr) {
          sr.classList.add('open');
          const si = document.getElementById('si');
          if (si) si.focus();
        }
      };
    }
  }
};

// Modal System (Auth & Project Submission)
const Modal = {
  open(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    this.switchTab(tab);
    modal.classList.add('open');
  },
  close() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('open');
    const prjModal = document.getElementById('project-modal');
    if (prjModal) prjModal.classList.remove('open');
  },
  switchTab(tab) {
    const loginForm = document.getElementById('form-login');
    const signupForm = document.getElementById('form-signup');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const errBox = document.getElementById('auth-err');
    if (errBox) errBox.classList.remove('show');

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'grid';
      if (signupForm) signupForm.style.display = 'none';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabSignup) tabSignup.classList.remove('active');
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (signupForm) signupForm.style.display = 'grid';
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabSignup) tabSignup.classList.add('active');
    }
  },
  openProjectModal() {
    if (!Auth.user) {
      toast('Please sign in to submit a project');
      this.open('login');
      return;
    }
    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.add('open');
  }
};

// Courses & Reading Mode Manager
const Courses = {
  list: [],

  async fetchAll() {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      const data = await res.json();
      this.list = data.courses || [];
      this.render();
    } catch (e) {
      console.error('Failed to fetch courses:', e);
    }
  },

  render() {
    const grid = document.getElementById('pg');
    if (!grid) return;

    grid.innerHTML = this.list.map(c => `
      <article class="course-card s6">
        <div>
          <div class="course-badge-row">
            <span class="course-provider-tag">${c.provider}</span>
            <span class="tag">★ ${c.rating} · ${c.level}</span>
          </div>
          <h3 style="font-size:20px;font-weight:800;letter-spacing:-.02em;margin-bottom:8px">${c.title}</h3>
          <p class="mut" style="font-size:14px;line-height:1.6">${c.description}</p>
        </div>
        <div>
          <div class="mt mut" style="display:flex;justify-content:space-between;margin-top:16px;padding-top:10px;border-top:1px solid var(--line);font-size:12.5px;font-weight:600">
            <span>⏱ ~${c.duration_hours} hours</span>
            <span>Category: ${c.category}</span>
          </div>
          <div class="course-actions">
            <a href="${c.external_url}" target="_blank" rel="noopener noreferrer" class="btn-watch-course">
              Watch Course ↗
            </a>
            <button class="btn-read-course" onclick="Reader.openForCourse('${c.id}')">
              📖 Read Notes
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }
};

// Internal Reading Mode Controller
const Reader = {
  currentCourseId: null,
  currentLessonId: null,
  readTimer: null,
  secondsRead: 0,

  async openForCourse(courseId) {
    this.currentCourseId = courseId;
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}`);
      const data = await res.json();
      if (!data.lessons || data.lessons.length === 0) {
        toast('Reading lessons for this track are being compiled.');
        return;
      }
      this.renderSidebar(data.course, data.lessons);
      this.loadLesson(data.lessons[0].id);
      const modal = document.getElementById('reader-modal');
      if (modal) modal.classList.add('active');
    } catch (e) {
      toast('Failed to load course reader: ' + e.message);
    }
  },

  renderSidebar(course, lessons) {
    const sb = document.getElementById('reader-lessons-list');
    const courseTitle = document.getElementById('reader-course-title');
    if (courseTitle) courseTitle.textContent = course.title;

    if (sb) {
      sb.innerHTML = lessons.map((l, i) => `
        <li class="reader-nav-item ${i === 0 ? 'active' : ''}" data-lesson-id="${l.id}" onclick="Reader.loadLesson('${l.id}')">
          <small style="opacity:.7;display:block">Lesson ${l.order_index}</small>
          ${l.title}
        </li>
      `).join('');
    }
  },

  async loadLesson(lessonId) {
    this.currentLessonId = lessonId;
    this.secondsRead = 0;
    clearInterval(this.readTimer);

    // Track reading time
    this.readTimer = setInterval(() => {
      this.secondsRead += 5;
      if (Auth.token && this.secondsRead % 30 === 0) {
        fetch(`${API_BASE}/courses/lesson/${lessonId}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Auth.token}`
          },
          body: JSON.stringify({ readingSeconds: 30 })
        }).catch(() => {});
      }
    }, 5000);

    try {
      const headers = Auth.token ? { 'Authorization': `Bearer ${Auth.token}` } : {};
      const res = await fetch(`${API_BASE}/courses/lesson/${lessonId}`, { headers });
      const data = await res.json();

      const titleEl = document.getElementById('reader-lesson-title');
      const timeEl = document.getElementById('reader-lesson-time');
      const articleEl = document.getElementById('reader-article-content');
      const completeBtn = document.getElementById('btn-complete-lesson');

      if (titleEl) titleEl.textContent = data.lesson.title;
      if (timeEl) timeEl.textContent = `${data.lesson.reading_time_mins} min estimated read`;

      // Simple Markdown Parser for Rich Notes
      if (articleEl) {
        articleEl.innerHTML = this.renderMarkdown(data.lesson.content);
      }

      if (completeBtn) {
        const isCompleted = data.progress && data.progress.status === 'completed';
        completeBtn.textContent = isCompleted ? '✓ Completed (+10 XP)' : 'Mark as Completed (+10 XP)';
        completeBtn.style.background = isCompleted ? '#27ae60' : 'var(--blk)';
        completeBtn.onclick = () => this.markCompleted(lessonId);
      }

      // Highlight active in sidebar
      document.querySelectorAll('.reader-nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.lessonId === lessonId);
      });
    } catch (e) {
      toast('Failed to load lesson content');
    }
  },

  async markCompleted(lessonId) {
    if (!Auth.user) {
      toast('Please sign in to save learning progress & earn XP');
      Modal.open('login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/courses/lesson/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Auth.token}`
        }
      });
      const data = await res.json();
      toast(data.message || 'Progress saved');
      if (data.xp && data.xp.awarded) {
        Auth.user.totalXp = data.xp.currentXp;
        Auth.user.level = data.xp.level;
        Auth.renderUser();
        Leaderboard.fetch();
      }
      this.loadLesson(lessonId);
    } catch (e) {
      toast('Failed to save completion');
    }
  },

  close() {
    clearInterval(this.readTimer);
    const modal = document.getElementById('reader-modal');
    if (modal) modal.classList.remove('active');
  },

  renderMarkdown(md) {
    if (!md) return '';
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/```javascript([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/```c([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^\s*\n\*/gm, '<ul>\n*')
      .replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2')
      .replace(/^\*(.+)/gm, '<li>$1</li>')
      .replace(/\n\n/g, '<p></p>');
  }
};

// Coding Challenges & Workspace Integration
const Challenges = {
  list: [],
  currentId: null,

  async fetchAll() {
    try {
      const res = await fetch(`${API_BASE}/challenges`);
      const data = await res.json();
      this.list = data.challenges || [];
      this.render();
    } catch (e) {
      console.error('Failed to fetch challenges:', e);
    }
  },

  render() {
    const cl = document.getElementById('cl');
    if (!cl) return;
    cl.innerHTML = this.list.map((c, i) => `
      <div class="row">
        <b class="mut">0${i + 1}</b>
        <div><h4>${c.title}</h4></div>
        <small class="tp">${c.category}</small>
        <span class="${c.difficulty}">${c.difficulty}</span>
        <button class="sv" onclick="Challenges.loadToWorkspace('${c.id}')">Solve →</button>
      </div>
    `).join('');
  },

  async loadToWorkspace(id) {
    try {
      const res = await fetch(`${API_BASE}/challenges/${id}`);
      const data = await res.json();
      const ch = data.challenge;
      this.currentId = ch.id;

      const codeArea = document.getElementById('code');
      const inpArea = document.getElementById('inp');
      const titleEl = document.getElementById('wt');
      const outArea = document.getElementById('out');
      const resBox = document.getElementById('res');

      if (titleEl) titleEl.textContent = `${ch.title} (+${ch.xpReward} XP)`;
      if (codeArea) codeArea.value = ch.starterCodeJs;
      if (inpArea) {
        inpArea.value = ch.examples && ch.examples.length ? ch.examples[0].input : '';
      }
      if (outArea) {
        outArea.textContent = 'Press "▶ Run Code" to test and submit your solution against the verification suite.';
        outArea.className = '';
      }
      if (resBox) {
        resBox.className = 'rs';
        resBox.textContent = '';
      }

      if (typeof paint === 'function') paint();
      if (typeof show === 'function') show('work');
    } catch (e) {
      toast('Failed to load challenge: ' + e.message);
    }
  },

  async runCode() {
    if (!Auth.user) {
      toast('Please sign in to submit code & earn XP');
      Modal.open('login');
      return;
    }
    const codeArea = document.getElementById('code');
    const outArea = document.getElementById('out');
    const resBox = document.getElementById('res');

    if (!codeArea) return;
    const code = codeArea.value;

    if (outArea) {
      outArea.className = '';
      outArea.textContent = '⏳ Submitting and running tests in isolated sandbox…';
    }

    try {
      const res = await fetch(`${API_BASE}/challenges/${this.currentId || 'challenge-two-sum'}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Auth.token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();

      if (!res.ok) {
        if (outArea) {
          outArea.className = 'er';
          outArea.textContent = data.error || 'Execution failed';
        }
        return;
      }

      if (outArea) {
        let details = `Execution status: ${data.status.toUpperCase()} (${data.executionTimeMs}ms)\n`;
        details += `Passed: ${data.passedTests} / ${data.totalTests} tests\n\n`;

        if (data.sampleResults && data.sampleResults.length) {
          details += '--- Test Breakdown ---\n';
          data.sampleResults.forEach(t => {
            details += `Test #${t.testIndex}: ${t.passed ? '✓ PASSED' : '✕ FAILED'}\n`;
            details += `  Args: ${JSON.stringify(t.input)}\n`;
            details += `  Expected: ${JSON.stringify(t.expected)}\n`;
            details += `  Got: ${JSON.stringify(t.actual !== undefined ? t.actual : t.error)}\n\n`;
          });
        }
        if (data.logs && data.logs.length) {
          details += 'Console Output:\n' + data.logs.join('\n');
        }
        outArea.textContent = details;
      }

      if (resBox) {
        if (data.passed) {
          resBox.className = 'rs ok';
          const xpMsg = data.xp && data.xp.awarded ? ` +${data.xp.amount} XP awarded!` : '';
          resBox.textContent = `✓ All ${data.totalTests} tests passed!${xpMsg}`;
          if (data.xp && data.xp.awarded) {
            Auth.user.totalXp = data.xp.currentXp;
            Auth.user.level = data.xp.level;
            Auth.renderUser();
            Leaderboard.fetch();
          }
        } else {
          resBox.className = 'rs no';
          resBox.textContent = `✕ Failed (${data.passedTests}/${data.totalTests} tests passed)`;
        }
      }
    } catch (e) {
      if (outArea) {
        outArea.className = 'er';
        outArea.textContent = 'Submission error: ' + e.message;
      }
    }
  }
};

// Leaderboard Controller
const Leaderboard = {
  currentTab: 'All-time',

  async fetch(timeframe = 'All-time') {
    this.currentTab = timeframe;
    try {
      const headers = Auth.token ? { 'Authorization': `Bearer ${Auth.token}` } : {};
      const res = await fetch(`${API_BASE}/leaderboard?timeframe=${encodeURIComponent(timeframe)}`, { headers });
      const data = await res.json();
      this.render(data.rankings || [], data.currentUserRank);
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    }
  },

  render(ranks, currentUserRank) {
    const pod = document.getElementById('lpod');
    const rows = document.getElementById('lrows');
    const lbContainer = document.getElementById('lb');

    // Dashboard mini-leaderboard render
    if (lbContainer) {
      lbContainer.innerHTML = ranks.slice(0, 5).map((u, i) => `
        <div class="lr">
          <b>${i + 1}</b>
          <span class="a"></span>
          <span>${u.username}<br><em>${u.challengesSolved || 0} solved</em></span>
          <span>${u.xp.toLocaleString()} XP</span>
        </div>
      `).join('');
    }

    // Full leaderboard view render
    if (pod && ranks.length >= 3) {
      const top3 = [ranks[1], ranks[0], ranks[2]];
      const rk = [2, 1, 3];
      pod.innerHTML = top3.map((u, i) => `
        <div class="pd p${rk[i]}">
          <small>0${rk[i]}</small>
          <b>${u ? u.username : '-'}</b>
          <span>${u ? u.xp.toLocaleString() : 0} XP</span>
          <em>${u ? u.challengesSolved : 0} solved</em>
        </div>
      `).join('');
    }

    if (rows) {
      const listRows = ranks.slice(3).map(u => `
        <div class="lrw ${Auth.user && Auth.user.id === u.userId ? 'my-rank' : ''}">
          <b>0${u.rank}</b>
          <span>${u.username}</span>
          <span>${u.challengesSolved}</span>
          <span>${u.xp.toLocaleString()}</span>
        </div>
      `).join('');

      rows.innerHTML = `
        <div class="lrw h"><span>Rank</span><span>Developer</span><span>Challenges</span><span>XP</span></div>
        ${listRows || '<p class="mut" style="padding:14px">No rankings yet in this timeframe.</p>'}
      `;
    }
  }
};

// Community Featured Projects Controller
const Projects = {
  list: [],

  async fetchAll() {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      this.list = data.projects || [];
      this.render();
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  },

  render() {
    const pj = document.getElementById('pj');
    const lp = document.getElementById('lp');

    const html = this.list.map(p => {
      const isOwner = Auth.user && Auth.user.id === p.owner.id;
      const isVoted = Auth.user && Auth.user.interactions && Auth.user.interactions.votes.includes(p.id);
      const isBookmarked = Auth.user && Auth.user.interactions && Auth.user.interactions.bookmarks.includes(p.id);

      return `
        <article class="c pc s4">
          <div class="cv"></div>
          <div class="b">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <h3>${p.title}</h3>
              ${isOwner ? `<button onclick="Projects.delete('${p.id}')" style="color:#dc3545;font-size:12px;font-weight:700">Delete</button>` : ''}
            </div>
            <p style="font-size:13.5px;margin:6px 0 10px">${p.description}</p>
            <div class="zt">
              ${(p.techStack || []).map(t => `<span>${t}</span>`).join('')}
              <span class="tag">${p.category}</span>
            </div>
            <div class="project-action-bar">
              <button class="btn-vote ${isVoted ? 'active' : ''}" onclick="Projects.vote('${p.id}')">
                ▲ Upvote (${p.votesCount || 0})
              </button>
              <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" onclick="Projects.bookmark('${p.id}')">
                ★ Bookmark
              </button>
              <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" style="margin-left:auto;font-size:12.5px;font-weight:700;color:var(--ink)">
                GitHub ↗
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (pj) pj.innerHTML = html;
    if (lp) lp.innerHTML = this.list.slice(0, 3).map(j => `
      <div class="pk">
        <div class="st"><s></s>${j.category} · Verified</div>
        <h3>${j.title}</h3>
        <p>${j.description}</p>
      </div>
    `).join('');
  },

  async vote(id) {
    if (!Auth.user) {
      toast('Please sign in to vote');
      Modal.open('login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/vote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${Auth.token}` }
      });
      const data = await res.json();
      toast(data.message);
      await Auth.init();
      this.fetchAll();
    } catch (e) {
      toast('Vote failed: ' + e.message);
    }
  },

  async bookmark(id) {
    if (!Auth.user) {
      toast('Please sign in to bookmark');
      Modal.open('login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${Auth.token}` }
      });
      const data = await res.json();
      toast(data.message);
      await Auth.init();
      this.fetchAll();
    } catch (e) {
      toast('Bookmark failed: ' + e.message);
    }
  },

  async delete(id) {
    if (!confirm('Are you sure you want to remove this project?')) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${Auth.token}` }
      });
      const data = await res.json();
      toast(data.message || 'Project deleted');
      this.fetchAll();
    } catch (e) {
      toast('Delete failed: ' + e.message);
    }
  }
};

// Initialize Application on Page Load
document.addEventListener('DOMContentLoaded', async () => {
  await Auth.init();
  Courses.fetchAll();
  Challenges.fetchAll();
  Projects.fetchAll();
  Leaderboard.fetch('All-time');

  // Wire Run Button to backend execution
  const runBtn = document.getElementById('run');
  if (runBtn) {
    runBtn.onclick = () => Challenges.runCode();
  }

  // Hook Project Submission Form
  const prjForm = document.getElementById('form-submit-project');
  if (prjForm) {
    prjForm.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById('prj-title').value;
      const category = document.getElementById('prj-category').value;
      const description = document.getElementById('prj-desc').value;
      const techStack = document.getElementById('prj-tech').value;
      const repoUrl = document.getElementById('prj-repo').value;
      const demoUrl = document.getElementById('prj-demo').value;

      try {
        const res = await fetch(`${API_BASE}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Auth.token}`
          },
          body: JSON.stringify({ title, category, description, techStack, repoUrl, demoUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submission failed');
        toast('Project published to community showcase! +50 XP awarded.');
        Modal.close();
        prjForm.reset();
        Projects.fetchAll();
        await Auth.init();
      } catch (err) {
        alert(err.message);
      }
    };
  }

  // Hook Auth Forms
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const loginVal = document.getElementById('login-id').value;
      const passVal = document.getElementById('login-pass').value;
      const errBox = document.getElementById('auth-err');
      try {
        await Auth.login(loginVal, passVal);
        Modal.close();
        toast('Signed in successfully!');
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message;
          errBox.classList.add('show');
        }
      }
    };
  }

  const signupForm = document.getElementById('form-signup');
  if (signupForm) {
    signupForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('reg-email').value;
      const username = document.getElementById('reg-username').value;
      const fullName = document.getElementById('reg-fullname').value;
      const password = document.getElementById('reg-password').value;
      const errBox = document.getElementById('auth-err');
      try {
        await Auth.signup(email, username, fullName, password);
        Modal.close();
        toast('Welcome to Dev Harbour!');
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message;
          errBox.classList.add('show');
        }
      }
    };
  }
});
