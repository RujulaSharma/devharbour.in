// Dedicated profile screen. Uses the existing account/profile endpoints.
(() => {
  const $ = id => document.getElementById(id);
  let renderedUser = null;
  let saving = false;
  const fields = ['fullName', 'location', 'bio', 'githubUrl', 'portfolioUrl'];
  const ids = ['profile-name-input', 'profile-location-input', 'profile-bio-input', 'profile-github-input', 'profile-portfolio-input'];
  const value = (u, key) => u[key] ?? u[{fullName:'full_name',githubUrl:'github_url',portfolioUrl:'portfolio_url',avatarUrl:'avatar_url'}[key]] ?? '';
  function safeLink(element, url) {
    element.replaceChildren();
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported URL');
      const link = document.createElement('a');
      link.href = parsed.href; link.textContent = parsed.hostname + (parsed.pathname === '/' ? '' : parsed.pathname);
      link.target = '_blank'; link.rel = 'noopener noreferrer'; element.appendChild(link);
    } catch { element.textContent = 'Not added yet'; }
  }
  function updateSummary(user) {
    $('profile-display-name').textContent = value(user,'fullName') || user.username || 'Developer';
    $('profile-username').textContent = '@' + (user.username || 'developer');
    $('profile-email').textContent = user.email || '';
    $('profile-location').textContent = user.location || 'Add your location';
    $('profile-short-bio').textContent = user.bio || 'A little about you, your interests, and what you are building.';
    $('profile-account-state').textContent = user.emailVerified ? 'Email verified' : 'Developer account';
    $('profile-total-xp').textContent = Number(user.totalXp ?? user.total_xp ?? 0).toLocaleString();
    $('profile-level').textContent = user.level ?? 1;
    $('profile-streak').textContent = user.streakDays ?? user.streak_days ?? 0;
    const avatar = $('profile-page-avatar');
    avatar.textContent = (value(user,'fullName') || user.username || 'D').trim().charAt(0).toUpperCase();
    try {
      const url = new URL(value(user,'avatarUrl'));
      if (url.protocol === 'https:') {
        const image = document.createElement('img'); image.alt = ''; image.src = url.href;
        image.addEventListener('error', () => { avatar.textContent = (user.username || 'D')[0].toUpperCase(); });
        avatar.replaceChildren(image);
      }
    } catch { /* Initials are the avatar fallback. */ }
    safeLink($('profile-github-link'), value(user,'githubUrl'));
    safeLink($('profile-portfolio-link'), value(user,'portfolioUrl'));
    const percent = Math.round(fields.filter(k => String(value(user,k)).trim()).length / fields.length * 100);
    $('profile-completion-ring').style.setProperty('--done', percent);
    $('profile-completion-value').textContent = percent + '%';
    $('profile-completion-title').textContent = percent === 100 ? 'Your profile is looking good.' : 'Make your profile your own.';
  }
  async function loadBadges(userId) {
    const target = $('profile-earned-badges');
    target.textContent = 'Loading your badges…';
    try {
      const response = await fetch('/api/user/summary', {headers:getAuthHeaders(),cache:'no-store'});
      const data = await response.json();
      if (currentUser?.id !== userId) return;
      if (!response.ok) throw new Error();
      target.replaceChildren();
      const badges = Array.isArray(data.achievements) ? data.achievements : [];
      target.className = badges.length ? 'profile-badges' : 'profile-empty';
      if (!badges.length) target.textContent = 'Your earned badges will appear here as you make progress on Dev Harbour.';
      badges.forEach(badge => {
        const card = document.createElement('div'); card.className = 'profile-badge';
        const title = document.createElement('strong'); title.textContent = badge.title || badge.name || 'Achievement';
        const desc = document.createElement('span'); desc.textContent = badge.description || 'Earned on Dev Harbour';
        card.append(title,desc); target.appendChild(card);
      });
    } catch { if (currentUser?.id === userId) target.textContent = 'Badges could not be loaded. Reopen your profile to try again.'; }
  }
  window.renderProfilePage = function(force = false) {
    if (!$('v-profile')?.classList.contains('on')) return;
    const user = currentUser;
    $('profile-signed-out').hidden = Boolean(user);
    $('profile-signed-in').hidden = !user;
    if (!user) { renderedUser = null; return; }
    updateSummary(user);
    if (force || renderedUser !== user.id) {
      fields.forEach((key,i) => { $(ids[i]).value = value(user,key); });
      $('profile-save-status').textContent = '';
      renderedUser = user.id;
      loadBadges(user.id);
    }
  };
  window.openProfilePage = function() {
    if (!currentUser) { openAuthModal('login'); return; }
    show('profile', true);
    window.renderProfilePage(true);
    $('profile-page-title').focus({preventScroll:true});
  };
  const view = $('v-profile');
  if (!view) return;
  new MutationObserver(() => window.renderProfilePage()).observe(view, {attributes:true,attributeFilter:['class']});
  view.querySelectorAll('[data-profile-focus]').forEach(button => button.addEventListener('click', () => $(button.dataset.profileFocus).focus()));
  $('profile-discard').addEventListener('click', () => { if (!saving) window.renderProfilePage(true); });
  $('profile-edit-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (saving || !currentUser) return;
    const ownerId = currentUser.id;
    const auth = getAuthHeaders();
    const payload = Object.fromEntries(fields.map((key,i) => [key,$(ids[i]).value.trim()]));
    const status = $('profile-save-status'); status.className = 'profile-status';
    for (const key of ['githubUrl','portfolioUrl']) {
      if (!payload[key]) continue;
      try { if (!['https:','http:'].includes(new URL(payload[key]).protocol)) throw new Error(); }
      catch { status.classList.add('error'); status.textContent = 'Use a complete http:// or https:// link.'; return; }
    }
    saving = true; $('profile-save').disabled = true; $('profile-discard').disabled = true;
    status.textContent = 'Saving your profile…';
    try {
      const response = await fetch('/api/auth/profile',{method:'PUT',headers:auth,body:JSON.stringify(payload)});
      const data = await response.json();
      if (!response.ok || !data.user) throw new Error(data.error || 'Your profile could not be saved. Please try again.');
      if (currentUser?.id !== ownerId || getAuthHeaders().Authorization !== auth.Authorization) return;
      currentUser = {...currentUser,...data.user,...payload};
      localStorage.setItem('dh_current_user',JSON.stringify(currentUser));
      localStorage.setItem('dh-current-user',JSON.stringify(currentUser));
      updateAuthUI(); updateSummary(currentUser);
      status.classList.add('success'); status.textContent = 'Profile saved. You’re all set.';
    } catch(error) {
      status.classList.add('error'); status.textContent = error.message || 'Unable to save. Check your connection and try again.';
    } finally { saving = false; $('profile-save').disabled = false; $('profile-discard').disabled = false; }
  });
  window.renderProfilePage();
})();
