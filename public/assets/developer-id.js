(() => {
  const $ = id => document.getElementById(id);
  const imageUrls = [];
  let flipped = false;
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
  function flip() {
    flipped = !flipped;
    $('card-object').classList.toggle('is-flipped', flipped);
    $('flip').textContent = flipped ? 'Show front' : 'Show back';
    $('flip').setAttribute('aria-pressed', String(flipped));
    $('card-stage').setAttribute('aria-pressed', String(flipped));
    document.querySelector('.card-front').setAttribute('aria-hidden', String(flipped));
    document.querySelector('.card-back').setAttribute('aria-hidden', String(!flipped));
    $('download').textContent = 'Download ' + (flipped ? 'back' : 'front') + ' PNG';
  }
  function interaction() {
    const stage = $('card-stage'), card = $('card-object');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    stage.setAttribute('role', 'button');
    stage.setAttribute('aria-pressed', 'false');
    stage.addEventListener('pointermove', event => {
      if (reduced.matches || event.pointerType === 'touch') return;
      const bounds = stage.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / bounds.width - .5));
      const y = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / bounds.height - .5));
      stage.classList.add('is-tilting');
      card.style.setProperty('--tilt-x', (-y * 14).toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', (x * 22).toFixed(2) + 'deg');
      card.style.setProperty('--glare-x', (50 + x * 80) + '%');
      card.style.setProperty('--glare-y', (50 + y * 80) + '%');
    });
    stage.addEventListener('pointerleave', () => {
      stage.classList.remove('is-tilting');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
    stage.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) { event.preventDefault(); flip(); }
    });
    stage.addEventListener('click', flip);
    $('flip').addEventListener('click', flip);
  }
  async function load() {
    try {
      const id = decodeURIComponent(location.pathname.split('/').filter(Boolean)[1] || new URLSearchParams(location.search).get('id') || '');
      if (!/^DH-[A-Z0-9_-]{1,80}$/i.test(id)) throw Error('Open the Developer Identity option on a profile to view its ID card.');
      const asVisitor = new URLSearchParams(location.search).get('asVisitor') === '1';
      const endpoint = '/api/profile/id/' + encodeURIComponent(id);
      function url(path = '', params = {}) {
        const search = new URLSearchParams({ ...(asVisitor ? { asVisitor: '1' } : {}), ...params });
        return endpoint + path + (search.size ? '?' + search : '');
      }
      const { card } = await (await request(url())).json();
      const blobs = await Promise.all(['front', 'back'].map(async side => (await request(url('/card.svg', { side }))).blob()));
      for (const [index, element] of [$('card-preview'), $('card-back')].entries()) {
        const objectUrl = URL.createObjectURL(blobs[index]);
        imageUrls.push(objectUrl);
        element.src = objectUrl;
        element.alt = card.fullName + ' — ' + (index ? 'back' : 'front') + ' of developer card ' + card.developerId;
      }
      await Promise.all([$('card-preview').decode(), $('card-back').decode()]);
      document.querySelector('h1').textContent = card.isOwner ? 'Your developer pass.' : card.fullName + '’s developer pass.';
      document.title = card.developerId + ' | Dev Harbour';
      $('member-name').textContent = card.fullName;
      $('member-username').textContent = '@' + card.username;
      $('profile-link').href = card.isOwner ? '/profile' : card.profileUrl;
      $('photo-help').hidden = Boolean(card.photoDataUrl) || !card.isOwner;
      detail('Developer ID', card.developerId);
      detail('Member since', card.memberSince);
      detail('Headline', card.headline);
      detail('Location', card.location);
      detail('Level', card.level);
      detail('Member class', card.title);
      detail('Total XP', card.totalXp);
      $('card-content').hidden = false;
      $('status').textContent = 'Made for you. Connected to your Dev Harbour profile.';
      interaction();
      async function download(format) {
        const side = flipped ? 'back' : 'front';
        $('download').disabled = $('download-svg').disabled = true;
        try {
          const image = URL.createObjectURL(await (await request(url('/download', { format, side }))).blob());
          const link = document.createElement('a');
          link.href = image;
          link.download = card.developerId + '-' + side + '.' + format;
          link.click();
          setTimeout(() => URL.revokeObjectURL(image), 1000);
        } catch (error) { $('status').textContent = error.message; }
        finally { $('download').disabled = $('download-svg').disabled = false; }
      }
      $('download').onclick = () => download('png');
      $('download-svg').onclick = () => download('svg');
    } catch (error) {
      $('status').textContent = error.message === 'The source image cannot be decoded.' ? 'The card preview could not load. Please refresh to try again.' : error.message;
      $('error-help').hidden = false;
    }
  }
  window.addEventListener('pagehide', () => imageUrls.forEach(url => URL.revokeObjectURL(url)));
  load();
})();
