import { useEffect, useState, type MouseEvent } from "react";

export type Project = {
  id: string;
  name: string;
  kind: string;
  stack: string[];
  heart: string;
  theme: string;
  label: string;
  symbol: string;
  url?: string;
  repoUrl?: string;
};
type Course = {
  icon: string;
  class: string;
  level: string;
  title: string;
  meta: string;
  rating: string;
  url: string;
};
type Ranking = {
  userId: string;
  username: string;
  fullName: string;
  xp: number;
  challengesSolved: number;
};
type Roadmap = { name: string; sub: string; color: string; nodes: string[] };
type Hackathon = { name: string; desc: string; status: string };
declare global {
  interface Window {
    currentUser?: { id: string; username?: string; fullName?: string } | null;
    authSessionReady?: Promise<void>;
    openProfileModal?: () => void;
    handleLogout?: () => void;
    enter?: (view: string) => void;
    show?: (view: string, fromUserAction?: boolean, publicVerification?: boolean) => void;
    isAuthenticated?: () => boolean;
    openAuthModal?: (tab: string) => void;
    goApp?: (view: string, path?: string) => void;
    goLanding?: () => void;
    setPlatformTheme?: (theme: "light" | "dark") => void;
    openMyCertificates?: () => Promise<void>;
    openSavedCourses?: () => Promise<void>;
    DHHomepage?: {
      catalogProjects?: {name:string;description:string;category:string;repoUrl:string;demoUrl:string}[];
      hackathon: { name: string; desc: string; info: string[][] };
      paths: { title: string; modules?: { title: string }[] }[];
    };
  }
}
export const initialProjects: Project[] = ["snap", "harbour", "task"].map(
  (theme) => ({
    id: "",
    name: "Loading projects…",
    kind: "Live project data will appear here.",
    stack: [],
    heart: "—",
    theme,
    label: "Community projects",
    symbol: "⌘",
  }),
);
export const platformRoutes: Record<string, string> = {
  "/dashboard": "home", "/courses": "learn", "/projects": "projects",
  "/hackathons": "hack", "/roadmaps": "learn", "/community": "comm",
  "/workspace": "work", "/practice": "practice", "/timer": "timer",
  "/settings": "settings",
};
export function platformPath(view: string) {
  return Object.keys(platformRoutes).find(path => platformRoutes[path] === view);
}
export function navigate(view: string) {
  window.goApp?.(view);
}
export function handleNavigation(event: MouseEvent<HTMLElement>) {
  event.stopPropagation();
  const link = (event.target as Element).closest("a");
  if (
    !link ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const href = link.getAttribute("href") || "";
  if (href === "/certificate") {
    event.preventDefault();
    window.openMyCertificates?.();
    return;
  }
  if (href === "/") {
    event.preventDefault();
    window.goLanding?.();
    return;
  }
  if (platformRoutes[href]) {
    event.preventDefault();
    window.goApp?.(platformRoutes[href], href);
    return;
  }
  if (!href.startsWith("#")) return;
  event.preventDefault();
  if (href.startsWith("#platform-")) {
    navigate(href.slice(10));
    return;
  }
  if (href === "#join") {
    if (window.isAuthenticated?.()) navigate("home");
    else
      window.openAuthModal?.(
        link.textContent?.includes("Sign In") ? "login" : "signup",
      );
    return;
  }
  const root = event.currentTarget.getRootNode() as ShadowRoot;
  root.getElementById(href.slice(1))?.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
}
export function useHomepageData() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [projects, setProjects] = useState(initialProjects);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const source = window.DHHomepage;
  const hackathon: Hackathon = {
    name: source?.hackathon.name || "Featured hackathon",
    desc:
      source?.hackathon.desc ||
      "Explore the existing hackathon page for the latest details.",
    status:
      source?.hackathon.info.find((item) => item[0] === "Status")?.[1] ||
      "See event details",
  };
  const roadmaps: Roadmap[] = (source?.paths || [])
    .filter((path) => path.modules?.length)
    .map((path) => ({
      name: path.title,
      sub: "Existing DevHarbour curriculum",
      color: "#b76af5",
      nodes: path.modules!.slice(0, 5).map((module) => module.title),
    }))
    .filter((path) => path.nodes.length === 5);
  useEffect(() => {
    const abort = new AbortController();
    async function load<T>(
      name: string,
      path: string,
      consume: (data: T) => void,
    ) {
      try {
        const response = await fetch(path, { signal: abort.signal });
        if (!response.ok) throw new Error();
        consume(await response.json());
      } catch {
        if (!abort.signal.aborted) {
          setErrors((previous) => [...previous, name]);
          if (name === "projects")
            setProjects(
              initialProjects.map((project) => ({
                ...project,
                name: "Projects unavailable",
                kind: "Open the project gallery or refresh to retry.",
              })),
            );
        }
      }
    }
    void load<{
      courses: {
        title: string;
        level: string;
        provider: string;
        duration_hours: number;
        rating: number;
        external_url: string;
      }[];
    }>("courses", "/api/courses", (data) =>
      setCourses(
        data.courses.map((course, index) => ({
          icon: ["✦", "⚛", "⬡", "⌘"][index % 4],
          class: ["web", "react", "node", "python", "ai", "security"][
            index % 6
          ],
          level: course.level,
          title: course.title,
          meta: `${course.provider} · ${course.duration_hours} hours`,
          rating: String(course.rating),
          url: safeExternalUrl(course.external_url) || "#platform-learn",
        })),
      ),
    );
    void load<{ rankings: Ranking[] }>(
      "rankings",
      "/api/leaderboard?timeframe=All-time&limit=50",
      (data) => setRankings(data.rankings),
    );
    void load<{
      projects: {
        id: string;
        title: string;
        description: string;
        techStack: string[];
        votesCount: number;
        demoUrl: string;
        repoUrl: string;
      }[];
    }>("projects", "/api/projects", (data) => {
      const mapped = data.projects.slice(0, 3).map((project, index) => ({
        id: project.id,
        name: project.title,
        kind: project.description,
        stack: project.techStack,
        heart: String(project.votesCount),
        theme: ["snap", "harbour", "task"][index],
        label: project.title,
        symbol: "⌘",
        repoUrl: safeExternalUrl(project.repoUrl),
        url:
          safeExternalUrl(project.demoUrl) || safeExternalUrl(project.repoUrl),
      }));
      setProjects(
        mapped.length
          ? Array.from(
              { length: 3 },
              (_, index) => mapped[index % mapped.length],
            )
          : initialProjects.map((project) => ({
              ...project,
              name: "No published projects",
              kind: "Publish your first project in the existing gallery.",
            })),
      );
    });
    return () => abort.abort();
  }, []);
  return { courses, projects, rankings, hackathon, roadmaps, errors };
}
function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
