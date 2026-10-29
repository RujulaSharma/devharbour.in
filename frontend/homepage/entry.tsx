import { createRoot } from "react-dom/client";
import Home from "./Home";
import design from "./design.css";
import enhancements from "./enhancements.css";
import { platformPath, platformRoutes } from "./platform";
import { installPlatformShell } from "./shell";

const intro = document.getElementById("intro");
if (intro) {
  const fonts = document.createElement("link");
  fonts.rel = "stylesheet";
  fonts.media = "print";
  fonts.onload = () => { fonts.media = "all"; };
  fonts.href =
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap";
  document.head.appendChild(fonts);
  const host = document.createElement("div");
  host.id = "dh-homepage";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = design + enhancements;
  shadow.appendChild(style);
  const mount = document.createElement("div");
  shadow.appendChild(mount);
  intro.prepend(host);
  createRoot(mount).render(<Home />);
  const isolation = document.createElement("style");
  isolation.textContent =
    "#intro.dh-redesigned{display:block;overflow-y:auto;overflow-x:clip;background:#0d0c17}#intro.dh-redesigned>:not(#dh-homepage):not(#dh-homepage-boot){display:none!important}#dh-homepage{display:block;min-height:100%;color:#fff}";
  document.head.appendChild(isolation);
  intro.classList.add("dh-redesigned");
  installPlatformShell(intro, design + enhancements);
  const originalShow = window.show;
  let restoringRoute = false;
  function setPath(path?: string) {
    if (path && location.pathname + location.search + location.hash !== path) history.pushState(null, "", path);
  }
  window.show = (view, fromUserAction = false, publicVerification = false) => {
    if (view === 'home' && !window.isAuthenticated?.()) { void window.goApp?.('home'); return; }
    originalShow?.(view, fromUserAction, publicVerification);
    if (fromUserAction && !restoringRoute) setPath(platformPath(view));
    window.dispatchEvent(new Event("dh:route-changed"));
  };
  window.goApp = async (view, path = platformPath(view)) => {
    if (view === 'home') {
      await window.authSessionReady;
      if (!window.isAuthenticated?.()) {
        window.goLanding?.();
        history.replaceState(null, '', '/');
        window.openAuthModal?.('login');
        return;
      }
    }
    setPath(path);
    restoringRoute = true;
    try { window.show?.(view, true); } finally { restoringRoute = false; }
  };
  function showLanding() {
    if (!intro) return;
    intro.classList.remove("out");
    intro.scrollTop = 0;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.dispatchEvent(new Event("dh:route-changed"));
  }
  window.goLanding = () => {
    showLanding();
    setPath("/");
  };
  function restoreRoute() {
    const view = platformRoutes[location.pathname.replace(/\/$/, "")];
    restoringRoute = true;
    try {
      if (view === 'home') void window.goApp?.('home', location.pathname + location.search + location.hash);
      else if (view) window.show?.(view, true);
      else if (location.pathname === "/") showLanding();
    } finally { restoringRoute = false; }
  }
  window.addEventListener("popstate", restoreRoute);
  window.addEventListener('dh:auth-changed', () => {
    if (!window.currentUser && location.pathname === '/dashboard') window.goLanding?.();
  });
  // Exact-ID certificate routes are handled by the existing certificate viewer.
  if (platformRoutes[location.pathname.replace(/\/$/, "")]) restoreRoute();
}
