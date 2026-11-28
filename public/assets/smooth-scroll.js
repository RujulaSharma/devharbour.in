(() => {
  const landing = document.getElementById('intro');
  const smoothWheel = window.matchMedia('(prefers-reduced-motion: no-preference) and (any-pointer: fine)');
  let controller;
  let activeWrapper;

  document.getElementById('landing-back-to-top')?.addEventListener('click', event => {
    event.preventDefault();
    if (activeWrapper === landing && controller) controller.scrollTo(0);
    else landing?.scrollTo({ top: 0 });
  });

  if (typeof window.Lenis !== 'function') return;

  function updateScroller() {
    const wrapper = smoothWheel.matches
      ? (landing && !landing.classList.contains('out') ? landing : window)
      : null;
    if (wrapper === activeWrapper) return;

    controller?.destroy();
    controller = undefined;
    activeWrapper = wrapper;
    if (!wrapper) return;

    controller = new window.Lenis({
      wrapper,
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.1,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: node => node.matches?.('textarea, select, [contenteditable], [role="dialog"], dialog')
    });
  }

  if (landing) {
    new MutationObserver(updateScroller).observe(landing, { attributes: true, attributeFilter: ['class'] });
  }
  smoothWheel.addEventListener('change', updateScroller);
  updateScroller();
})();
