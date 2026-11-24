/* Optional analytics only. This is not an advertising CMP; no ad tags are loaded. */
(() => {
  const key = 'dh_analytics_consent';
  let panel;
  let analyticsLoaded = false;
  function read() { try { return localStorage.getItem(key); } catch { return null; } }
  function enable() {
    if (analyticsLoaded || read() !== 'granted') return;
    analyticsLoaded = true;
    window['ga-disable-G-HJSFWLF5VT'] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', 'G-HJSFWLF5VT');
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-HJSFWLF5VT';
    document.head.appendChild(script);
  }
  function choose(value) {
    try { localStorage.setItem(key, value); } catch { /* Remain usable when storage is blocked. */ }
    if (value === 'granted') enable();
    else {
      window['ga-disable-G-HJSFWLF5VT'] = true;
      if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', location.hostname, '.devharbour.in']) {
          document.cookie = name + '=;Max-Age=0;Path=/' + (domain ? ';Domain=' + domain : '');
        }
      }
    }
    panel.hidden = true;
  }
  function show() { panel.hidden = false; panel.querySelector('button').focus(); }
  function init() {
    panel = document.createElement('section');
    panel.className = 'consent'; panel.setAttribute('aria-label', 'Optional analytics');
    panel.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;max-width:650px;background:#fff;color:#28223f;border:1px solid #cbbce2;border-radius:16px;padding:18px;box-shadow:0 6px 30px #28223f22;z-index:9999';
    panel.innerHTML = '<p style="margin:0 0 12px">We use storage for sign-in and preferences. May we also use optional Google Analytics to understand site usage? Your choice does not affect access. <a href="/privacy/">Privacy policy</a></p><button type="button" data-choice="denied">Decline analytics</button> <button type="button" data-choice="granted">Allow analytics</button>';
    panel.querySelectorAll('button').forEach(b => {
      b.style.cssText = 'padding:10px 14px;margin:4px;border:1px solid #cbbce2;border-radius:10px;background:#f1ecfa;color:#28223f;cursor:pointer';
      b.addEventListener('click', () => choose(b.dataset.choice));
    });
    panel.hidden = read() !== null;
    document.body.appendChild(panel);
    document.addEventListener('click', e => { if (e.target.closest('[data-cookie-settings]')) show(); });
    if (read() === 'granted') enable();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
