/* Account certificates use server-side mailbox proof; no roster or codes in storage. */
(() => {
  'use strict';
  const root = document.getElementById('my-certificates');
  if (!root) return;
  let generation = 0, timer, controller, dialog;
  function el(tag, text, parent = root) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    parent.append(element);
    return element;
  }
  function button(text, action, parent = root) {
    const node = el('button', text, parent); node.type = 'button'; node.addEventListener('click', action); return node;
  }
  function alert(text) { const node = el('p', text); node.className = 'dh-cert-error'; node.setAttribute('role', 'alert'); return node; }
  async function api(path, body, signal) {
    const response = await fetch(path, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', signal,
      headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Request failed. Please retry.');
    return data;
  }
  function openCertificate(credential) {
    dialog?.remove();
    dialog = document.createElement('dialog'); dialog.className = 'dh-certificate-dialog';
    dialog.setAttribute('aria-labelledby', 'dh-my-cert-dialog-title');
    const top = el('div', '', dialog); top.className = 'dh-cert-dialog-top';
    el('h2', credential.event_name, top).id = 'dh-my-cert-dialog-title';
    button('Close', () => { dialog.close(); dialog.remove(); }, top);
    const slot = el('div', '', dialog);
    // Existing renderer escapes recipient names and credential IDs. No user HTML.
    slot.innerHTML = window.renderCertificateSvg(credential).replaceAll('dh-cert-svg', 'dh-my-cert-svg').replaceAll('dhBevel', 'dhMyBevel');
    button('Download certificate (SVG)', () => download(credential), dialog);
    document.body.append(dialog); dialog.showModal();
  }
  function download(credential) {
    const svg = window.renderCertificateSvg(credential);
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `${credential.credential_id.replace(/[^A-Za-z0-9-]/g, '')}.svg`;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function cards(data) {
    el('p', data.message);
    for (const credential of data.certificates) {
      const article = el('article'); el('h3', credential.event_name, article);
      el('p', `${credential.recipient_name} · ${credential.certificate_type} · ${credential.issue_date}`, article);
      el('p', credential.credential_id, article);
      const actions = el('div', '', article); actions.className = 'dh-cert-actions';
      button('View certificate', () => openCertificate(credential), actions);
      button('Download SVG', () => download(credential), actions);
      const url = new URL(credential.verification_url, location.origin).href;
      const link = el('a', 'Verify certificate', actions); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      button('Copy verification link', async event => {
        try { await navigator.clipboard.writeText(url); event.target.textContent = 'Link copied'; }
        catch {
          let input = article.querySelector('.dh-cert-share');
          if (!input) { input = el('input', '', article); input.className = 'dh-cert-share'; input.readOnly = true; input.setAttribute('aria-label', 'Certificate verification link'); }
          input.value = url; input.focus(); input.select();
        }
      }, actions);
    }
  }
  function verificationForm(status, version) {
    el('p', `Verify ${status.email} to access certificates registered to that email. Your existing certificate will be reused.`);
    if (!status.configured) { alert('Email verification is not configured yet. Please contact the organiser.'); return; }
    const send = button('Send verification code', async () => {
      send.disabled = true; message.textContent = 'Sending…';
      try {
        const result = await api('/api/auth/email-verification/send', {}, controller.signal);
        if (version !== generation) return;
        if (result.alreadyVerified) return refresh();
        message.textContent = 'Code sent. Check your inbox and spam folder. It expires in 10 minutes.';
        cooldown(result.retryAfter); code.focus();
      } catch (error) { if (version === generation) { message.textContent = error.message; cooldown(60); } }
    });
    const form = el('form');
    const label = el('label', 'Six-digit verification code', form); label.htmlFor = 'dh-email-code';
    const code = el('input', '', form); code.id = 'dh-email-code'; code.name = 'code'; code.type = 'text'; code.inputMode = 'numeric';
    code.autocomplete = 'one-time-code'; code.pattern = '[0-9]{6}'; code.maxLength = 6; code.required = true;
    const actions = el('div', '', form); actions.className = 'dh-cert-actions';
    const confirm = el('button', 'Verify email', actions); confirm.type = 'submit';
    const message = el('p'); message.setAttribute('role', 'status'); message.setAttribute('aria-live', 'polite');
    function cooldown(seconds) {
      clearInterval(timer); const end = Date.now() + seconds * 1000;
      const tick = () => { const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000)); send.disabled = remaining > 0; send.textContent = remaining ? `Resend in ${remaining}s` : 'Send verification code'; if (!remaining) clearInterval(timer); };
      tick(); if (seconds > 0) timer = setInterval(tick, 1000);
    }
    cooldown(status.retryAfter);
    form.addEventListener('submit', async event => {
      event.preventDefault(); confirm.disabled = true; message.textContent = 'Verifying…';
      try { await api('/api/auth/email-verification/confirm', { code: code.value.trim() }, controller.signal); if (version === generation) await refresh(); }
      catch (error) { if (version === generation) { message.textContent = error.message; confirm.disabled = false; } }
    });
  }
  async function refresh() {
    const version = ++generation; clearInterval(timer); controller?.abort(); controller = new AbortController();
    dialog?.close(); dialog?.remove(); root.replaceChildren();
    const title = el('h2', 'My Certificates'); title.id = 'my-certificates-title';
    if (!window.currentUser) { el('p', 'Sign in using your event registration email, then verify your mailbox to see your certificates.'); button('Sign in', () => window.openAuthModal('login')); return; }
    const loading = el('p', 'Checking your account email…');
    try {
      const status = await api('/api/auth/email-verification', undefined, controller.signal);
      if (version !== generation) return; loading.remove();
      if (!status.verified) return verificationForm(status, version);
      el('p', `Verified email: ${status.email}`);
      const data = await api('/api/certificates/mine', undefined, controller.signal);
      if (version === generation) cards(data);
    } catch (error) {
      if (version === generation) { loading.remove(); alert(error.message); button('Retry', refresh); }
    }
  }
  window.refreshMyCertificates = refresh;
  const certificateNav = document.querySelector('#nav [data-v="certificate"]');
  if (certificateNav) certificateNav.id = 'my-certificates-nav';
  window.addEventListener('dh:auth-changed', refresh);
  refresh();
})();
