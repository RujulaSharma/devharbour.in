'use strict';

const byId = id => document.getElementById(id);
const form = byId('entry-form');
const status = byId('entry-status');
const labels = { new: 'New', eligible: 'Eligible', needs_correction: 'Needs correction', shortlisted: 'Shortlisted' };
const formatTime = value => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
}).format(new Date(value)) + ' IST';
let entries = [];

async function request(path, method = 'GET', data) {
  const response = await fetch('/api/tatva/poster' + path, {
    method, credentials: 'same-origin',
    ...(data ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {})
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(result.error || 'Could not complete the request. Try again.'), { status: response.status });
  return result;
}

function showEntry(entry) {
  const link = byId('saved-link');
  link.hidden = !entry;
  if (!entry) return;
  link.href = entry.post_url;
  byId('post-url').value = entry.post_url;
  form.querySelector('button').textContent = 'Update link';
  status.textContent = `Entry received · ${formatTime(entry.submitted_at)} · ${labels[entry.status]}` + (entry.note ? ` — ${entry.note}` : '');
}

function statusOptions(select) {
  for (const [value, label] of Object.entries(labels)) select.add(new Option(label, value));
}

function renderEntries() {
  const filter = byId('review-filter').value;
  const list = byId('entries');
  list.replaceChildren();
  const visible = entries.filter(entry => !filter || entry.status === filter);
  byId('review-summary').textContent = `${visible.length} shown · ${entries.length} total · ${entries.filter(entry => entry.status === 'shortlisted').length} shortlisted`;
  for (const entry of visible) {
    const item = document.createElement('form');
    item.className = 'review-entry';
    const name = document.createElement('strong');
    name.textContent = `${entry.full_name} · ${formatTime(entry.submitted_at)}`;
    const link = document.createElement('a');
    link.textContent = 'Open LinkedIn post ↗';
    link.href = entry.post_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Review status');
    statusOptions(select);
    select.value = entry.status;
    const note = document.createElement('textarea');
    note.setAttribute('aria-label', 'Review note');
    note.placeholder = 'Review note. Visible to the entrant when requesting a correction.';
    note.maxLength = 1000;
    note.value = entry.note;
    const button = document.createElement('button');
    button.textContent = 'Save review';
    item.append(name, link, select, note, button);
    item.addEventListener('submit', async event => {
      event.preventDefault();
      button.disabled = true;
      try {
        const result = await request('/review/' + encodeURIComponent(entry.user_id), 'PATCH', {
          status: select.value, note: note.value, postUrl: entry.post_url
        });
        Object.assign(entry, result.entry);
        renderEntries();
      } catch (error) {
        byId('review-summary').textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
    list.append(item);
  }
}

async function load() {
  try {
    const info = await request('/info');
    byId('deadline').textContent = info.deadline ? `Deadline: ${formatTime(info.deadline)}${info.open ? '' : ' · Closed'}` : 'Submissions are awaiting an announced deadline.';
    if (!info.deadline) return;
    const { entry, organizer } = await request('/entry');
    byId('sign-in').hidden = byId('check-session').hidden = true;
    status.textContent = '';
    form.hidden = !info.open;
    showEntry(entry);
    if (organizer) {
      byId('review').hidden = false;
      try {
        ({ entries } = await request('/review'));
        renderEntries();
      } catch (error) { byId('review-summary').textContent = error.message; }
    }
  } catch (error) {
    form.hidden = true;
    byId('review').hidden = true;
    if (error.status === 401 || error.status === 403) {
      status.textContent = error.status === 401 ? 'Sign in to submit or view your entry.' : error.message;
      byId('sign-in').hidden = byId('check-session').hidden = false;
    } else {
      status.textContent = error.message || 'The challenge could not load. Refresh to try again.';
    }
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    const { entry } = await request('/entry', 'POST', { url: byId('post-url').value });
    showEntry(entry);
    if (!byId('review').hidden) load();
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
statusOptions(byId('review-filter'));
byId('review-filter').addEventListener('change', renderEntries);
byId('check-session').addEventListener('click', load);
load();
