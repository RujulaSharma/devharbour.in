import { createRoot } from "react-dom/client";
import Navbar from "./Navbar";

export function installPlatformShell(intro: HTMLElement, styles: string) {
  document.body.classList.remove("dh-sidebar-collapsed");
  const host = document.createElement("div");
  host.id = "dh-platform-navigation";
  host.hidden = true;
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = styles + '\n:host{background:transparent;min-height:0}.platform-navbar{position:relative;top:0;left:0;width:100%;padding:0 18px;gap:12px;box-sizing:border-box}';
  shadow.append(style);
  const mount = document.createElement("div"); shadow.append(mount);
  document.body.prepend(host);
  const measure = () => {
    if (!host.hidden) document.documentElement.style.setProperty('--dh-navbar-space', `${Math.ceil(mount.getBoundingClientRect().height) + 16}px`);
  };
  new ResizeObserver(measure).observe(mount);
  function syncVisibility() {
    const visible = intro.classList.contains("out");
    host.hidden = !visible;
    document.body.classList.toggle("dh-platform-visible", visible);
    measure();
  }
  new MutationObserver(syncVisibility).observe(intro, { attributes: true, attributeFilter: ["class"] });
  syncVisibility();
  createRoot(mount).render(<Navbar platform />);
}
