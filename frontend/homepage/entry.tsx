import { createRoot } from "react-dom/client";
import Home from "./Home";
import design from "./design.css";
import enhancements from "./enhancements.css";

const intro = document.getElementById("intro");
if (intro) {
  const fonts = document.createElement("link");
  fonts.rel = "stylesheet";
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
    "#intro.dh-redesigned{display:block;overflow-y:auto;overflow-x:clip;background:#0d0c17}#intro.dh-redesigned>:not(#dh-homepage){display:none!important}#dh-homepage{display:block;min-height:100%;color:#fff}";
  document.head.appendChild(isolation);
  intro.classList.add("dh-redesigned");
  window.goApp = (view) => window.show?.(view, true);
  window.goLanding = () => {
    intro.classList.remove("out");
    intro.scrollTop = 0;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  };
  const logo = document.querySelector<HTMLElement>(".sb .logo");
  if (logo) {
    logo.setAttribute("role", "button");
    logo.tabIndex = 0;
    logo.title = "Return to DevHarbour homepage";
    logo.addEventListener("click", () => window.goLanding?.());
    logo.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.goLanding?.();
      }
    });
  }
}
