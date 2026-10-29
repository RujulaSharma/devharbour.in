import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { handleNavigation } from "./platform";

const links = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Learn", path: "/courses" },
  { label: "Practice", path: "/practice" },
  { label: "Timer", path: "/timer" },
  { label: "Workspace", path: "/workspace" },
  { label: "Hackathons", path: "/hackathons" },
  { label: "Courses", path: "/courses" },
  { label: "Projects", path: "/projects" },
  { label: "Roadmaps", path: "/roadmaps" },
  { label: "Community", path: "/community" },
  { label: "Certificates", path: "/certificate" },
  { label: "Settings", path: "/settings" },
];

export default function Navbar({ platform = false }: { platform?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(document.documentElement.getAttribute("data-theme") === "dark");
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(document.documentElement.getAttribute("data-theme") === "dark"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const closeMenu = () => setMenu(false);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    window.addEventListener("dh:route-changed", closeMenu);
    window.addEventListener("keydown", escape);
    return () => {
      observer.disconnect();
      window.removeEventListener("dh:route-changed", closeMenu);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  return <header className={"navbar" + (platform ? " platform-navbar" : "") + (dark ? "" : " is-light")} onClick={handleNavigation}>
    <a className="logo" href="/"><span className="logo-icon">⌘</span> DevHarbour</a>
    <nav className="nav-links" aria-label="Main navigation">
      {links.map(({ label, path }) => <a key={label} href={path}>{label}</a>)}
    </nav>
    <div className="nav-auth"><a href="#join">Sign In</a><a href="#join" className="nav-btn">Get Started</a></div>
    <button type="button" className="theme-toggle" aria-label="Toggle light and dark theme" aria-pressed={dark}
      title={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => window.setPlatformTheme?.(dark ? "light" : "dark")}>
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
    <button type="button" className="mobile-menu-button" onClick={() => setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>
      {menu ? <X /> : <Menu />}
    </button>
    {menu && <nav className="mobile-menu" aria-label="Mobile navigation">
      {links.map(({ label, path }) => <a key={label} href={path} onClick={() => setMenu(false)}>{label}</a>)}
      <a href="#join" onClick={() => setMenu(false)}>Get Started</a>
    </nav>}
  </header>;
}
