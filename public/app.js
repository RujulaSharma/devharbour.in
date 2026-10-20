/**
 * Dev Harbour — Seamless Full-Stack Integration Controller
 * Integrates real backend authentication, database records, code execution,
 * and persistent XP into the EXACT existing Dev Harbour UI.
 */

const API_BASE = '/api';

// Authentication & Identity State
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
        } else {
          this.token = null;
          localStorage.removeItem('dh_token');
        }
      } catch (e) {
        console.warn('Auth check failed:', e);
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
    Leaderboard.sync();
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
    Leaderboard.sync();
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
    Leaderboard.sync();
    toast('Signed out successfully');
  },

  renderUser() {
    const heading = document.querySelector('.top h1');
    const subtitle = document.querySelector('.top p');
    const crBtn = document.querySelector('.top .act .cr');
    const av = document.querySelector('.top .act .av');

    if (this.user) {
      if (heading) heading.textContent = `Hi, ${this.user.fullName || this.user.username}!`;
      if (subtitle) subtitle.textContent = `${(this.user.totalXp || 0).toLocaleString()} XP · Level ${this.user.level || 1} · ${this.user.streakDays || 0} day streak`;
      if (crBtn) {
        crBtn.textContent = `${this.user.username} (Sign out)`;
        crBtn.onclick = () => Auth.logout();
      }
      if (av) {
        const initials = (this.user.fullName || this.user.username || 'D').slice(0, 2).toUpperCase();
        av.textContent = initials;
        av.style.display = 'grid';
        av.style.placeItems = 'center';
        av.style.color = '#fff';
        av.style.fontWeight = '800';
        av.style.fontSize = '14px';
      }
    } else {
      if (heading) heading.textContent = 'Hi, Developer!';
      if (subtitle) subtitle.textContent = 'Learn. Build. Compete. Grow.';
      if (crBtn) {
        crBtn.textContent = '+ Sign up';
        crBtn.onclick = () => Modal.open('signup');
      }
      if (av) {
        av.textContent = '';
      }
    }
  }
};

// Modals Controller
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

// Workspace Live Backend Code Execution
const Workspace = {
  currentChallengeId: 'challenge-two-sum',

  async run() {
    const codeEl = document.getElementById('code');
    const outEl = document.getElementById('out');
    const resEl = document.getElementById('res');

    if (!codeEl) return;
    const code = codeEl.value;

    if (!Auth.user) {
      toast('Sign in to submit your solution and record your XP!');
      Modal.open('login');
      return;
    }

    if (outEl) {
      outEl.className = '';
      outEl.textContent = '⏳ Executing in sandboxed environment against test suite…';
    }

    try {
      const res = await fetch(`${API_BASE}/challenges/${this.currentChallengeId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Auth.token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();

      if (!res.ok) {
        if (outEl) {
          outEl.className = 'er';
          outEl.textContent = data.error || 'Execution failed';
        }
        return;
      }

      if (outEl) {
        let details = `Execution: ${data.status.toUpperCase()} (${data.executionTimeMs}ms)\n`;
        details += `Tests: ${data.passedTests} / ${data.totalTests} passed\n\n`;

        if (data.sampleResults && data.sampleResults.length) {
          data.sampleResults.forEach(t => {
            details += `Test #${t.testIndex}: ${t.passed ? '✓ PASSED' : '✕ FAILED'}\n`;
            details += `  Args: ${JSON.stringify(t.input)}\n`;
            details += `  Expected: ${JSON.stringify(t.expected)}\n`;
            details += `  Output: ${JSON.stringify(t.actual !== undefined ? t.actual : t.error)}\n\n`;
          });
        }
        if (data.logs && data.logs.length) {
          details += 'Logs:\n' + data.logs.join('\n');
        }
        outEl.textContent = details;
      }

      if (resEl) {
        if (data.passed) {
          resEl.className = 'rs ok';
          const xpMsg = data.xp && data.xp.awarded ? ` +${data.xp.amount} XP awarded!` : '';
          resEl.textContent = `✓ All ${data.totalTests} tests passed!${xpMsg}`;
          if (data.xp && data.xp.awarded) {
            Auth.user.totalXp = data.xp.currentXp;
            Auth.user.level = data.xp.level;
            Auth.renderUser();
            Leaderboard.sync();
          }
        } else {
          resEl.className = 'rs no';
          resEl.textContent = `✕ Failed: ${data.passedTests}/${data.totalTests} tests passed. Check test breakdown above.`;
        }
      }
    } catch (err) {
      if (outEl) {
        outEl.className = 'er';
        outEl.textContent = 'Submission error: ' + err.message;
      }
    }
  }
};

// Leaderboard Sync from Database
const Leaderboard = {
  async sync(timeframe = 'All-time') {
    try {
      const headers = Auth.token ? { 'Authorization': `Bearer ${Auth.token}` } : {};
      const res = await fetch(`${API_BASE}/leaderboard?timeframe=${encodeURIComponent(timeframe)}`, { headers });
      const data = await res.json();
      if (!data.rankings) return;

      const pod = document.getElementById('lpod');
      const rows = document.getElementById('lrows');
      const lb = document.getElementById('lb');

      if (lb) {
        lb.innerHTML = data.rankings.slice(0, 5).map((u, i) => `
          <div class="lr">
            <b>${i + 1}</b>
            <span class="a"></span>
            <span>${u.username}<br><em>${u.challengesSolved || 0} solved</em></span>
            <span>${u.xp.toLocaleString()} XP</span>
          </div>
        `).join('');
      }

      if (pod && data.rankings.length >= 3) {
        const top3 = [data.rankings[1], data.rankings[0], data.rankings[2]];
        const rk = [2, 1, 3];
        pod.innerHTML = top3.map((u, i) => `
          <div class="pd p${rk[i]}">
            <small>0${rk[i]}</small>
            <b>${u ? u.username : '-'}</b>
            <span>${u ? u.xp.toLocaleString() : 0} XP</span>
            <em>${u ? u.challengesSolved : 0} challenges</em>
          </div>
        `).join('');
      }

      if (rows) {
        rows.innerHTML = '<div class="lrw h"><span>Rank</span><span>Developer</span><span>Challenges</span><span>XP</span></div>' +
          data.rankings.slice(3).map(u => `
            <div class="lrw">
              <b>0${u.rank}</b>
              <span>${u.username}</span>
              <span>${u.challengesSolved}</span>
              <span>${u.xp.toLocaleString()}</span>
            </div>
          `).join('');
      }
    } catch (e) {
      console.warn('Leaderboard sync error:', e);
    }
  }
};

// Featured Projects Sync
const Projects = {
  async sync() {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      if (!data.projects) return;

      const pj = document.getElementById('pj');
      if (pj && data.projects.length) {
        pj.innerHTML = data.projects.map(p => `
          <article class="c pc s4">
            <div class="cv"></div>
            <div class="b">
              <h3>${p.title}</h3>
              <p>${p.description}</p>
              <div class="f">
                <span class="tag">${p.category}</span>
                <span class="tag">▲ ${p.votesCount || 0} votes</span>
                <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              </div>
            </div>
          </article>
        `).join('');
      }
    } catch (e) {
      console.warn('Projects sync error:', e);
    }
  }
};

// Initialize after page load
document.addEventListener('DOMContentLoaded', async () => {
  await Auth.init();
  Leaderboard.sync();
  Projects.sync();

  // Connect Auth buttons in hero navigation
  const heroLogins = document.querySelectorAll('.xn .xa');
  heroLogins.forEach(el => {
    el.style.cursor = 'pointer';
    el.onclick = (e) => {
      e.stopPropagation();
      Modal.open('signup');
    };
  });

  // Connect Hackathon register button
  const hackRegBtn = document.querySelector('#v-hack .btns .bt.d');
  if (hackRegBtn) {
    hackRegBtn.onclick = () => {
      window.open('https://unstop.com/o/vON6wtS?lb=useupllP&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Parthhyg96055', '_blank');
    };
  }

  // Connect Add Task / Submit Project button in dashboard
  const addTaskBtn = document.querySelector('#tk .t.dash');
  if (addTaskBtn) {
    addTaskBtn.onclick = () => Modal.openProjectModal();
  }

  // Wire Run Code button in workspace
  const runBtn = document.getElementById('run');
  if (runBtn) {
    runBtn.onclick = () => Workspace.run();
  }

  // Hook Modal Forms
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
        toast('Project published to community! +50 XP awarded.');
        Modal.close();
        prjForm.reset();
        Projects.sync();
        await Auth.init();
      } catch (err) {
        alert(err.message);
      }
    };
  }
});
