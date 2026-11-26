(() => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  window.DevHarbourCertificateWorkspace = {
    async mount(options) {
      const requestedId = new URLSearchParams(location.search).get('id');
      let certificate, layout, recipient, credential;
      const status = message => { $('status').textContent = message; };
      const headers = () => {
        const token = localStorage.getItem('dh_token') || localStorage.getItem('dh-auth-token');
        return { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) };
      };
      async function call(path = '', options = {}) {
        const response = await fetch(optionsEndpoint + path, {
          ...options, headers: headers(), credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) {
          const body = await response.json();
          throw Error(response.status === 401 ? 'Sign in with your registered email to manage this certificate.' : body.error || 'Request failed.');
        }
        return response;
      }
      const optionsEndpoint = options.endpoint;
      function element(tag, attributes) {
        const node = document.createElementNS(svgNS, tag);
        for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
        $('certificate-preview').appendChild(node);
        return node;
      }
      function field(id, definition) {
        return element('text', {
          id, x: definition.x, y: definition.baseline, fill: definition.color,
          'font-family': definition.font === 'sans' ? 'Arial, Helvetica, sans-serif' : '"Times New Roman", Times, "Certificate Devanagari", serif',
          'font-weight': 700, 'font-size': definition.size, 'text-anchor': 'middle', 'xml:space': 'preserve',
        });
      }
      function fit(node, text, definition) {
        node.textContent = text || '';
        node.setAttribute('font-size', definition.size);
        const width = node.getComputedTextLength();
        if (width > definition.maxWidth) node.setAttribute('font-size', definition.size * definition.maxWidth / width);
      }
      function render(value) {
        const name = value.name || '';
        fit(recipient, layout.uppercase ? name.toUpperCase() : name, layout.name);
        fit(credential, value.id, layout.credential);
      }
      function display(value, owner = false) {
        certificate = value;
        render(value);
        $('name').value = value.name || '';
        $('name-form').hidden = !owner;
        $('download').hidden = !owner;
        $('download').disabled = !owner;
        $('save').disabled = !owner;
        $('share').disabled = false;
      }
      async function loadOwner() {
        const own = await (await call()).json();
        if (!requestedId || own.id === requestedId) {
          await document.fonts?.load('700 40px "Certificate Devanagari"', own.name);
          display(own, true);
          status('Your certificate is ready. Edit the name below and save to regenerate it.');
        }
      }
      $('name').addEventListener('input', () => {
        if (!certificate || !layout) return;
        render({ ...certificate, name: $('name').value });
        const changed = $('name').value !== certificate.name;
        $('download').disabled = changed;
        status(changed ? 'Name preview updated. Save the name before downloading.' : 'Your saved certificate is ready to download.');
      });
      $('name-form').addEventListener('submit', async event => {
        event.preventDefault();
        $('save').disabled = true;
        try {
          await call('/name', { method: 'PATCH', body: JSON.stringify({ name: $('name').value }) });
          await loadOwner();
          status('Name saved. Your certificate and PDF have been updated.');
        } catch (error) { status(error.message); }
        finally { $('save').disabled = false; }
      });
      $('download').addEventListener('click', async () => {
        $('download').disabled = true;
        try {
          const blob = await (await call('/pdf')).blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = options.filename;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) { status(error.message); }
        finally { $('download').disabled = $('name').value !== certificate?.name; }
      });
      $('share').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(new URL(options.page + '?id=' + encodeURIComponent(certificate.id), location.origin).href);
          status('Verification link copied.');
        } catch { status('Unable to copy the verification link.'); }
      });
      $('name-form').hidden = $('download').hidden = true;
      try {
        const response = await fetch('/assets/certificates/layouts.json?v=reference-2026');
        if (!response.ok) throw Error('The certificate template could not load. Please refresh.');
        layout = (await response.json())[options.event];
        $('certificate-preview').setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
        element('image', { href: layout.template, x: 0, y: 0, width: layout.width, height: layout.height });
        recipient = field('recipient', layout.name);
        credential = field('credential', layout.credential);
        if (requestedId) {
          if (!options.idPattern.test(requestedId)) throw Error('Invalid certificate link.');
          const verified = await fetch(options.verify + encodeURIComponent(requestedId), { cache: 'no-store', signal: AbortSignal.timeout(20000) });
          const result = await verified.json();
          if (!verified.ok || !result.verified) throw Error('This certificate is invalid or unavailable.');
          const value = result.credential;
          display({ id: value.credential_id, name: value.recipient_name || '' });
          status('Verified participation certificate.');
        }
        try { await loadOwner(); }
        catch (error) { if (!requestedId) throw error; }
      } catch (error) { status(error.message); }
    },
  };
})();
