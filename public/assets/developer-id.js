(() => {
  const $ = id => document.getElementById(id);
  let imageUrl;
  function headers() {
    const token = localStorage.getItem('dh_token') || localStorage.getItem('dh-auth-token');
    return token ? { Authorization: 'Bearer ' + token } : {};
  }
  async function request(url) {
    const response = await fetch(url, { headers: headers(), credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(20000) });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw Error(response.status === 404 ? 'This ID card is private or unavailable. Sign in with the account it belongs to.' : result.error || 'Unable to load the ID card. Please try again.');
    }
    return response;
  }
  function detail(label, value) {
    if (value === '' || value === null || value === undefined) return;
    const row = document.createElement('div');
    row.className = 'detail';
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.textContent = String(value);
    row.append(term, description);
    $('card-details').appendChild(row);
  }
  async function load() {
    try {
      const id = decodeURIComponent(location.pathname.split('/').filter(Boolean)[1] || new URLSearchParams(location.search).get('id') || '');
      if (!/^DH-[A-Z0-9_-]{1,80}$/i.test(id)) throw Error('Open the Developer Identity option on a profile to view its ID card.');
      const asVisitor = new URLSearchParams(location.search).get('asVisitor') === '1' ? '?asVisitor=1' : '';
      const endpoint = '/api/profile/id/' + encodeURIComponent(id);
      const { card } = await (await request(endpoint + asVisitor)).json();
      imageUrl = URL.createObjectURL(await (await request(endpoint + '/card.svg' + asVisitor)).blob());
      $('card-preview').src = imageUrl;
      $('card-preview').alt = card.fullName + ' — Dev Harbour developer ID ' + card.developerId;
      document.querySelector('h1').textContent = card.isOwner ? 'Your Dev Harbour ID card' : card.fullName + '’s developer ID card';
      document.title = card.developerId + ' | Dev Harbour';
      $('profile-link').href = card.isOwner ? '/profile' : card.profileUrl;
      detail('Developer ID', card.developerId);
      detail('Name', card.fullName);
      detail('Username', '@' + card.username);
      detail('Member since', card.memberSince);
      detail('Headline', card.headline);
      detail('Location', card.location);
      detail('Level', card.level);
      detail('Developer title', card.title);
      detail('Total XP', card.totalXp);
      $('card-content').hidden = false;
      $('status').textContent = 'Your card uses the details saved in your Dev Harbour profile.';
      $('download').onclick = async () => {
        $('download').disabled = true;
        try {
          const url = URL.createObjectURL(await (await request(endpoint + '/download' + asVisitor)).blob());
          const link = document.createElement('a');
          link.href = url;
          link.download = card.developerId + '.svg';
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) { $('status').textContent = error.message; }
        finally { $('download').disabled = false; }
      };
    } catch (error) {
      $('status').textContent = error.message;
      $('error-help').hidden = false;
    }
  }
  window.addEventListener('pagehide', () => { if (imageUrl) URL.revokeObjectURL(imageUrl); });
  load();
})();
