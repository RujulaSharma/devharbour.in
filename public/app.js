/**
 * Dev Harbour — Seamless Full-Stack Data Controller
 * Non-invasively attaches to the existing UI to provide persistent authentication,
 * server-side challenge execution & XP ledger credits, real course reading & catalog links,
 * genuine database leaderboard records, project submissions, and custom tasks.
 */
(function() {
  'use strict';

  const API_BASE = '/api';
  let currentUser = null;
  let token = localStorage.getItem('dh_token') || null;

  function showToast(msg) {
    if (typeof window.toast === 'function') {
      window.toast(msg);
    } else {
      const t = document.getElementById('toast');
      if (t) {
        t.textContent = msg;
        t.classList.add('on');
        setTimeout(() => t.classList.remove('on'), 2500);
      }
    }
  }

  // Inject Modal Styles (using native CSS variables so it adapts to Light, Dark, Mercury)
  const style = document.createElement('style');
  style.id = 'dh-fs-styles';
  style.textContent = `
    .dh-modal-wrap { position:fixed; inset:0; background:rgba(15,12,28,.65); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); display:grid; place-items:center; z-index:99999; padding:16px; opacity:0; pointer-events:none; transition:opacity .25s ease; }
    .dh-modal-wrap.open { opacity:1; pointer-events:auto; }
    .dh-box { background:var(--card); color:var(--ink); border-radius:var(--r); padding:28px 24px; max-width:480px; width:100%; box-shadow:0 24px 60px -20px rgba(0,0,0,.5); border:1px solid var(--line); position:relative; max-height:88vh; overflow-y:auto; font-family:var(--font); transform:translateY(12px); transition:transform .25s ease; }
    .dh-modal-wrap.open .dh-box { transform:translateY(0); }
    .dh-box h3 { font-size:22px; font-weight:800; letter-spacing:-.02em; margin-bottom:6px; }
    .dh-box p.desc { color:var(--mut); font-size:13px; margin-bottom:18px; line-height:1.4; }
    .dh-x { position:absolute; top:18px; right:18px; width:30px; height:30px; border-radius:50%; background:var(--soft); color:var(--ink); display:grid; place-items:center; font-size:18px; cursor:pointer; border:none; line-height:1; }
    .dh-x:hover { background:var(--line); }
    .dh-tabs { display:flex; gap:6px; background:var(--soft); padding:4px; border-radius:12px; margin-bottom:18px; }
    .dh-tabs button { flex:1; padding:8px 12px; border-radius:9px; font-size:13px; font-weight:700; color:var(--mut); background:transparent; border:none; cursor:pointer; transition:all .2s; }
    .dh-tabs button.on { background:var(--blk); color:#fff; }
    .dh-row { margin-bottom:12px; display:flex; flex-direction:column; gap:5px; text-align:left; }
    .dh-row label { font-size:11px; font-weight:700; color:var(--mut); text-transform:uppercase; letter-spacing:.05em; }
    .dh-row input, .dh-row textarea, .dh-row select { width:100%; padding:10px 14px; border-radius:12px; border:1px solid var(--line); background:var(--bg); color:var(--ink); font-family:inherit; font-size:13.5px; outline:none; box-sizing:border-box; }
    .dh-row input:focus, .dh-row textarea:focus, .dh-row select:focus { border-color:var(--blk); }
    .dh-btn { width:100%; padding:12px; border-radius:99px; background:var(--blk); color:#fff; font-weight:800; font-size:13.5px; border:none; cursor:pointer; margin-top:8px; transition:transform .2s; }
    .dh-btn:hover { transform:translateY(-1px); }
    .dh-msg-err { color:#e5484d; font-size:12px; font-weight:600; margin-bottom:10px; display:none; }
    .dh-read-content { font-size:14px; line-height:1.65; color:var(--ink); margin:16px 0; background:var(--bg); padding:16px; border-radius:14px; max-height:280px; overflow-y:auto; border:1px solid var(--line); }
    .dh-read-content pre { background:var(--blk); color:#fff; padding:12px; border-radius:8px; overflow-x:auto; font-size:12.5px; margin:10px 0; font-family:monospace; }
    .dh-course-link { display:inline-flex; align-items:center; gap:8px; background:var(--soft); color:var(--ink); padding:8px 14px; border-radius:99px; font-size:12.5px; font-weight:700; text-decoration:none; margin-top:8px; }
    .dh-course-link:hover { background:var(--line); }
  `;
  document.head.appendChild(style);

  // Modal Container
  const modalWrap = document.createElement('div');
  modalWrap.className = 'dh-modal-wrap';
  modalWrap.id = 'dh-modal';
  modalWrap.innerHTML = `
    <div class="dh-box" id="dh-box">
      <button class="dh-x" id="dh-x" aria-label="Close">&times;</button>
      <div id="dh-content"></div>
    </div>
  `;
  document.body.appendChild(modalWrap);

  const modalContent = modalWrap.querySelector('#dh-content');
  const closeBtn = modalWrap.querySelector('#dh-x');

  function closeModal() {
    modalWrap.classList.remove('open');
  }
  closeBtn.onclick = closeModal;
  modalWrap.onclick = e => { if (e.target === modalWrap) closeModal(); };

  // Render Auth UI
  function showAuthModal(defaultTab) {
    defaultTab = defaultTab || 'login';
    modalContent.innerHTML = `
      <h3>Welcome to Dev Harbour</h3>
      <p class="desc">Sign in or create a student account to track learning paths, submit challenges, earn XP, and join the leaderboard.</p>
      <div class="dh-tabs">
        <button id="t-login" class="${defaultTab === 'login' ? 'on' : ''}">Sign In</button>
        <button id="t-signup" class="${defaultTab === 'signup' ? 'on' : ''}">Create Account</button>
      </div>
      <div class="dh-msg-err" id="dh-auth-err"></div>

      <form id="f-login" style="${defaultTab === 'login' ? '' : 'display:none'}">
        <div class="dh-row">
          <label>Email or Username</label>
          <input type="text" id="l-user" placeholder="alexandra or student@devharbour.in" required autocomplete="username">
        </div>
        <div class="dh-row">
          <label>Password</label>
          <input type="password" id="l-pass" placeholder="Your password" required autocomplete="current-password">
        </div>
        <button type="submit" class="dh-btn">Sign In</button>
      </form>

      <form id="f-signup" style="${defaultTab === 'signup' ? '' : 'display:none'}">
        <div class="dh-row">
          <label>Full Name</label>
          <input type="text" id="s-name" placeholder="Alexandra Vance" required autocomplete="name">
        </div>
        <div class="dh-row">
          <label>Username</label>
          <input type="text" id="s-user" placeholder="alexandra" required autocomplete="username">
        </div>
        <div class="dh-row">
          <label>Email Address</label>
          <input type="email" id="s-email" placeholder="alexandra@example.com" required autocomplete="email">
        </div>
        <div class="dh-row">
          <label>Password (min. 8 characters)</label>
          <input type="password" id="s-pass" minlength="8" placeholder="Create a strong password" required autocomplete="new-password">
        </div>
        <button type="submit" class="dh-btn">Create Free Account</button>
      </form>
    `;

    const errBox = modalContent.querySelector('#dh-auth-err');
    const tabLogin = modalContent.querySelector('#t-login');
    const tabSignup = modalContent.querySelector('#t-signup');
    const formLogin = modalContent.querySelector('#f-login');
    const formSignup = modalContent.querySelector('#f-signup');

    tabLogin.onclick = () => {
      tabLogin.classList.add('on');
      tabSignup.classList.remove('on');
      formLogin.style.display = '';
      formSignup.style.display = 'none';
      errBox.style.display = 'none';
    };
    tabSignup.onclick = () => {
      tabSignup.classList.add('on');
      tabLogin.classList.remove('on');
      formSignup.style.display = '';
      formLogin.style.display = 'none';
      errBox.style.display = 'none';
    };

    formLogin.onsubmit = async e => {
      e.preventDefault();
      errBox.style.display = 'none';
      const login = modalContent.querySelector('#l-user').value.trim();
      const password = modalContent.querySelector('#l-pass').value;
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        token = data.token;
        localStorage.setItem('dh_token', token);
        currentUser = data.user;
        updateUserUI();
        syncLeaderboard();
        closeModal();
        showToast(`Welcome back, ${currentUser.username}!`);
      } catch (err) {
        errBox.textContent = err.message;
        errBox.style.display = 'block';
      }
    };

    formSignup.onsubmit = async e => {
      e.preventDefault();
      errBox.style.display = 'none';
      const fullName = modalContent.querySelector('#s-name').value.trim();
      const username = modalContent.querySelector('#s-user').value.trim();
      const email = modalContent.querySelector('#s-email').value.trim();
      const password = modalContent.querySelector('#s-pass').value;
      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        token = data.token;
        localStorage.setItem('dh_token', token);
        currentUser = data.user;
        updateUserUI();
        syncLeaderboard();
        closeModal();
        showToast(`Account created! Welcome, ${currentUser.username}!`);
      } catch (err) {
        errBox.textContent = err.message;
        errBox.style.display = 'block';
      }
    };

    modalWrap.classList.add('open');
  }

  // Update User Header UI (Preserves exact markup, only reflects authenticated user)
  function updateUserUI() {
    const heading = document.querySelector('.top h1');
    const subtitle = document.querySelector('.top p');
    const crBtn = document.querySelector('.top .act .cr');
    const av = document.querySelector('.top .act .av');

    if (currentUser) {
      if (heading) heading.textContent = `Hi, ${currentUser.fullName || currentUser.username}!`;
      if (subtitle) subtitle.textContent = `${(currentUser.totalXp || 0).toLocaleString()} XP · Level ${currentUser.level || 1} · ${currentUser.streakDays || 0} day streak`;
      if (crBtn) {
        crBtn.textContent = `${currentUser.username} (Logout)`;
        crBtn.removeAttribute('data-t');
        crBtn.onclick = logoutUser;
      }
      if (av) {
        const initials = (currentUser.fullName || currentUser.username || 'DH').slice(0, 2).toUpperCase();
        av.textContent = initials;
        av.style.display = 'grid';
        av.style.placeItems = 'center';
        av.style.color = '#fff';
        av.style.fontWeight = '800';
        av.style.fontSize = '14px';
      }
    } else {
      if (heading) heading.textContent = 'Hi, Alexandra!';
      if (subtitle) subtitle.textContent = "Let's make today productive and learn something new.";
      if (crBtn) {
        crBtn.textContent = '+ Sign up';
        crBtn.removeAttribute('data-t');
        crBtn.onclick = () => showAuthModal('signup');
      }
      if (av) {
        av.textContent = '';
      }
    }
  }

  async function logoutUser() {
    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    token = null;
    currentUser = null;
    localStorage.removeItem('dh_token');
    updateUserUI();
    showToast('Signed out successfully');
  }

  // Initial Auth Check
  async function initAuth() {
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          currentUser = data.user;
          updateUserUI();
        } else {
          token = null;
          localStorage.removeItem('dh_token');
          updateUserUI();
        }
      } catch (e) {
        updateUserUI();
      }
    } else {
      const crBtn = document.querySelector('.top .act .cr');
      if (crBtn) {
        crBtn.onclick = e => {
          e.preventDefault();
          e.stopPropagation();
          showAuthModal('signup');
        };
      }
    }
  }

  // Sync Leaderboard with Database
  async function syncLeaderboard() {
    try {
      const [resAll, resWeekly] = await Promise.all([
        fetch(`${API_BASE}/leaderboard?period=all`),
        fetch(`${API_BASE}/leaderboard?period=weekly`)
      ]);
      if (resAll.ok && resWeekly.ok) {
        const dataAll = await resAll.json();
        const dataWeekly = await resWeekly.json();
        if (window.L && dataAll.leaderboard && dataWeekly.leaderboard) {
          window.L['All-time'] = dataAll.leaderboard.map(u => [u.username, u.challengesSolved || 0, u.totalXp || 0]);
          window.L.Weekly = dataWeekly.leaderboard.map(u => [u.username, u.challengesSolved || 0, u.totalXp || 0]);
          if (typeof window.rl === 'function') window.rl('Weekly');
          const zlb = document.getElementById('zlb');
          if (zlb && window.L['All-time']) {
            zlb.innerHTML = window.L['All-time'].map((u, i) =>
              `<div class="zlb"><b>${i+1}</b><span>${u[0]}</span><span>${u[1]}</span><span>${u[2].toLocaleString()} XP</span></div>`
            ).join('');
          }
        }
      }
    } catch (e) {}
  }

  // Challenge Submission & Automatic XP Hook
  function hookChallengeRunner() {
    window.addEventListener('message', async e => {
      const d = e.data;
      if (!d || d.e) return;
      const cur = window.cur != null ? window.cur : 0;
      const C = window.C;
      if (!C || !C[cur]) return;

      const output = (d.L || []).join('\n').trim();
      const expected = String(C[cur][6]).trim();
      if (output === expected) {
        try {
          const codeEl = document.getElementById('code');
          const codeVal = codeEl ? codeEl.value : '';
          const challengeId = `chal-${cur + 1}`;
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`${API_BASE}/challenges/${challengeId}/submit`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ code: codeVal })
          });
          if (res.ok) {
            const result = await res.json();
            if (result.xpEarned) {
              showToast(`🎉 Challenge passed! +${result.xpEarned} XP awarded!`);
              if (currentUser) {
                currentUser.totalXp = result.totalXp;
                updateUserUI();
              }
              syncLeaderboard();
            }
          }
        } catch (err) {}
      }
    });
  }

  // Connect "+ Add task" button to real goals list
  function hookAddTask() {
    const addBtn = document.querySelector('button[data-t*="Custom tasks"]');
    if (addBtn) {
      addBtn.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        const taskName = prompt('Enter a new learning goal or task:');
        if (taskName && taskName.trim()) {
          if (Array.isArray(window.G)) {
            window.G.push(taskName.trim());
            if (typeof window.rg === 'function') window.rg();
            showToast('Goal added to your dashboard!');
          }
        }
      };
    }
  }

  // Connect Project Submissions & Details
  function hookProjects() {
    document.addEventListener('click', e => {
      const prjLink = e.target.closest('a[data-t*="Project pages need a backend"]');
      if (prjLink) {
        e.preventDefault();
        e.stopPropagation();
        showProjectModal();
      }
    });
  }

  function showProjectModal() {
    modalContent.innerHTML = `
      <h3>Submit Your Project</h3>
      <p class="desc">Share your build with the Dev Harbour student community and earn +50 XP upon verification.</p>
      <div class="dh-msg-err" id="dh-prj-err"></div>
      <form id="f-project">
        <div class="dh-row">
          <label>Project Title</label>
          <input type="text" id="p-title" placeholder="e.g. Orbit Notes" required>
        </div>
        <div class="dh-row">
          <label>Category</label>
          <select id="p-cat">
            <option value="Web">Web Development</option>
            <option value="Mobile">Mobile App</option>
            <option value="Security">Cybersecurity</option>
            <option value="AI">Artificial Intelligence</option>
            <option value="Game">Game Development</option>
          </select>
        </div>
        <div class="dh-row">
          <label>Description</label>
          <textarea id="p-desc" placeholder="What does your project do?" rows="3" required></textarea>
        </div>
        <div class="dh-row">
          <label>Tech Stack (comma separated)</label>
          <input type="text" id="p-tech" placeholder="React, Node.js, PostgreSQL">
        </div>
        <div class="dh-row">
          <label>GitHub Repository URL</label>
          <input type="url" id="p-repo" placeholder="https://github.com/..." required>
        </div>
        <div class="dh-row">
          <label>Live Demo URL (optional)</label>
          <input type="url" id="p-demo" placeholder="https://...">
        </div>
        <button type="submit" class="dh-btn">Publish Project (+50 XP)</button>
      </form>
    `;

    const prjErr = modalContent.querySelector('#dh-prj-err');
    const formPrj = modalContent.querySelector('#f-project');

    formPrj.onsubmit = async e => {
      e.preventDefault();
      if (!token) {
        showToast('Please sign in first to submit a project');
        showAuthModal('login');
        return;
      }
      const title = modalContent.querySelector('#p-title').value.trim();
      const category = modalContent.querySelector('#p-cat').value;
      const description = modalContent.querySelector('#p-desc').value.trim();
      const techStack = modalContent.querySelector('#p-tech').value.split(',').map(s => s.trim()).filter(Boolean);
      const repoUrl = modalContent.querySelector('#p-repo').value.trim();
      const liveUrl = modalContent.querySelector('#p-demo').value.trim();

      try {
        const res = await fetch(`${API_BASE}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, category, description, techStack, repoUrl, liveUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submission failed');
        if (Array.isArray(window.J)) {
          window.J.unshift([title, description, category]);
          if (typeof window.rp === 'function') window.rp();
        }
        closeModal();
        showToast('🎉 Project published! +50 XP awarded!');
        if (currentUser && data.xpEarned) {
          currentUser.totalXp = (currentUser.totalXp || 0) + data.xpEarned;
          updateUserUI();
        }
        syncLeaderboard();
      } catch (err) {
        prjErr.textContent = err.message;
        prjErr.style.display = 'block';
      }
    };

    modalWrap.classList.add('open');
  }

  // Connect Course Cards to Real Reading & Official Course Catalog
  function hookCourses() {
    document.addEventListener('click', async e => {
      const card = e.target.closest('#pg .c');
      if (card) {
        const titleEl = card.querySelector('h3');
        const courseTitle = titleEl ? titleEl.textContent : '';
        openCourseDetail(courseTitle);
      }
    });
  }

  async function openCourseDetail(courseTitle) {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      if (!res.ok) return;
      const data = await res.json();
      const course = (data.courses || []).find(c => c.title.toLowerCase().includes(courseTitle.toLowerCase())) || data.courses[0];
      if (!course) return;

      const detailRes = await fetch(`${API_BASE}/courses/${course.id}`);
      const detailData = detailRes.ok ? await detailRes.json() : { lessons: [] };
      const lessons = detailData.lessons || [];

      modalContent.innerHTML = `
        <span class="tag" style="background:var(--soft);color:var(--blk);font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px;">${course.provider} · ${course.level}</span>
        <h3 style="margin-top:10px">${course.title}</h3>
        <p class="desc">${course.description}</p>
        <div style="display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
          <a href="${course.officialUrl}" target="_blank" rel="noopener noreferrer" class="dh-course-link">
            Official Course Link ↗ (${course.provider})
          </a>
        </div>
        <h4 style="font-size:15px; font-weight:700; margin-bottom:10px;">Interactive Lessons & Reading:</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${lessons.map((l, i) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg); padding:10px 14px; border-radius:12px; border:1px solid var(--line);">
              <div>
                <b style="font-size:13.5px; display:block;">${l.title}</b>
                <span style="font-size:12px; color:var(--mut);">${l.readingTimeMinutes || 10} min read · +${l.xpReward || 25} XP</span>
              </div>
              <button class="dh-btn" style="width:auto; padding:6px 16px; margin:0; font-size:12px;" onclick="window.DH_ReadLesson('${course.id}', '${l.id}')">Read</button>
            </div>
          `).join('')}
        </div>
      `;
      modalWrap.classList.add('open');
    } catch (err) {}
  }

  window.DH_ReadLesson = async function(courseId, lessonId) {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}`);
      if (!res.ok) return;
      const data = await res.json();
      const l = data.lesson;

      modalContent.innerHTML = `
        <span class="tag" style="background:var(--soft);color:var(--blk);font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px;">Lesson · +${l.xpReward || 25} XP</span>
        <h3 style="margin-top:10px">${l.title}</h3>
        <div class="dh-read-content">
          ${l.contentHtml || l.content}
        </div>
        <button class="dh-btn" id="dh-finish-lesson">Complete Lesson (+${l.xpReward || 25} XP)</button>
      `;

      const finishBtn = modalContent.querySelector('#dh-finish-lesson');
      finishBtn.onclick = async () => {
        if (!token) {
          showToast('Sign in to claim lesson XP');
          showAuthModal('login');
          return;
        }
        const compRes = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/complete`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const compData = await compRes.json();
        if (compRes.ok) {
          showToast(`Lesson completed! +${compData.xpEarned || 25} XP awarded!`);
          if (currentUser) {
            currentUser.totalXp = compData.totalXp;
            updateUserUI();
          }
          syncLeaderboard();
        } else {
          showToast(compData.message || 'Lesson already completed');
        }
        closeModal();
      };
    } catch (err) {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initAuth();
    syncLeaderboard();
    hookChallengeRunner();
    hookAddTask();
    hookProjects();
    hookCourses();
  }

})();
