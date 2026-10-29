import { useEffect, useRef, useState } from "react";
import { Menu, X, Sun, Moon, UserRound } from "lucide-react";
import { handleNavigation } from "./platform";

const groups = [
  {label:'Learn',items:[{label:'Courses',path:'/courses'},{label:'Roadmaps',path:'/roadmaps'}]},
  {label:'Practice',items:[{label:'DSA & Challenges',path:'/practice'},{label:'Focus Timer',path:'/timer'}]},
  {label:'Build',items:[{label:'Workspace',path:'/workspace'},{label:'Project Gallery',path:'/projects'}]},
  {label:'Explore',items:[{label:'Hackathons',path:'/hackathons'},{label:'Community',path:'/community'}]},
  {label:'Resources',items:[{label:'Certificates',path:'/certificate'}]},
];

export default function Navbar({ platform = false }: { platform?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState(window.currentUser);
  const [accountOpen, setAccountOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const account = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(document.documentElement.getAttribute("data-theme") === "dark");
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(document.documentElement.getAttribute("data-theme") === "dark"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const closeMenu = () => { setMenu(false); setAccountOpen(false); header.current?.querySelectorAll('details[open]').forEach(detail => detail.removeAttribute('open')); };
    const authChanged = () => { setUser(window.currentUser); setAccountOpen(false); };
    const toggleAccount = () => setAccountOpen(open => !open);
    const outside = (event: PointerEvent) => { header.current?.querySelectorAll('details[open]').forEach(detail => { if (!event.composedPath().includes(detail)) detail.removeAttribute('open'); }); if (account.current && !event.composedPath().includes(account.current)) setAccountOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { const wasOpen = !!account.current?.querySelector('.account-dropdown'); const expanded=header.current?.querySelector('details[open] summary') as HTMLElement | null; closeMenu(); expanded?.focus(); if (wasOpen) account.current?.querySelector('button')?.focus(); } };
    window.addEventListener("dh:auth-changed", authChanged);
    // Session restoration can finish between the first render and effect setup.
    authChanged();
    window.addEventListener("dh:profile-menu", toggleAccount);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("dh:route-changed", closeMenu);
    window.addEventListener("keydown", escape);
    return () => {
      observer.disconnect();
      window.removeEventListener("dh:auth-changed", authChanged);
      window.removeEventListener("dh:profile-menu", toggleAccount);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("dh:route-changed", closeMenu);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  return <header ref={header} className={"navbar" + (platform ? " platform-navbar" : "") + (dark ? "" : " is-light")} onClick={handleNavigation}>
    <a className="logo" href="/"><span className="logo-icon">⌘</span> DevHarbour</a>
    <nav className="nav-links" aria-label="Main navigation">
      {groups.map(group => <details className="nav-group" key={group.label} onToggle={event => {
        const current=event.currentTarget;if(current.open)header.current?.querySelectorAll('details[open]').forEach(detail=>{if(detail!==current)detail.removeAttribute('open');});
      }}><summary>{group.label}<span aria-hidden="true">⌄</span></summary><div className="nav-group-list">{group.items.map(item=><a key={item.path} href={item.path}>{item.label}</a>)}</div></details>)}
    </nav>
    {!user && <div className="nav-auth"><a href="#join" onClick={event => { event.preventDefault(); event.stopPropagation(); window.openAuthModal?.('login'); }}>Sign In</a><a href="#join" className="nav-btn">Get Started</a></div>}
    {user && <div className="account-control" ref={account}>
      <button type="button" className="account-trigger" aria-label="Open account options" aria-expanded={accountOpen}
        onClick={() => setAccountOpen(!accountOpen)}><UserRound size={19} aria-hidden="true" /></button>
      {accountOpen && <nav className="account-dropdown" aria-label="Account options">
        <strong>{user.fullName || user.username}</strong>
        <button type="button" onClick={() => { setAccountOpen(false); window.openProfileModal?.(); }}>Profile</button>
        <a href="/dashboard" onClick={() => setAccountOpen(false)}>Dashboard</a>
        <a href="/settings" onClick={() => setAccountOpen(false)}>Settings</a>
        <button type="button" onClick={() => { setAccountOpen(false); void window.openSavedCourses?.(); }}>Saved Courses</button>
        <a href="/certificate" onClick={() => setAccountOpen(false)}>Certificates</a>
        <button type="button" aria-pressed={dark} onClick={() => window.setPlatformTheme?.(dark ? 'light' : 'dark')}>
          {dark ? 'Theme: Dark — switch to Light' : 'Theme: Light — switch to Dark'}
        </button>
        <button type="button" onClick={() => { setAccountOpen(false); window.handleLogout?.(); }}>Sign Out</button>
      </nav>}
    </div>}
    {!user && <button type="button" className="theme-toggle" aria-label="Toggle light and dark theme" aria-pressed={dark}
      title={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => window.setPlatformTheme?.(dark ? "light" : "dark")}>
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>}
    <button type="button" className="mobile-menu-button" onClick={() => setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>
      {menu ? <X /> : <Menu />}
    </button>
    {menu && <nav className="mobile-menu" aria-label="Mobile navigation">
      {groups.map(group=><details className="nav-group" key={group.label}><summary>{group.label}<span aria-hidden="true">⌄</span></summary><div className="nav-group-list">{group.items.map(item=><a key={item.path} href={item.path} onClick={()=>setMenu(false)}>{item.label}</a>)}</div></details>)}
      {!user && <a href="#join" onClick={() => setMenu(false)}>Get Started</a>}
    </nav>}
  </header>;
}
