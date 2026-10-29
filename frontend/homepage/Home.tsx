import Hero from "./Hero";
import Navbar from "./Navbar";
import Competitions from "./Competitions";
import { Pill, SectionTag, Reveal } from "./ui";
import {
  useHomepageData,
  initialProjects,
  navigate,
  handleNavigation,
} from "./platform";
import { useState, useRef, useLayoutEffect } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Code2,
  Users,
  Play,
  Heart,
  GitBranch,
  ChevronRight,
  Layers,
  Rocket,
  Instagram,
  Github,
  Linkedin,
} from "lucide-react";

const referencePaths = [
  {
    name: "Full Stack Developer",
    sub: "Complete career path",
    color: "#9f68ed",
    nodes: [
      "Fundamentals",
      "Frontend",
      "Backend",
      "Databases",
      "Build Projects",
    ],
  },
  {
    name: "Frontend Developer",
    sub: "Modern web development",
    color: "#32b6a5",
    nodes: ["HTML & CSS", "JavaScript", "React", "Next.js", "Portfolio"],
  },
  {
    name: "Backend Developer",
    sub: "APIs, databases & systems",
    color: "#e6a62c",
    nodes: ["Programming", "Node.js", "REST APIs", "Databases", "Deployment"],
  },
  {
    name: "DevOps Engineer",
    sub: "Deployment & infrastructure",
    color: "#7f8df4",
    nodes: ["Linux", "Networking", "Docker", "CI / CD", "Cloud"],
  },
  {
    name: "Data Science",
    sub: "From data to insights",
    color: "#5e9bfd",
    nodes: [
      "Python",
      "Statistics",
      "Pandas",
      "Machine Learning",
      "Data Projects",
    ],
  },
];
function ProjectVisual({
  idx,
  small = false,
  items = initialProjects,
}: {
  idx: number;
  small?: boolean;
  items?: typeof initialProjects;
}) {
  let p = items[idx] || items[0];
  return (
    <div
      className={
        "project-visual " + p.theme + (small ? " project-visual-small" : "")
      }
    >
      <div className="visual-nav">
        <span>
          {p.symbol} {p.name}
        </span>
        <span>☰</span>
      </div>
      <div className="visual-center">
        <small>{"PROJECT PREVIEW"}</small>
        <strong>{p.label}</strong>
        <p>{p.kind}</p>
        <span className="visual-button">
          {idx === 1 ? "Get Inspired" : "Get Started"} ↗
        </span>
      </div>
      <div className="visual-mountain" />
    </div>
  );
}
function CodeDemo() {
  return (
    <div className="ide">
      <div className="ide-top">
        <div className="macdots">
          <i />
          <i />
          <i />
        </div>
        <span>⌘ DevHarbour / my-awesome-project</span>
        <div className="ide-actions">
          <span>Share</span>
          <button onClick={() => navigate("work")}>
            <Play size={12} fill="currentColor" /> Run
          </button>
        </div>
      </div>
      <div className="ide-body">
        <div className="ide-explorer">
          <span className="ide-side-title">⌕ &nbsp; Files</span>
          <span>▾ src</span>
          <span className="file-on">▣ &nbsp; App.js</span>
          <span>▣ &nbsp; index.js</span>
          <span>▣ &nbsp; styles.css</span>
          <span>◇ &nbsp; public</span>
          <span>◇ &nbsp; package.json</span>
          <span>▣ &nbsp; README.md</span>
        </div>
        <div className="ide-code">
          <div className="ide-tab">✳ &nbsp; App.js &nbsp; ×</div>
          <div className="code-content">
            <div>
              <em>1</em>
              <b>import</b> React <b>from</b> <i>'react'</i>;
            </div>
            <div>
              <em>2</em>
              <b>import</b> <i>'./styles.css'</i>;
            </div>
            <div>
              <em>3</em>
            </div>
            <div>
              <em>4</em>
              <b>function</b> <strong>App</strong>() {"{"}
            </div>
            <div>
              <em>5</em> &nbsp;<b>return</b> (
            </div>
            <div>
              <em>6</em> &nbsp; &lt;<strong>div</strong> className=
              <i>"container"</i>&gt;
            </div>
            <div>
              <em>7</em> &nbsp; &nbsp;&lt;<strong>h1</strong>&gt;Build Something
              Amazing&lt;/<strong>h1</strong>&gt;
            </div>
            <div>
              <em>8</em> &nbsp; &nbsp;&lt;<strong>p</strong>&gt;Ideas turn into
              reality.&lt;/<strong>p</strong>&gt;
            </div>
            <div>
              <em>9</em> &nbsp; &nbsp;&lt;<strong>button</strong>&gt;Get
              Started&lt;/<strong>button</strong>&gt;
            </div>
            <div>
              <em>10</em> &nbsp;&lt;/<strong>div</strong>&gt;
            </div>
            <div>
              <em>11</em> &nbsp;);
            </div>
            <div>
              <em>12</em>
              {"}"}
            </div>
          </div>
          <div className="ide-terminal">
            <span>Terminal &nbsp;&nbsp; Output &nbsp;&nbsp; Problems</span>
            <p>
              <i>➜</i> npm run dev
              <br />
              <span>PREVIEW</span> — open the workspace to run code
              <br />
              Existing DevHarbour workspace
            </p>
          </div>
        </div>
        <div className="ide-preview">
          <div className="preview-label">◫ &nbsp; Preview</div>
          <div className="preview-inner">
            <span>⌘ DevHarbour</span>
            <h3>
              Build
              <br />
              Something
              <br />
              <em>Amazing.</em>
            </h3>
            <p>Ideas turn into reality here.</p>
            <button onClick={() => navigate("work")}>Open workspace</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  useLayoutEffect(() => {
    document.getElementById("intro")?.setAttribute("data-homepage-ready", "true");
    const boot = document.getElementById("dh-homepage-boot");
    if (boot) boot.hidden = true;
  }, []);
  const { courses, projects, rankings, hackathon, roadmaps, errors } =
    useHomepageData();
  const paths = roadmaps.length ? roadmaps : referencePaths;
  const
    [project, setProject] = useState(1),
    [roadmap, setRoadmap] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  function moveCourse(n: number) {
    carousel.current?.scrollBy({
      left: n * 260,
      behavior: reduce ? "auto" : "smooth",
    });
  }
  return (
    <main id="top" onClick={handleNavigation}>
      <Navbar />
      <Hero
        courseCount={courses.length}
        projectCount={projects.filter((p) => p.id).length}
        rankingCount={rankings.length}
      />
      <div className="ticker">
        <span>✦ Learn with real course providers</span>
        <span>⌘ Build in your workspace</span>
        <span>★ Earn verified challenge XP</span>
        <span>
          ⚡ {hackathon.name} · {hackathon.status}
        </span>
      </div>
      {errors.length > 0 && (
        <p className="data-notice" role="status">
          Some live sections could not load: {errors.join(", ")}. Please refresh
          to retry.
        </p>
      )}
      <Competitions hackathon={hackathon} rankings={rankings} />
      <section className="courses-section light" id="courses">
        <div className="section-layout course-layout">
          <Reveal className="section-copy">
            <SectionTag>LEARN WITHOUT LIMITS</SectionTag>
            <h2>
              Courses for Every
              <br />
              Developer Journey
            </h2>
            <p>
              From fundamentals to advanced topics, learn with industry experts
              and hands-on projects.
            </p>
            <Pill href="/courses">Explore All Courses</Pill>
          </Reveal>
          <div className="course-pane">
            <div className="carousel-arrows">
              <button
                onClick={() => moveCourse(-1)}
                aria-label="Previous courses"
              >
                <ArrowLeft size={17} />
              </button>
              <button onClick={() => moveCourse(1)} aria-label="Next courses">
                <ArrowRight size={17} />
              </button>
            </div>
            <div className="course-carousel" ref={carousel}>
              {courses.map((c) => (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={"course-card " + c.class}
                  key={c.title}
                >
                  <div className="course-art">{c.icon}</div>
                  <span className="level">{c.level}</span>
                  <h3>{c.title}</h3>
                  <div className="course-bottom">
                    <span>
                      {c.meta}
                      <br />★ {c.rating}
                    </span>
                    <span className="round-arrow">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="projects-section" id="projects">
        <div className="section-layout projects-layout">
          <Reveal className="section-copy">
            <SectionTag>BUILD. SHOWCASE. GET DISCOVERED</SectionTag>
            <h2>
              Project <em>Gallery</em>
            </h2>
            <p>
              Explore amazing projects built by our community. Get inspired,
              contribute, and showcase your own work to the world.
            </p>
            <Pill href="/projects">Browse Projects</Pill>
          </Reveal>
          <div className="project-stage">
            <div
              className="project-mini"
              role="button"
              tabIndex={0}
              onClick={() => setProject(0)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setProject(0);
                }
              }}
            >
              <div className="mini-title">✳ &nbsp; {projects[0].name}</div>
              <p>{projects[0].kind}</p>
              <div className="tags">
                {projects[0].stack.map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
              <ProjectVisual items={projects} idx={0} small />
              <div className="mini-foot">
                <span>
                  <Heart size={13} /> {projects[0].heart}
                </span>
                <span>
                  <GitBranch size={13} /> {projects[0].stack.length} tools
                </span>
              </div>
            </div>
            <div className="phone-shell" aria-label="Selected project preview">
              <div className="phone-notch" />
              <ProjectVisual items={projects} idx={project} />
              <a
                className="project-open"
                href={projects[project]?.url || "#platform-projects"}
                target={projects[project]?.url ? "_blank" : undefined}
                rel="noopener noreferrer"
              >
                Open project ↗
              </a>
            </div>
            <div
              className="project-mini"
              role="button"
              tabIndex={0}
              onClick={() => setProject(2)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setProject(2);
                }
              }}
            >
              <div className="mini-title">▦ &nbsp; {projects[2].name}</div>
              <p>{projects[2].kind}</p>
              <div className="tags">
                {projects[2].stack.map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
              <ProjectVisual items={projects} idx={2} small />
              <div className="mini-foot">
                <span>
                  <Heart size={13} /> {projects[2].heart}
                </span>
                <span>
                  <GitBranch size={13} /> {projects[2].stack.length} tools
                </span>
              </div>
            </div>
            <div className="project-picker">
              {projects.map((p, i) => (
                <button
                  key={i}
                  className={project === i ? "active" : ""}
                  onClick={() => setProject(i)}
                  aria-label={"Preview " + p.name}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="roadmaps-section light" id="roadmaps">
        <div className="section-layout roadmap-layout">
          <Reveal className="section-copy">
            <SectionTag>A CLEAR PATH FOR YOUR GROWTH</SectionTag>
            <h2>
              Interactive
              <br />
              Learning Roadmaps
            </h2>
            <p>
              Follow structured paths, track your progress, and become job-ready
              with in-demand skills.
            </p>
            <Pill href="/courses">Explore Learning Paths</Pill>
          </Reveal>
          <div className="roadmap-diagram">
            <div className="route-node node-1">
              <span>❶</span>
              <div>
                <b title={paths[roadmap].nodes[0]}>{paths[roadmap].nodes[0]}</b>
                <small>Start here</small>
              </div>
            </div>
            <div className="route-node node-2">
              <span>⌘</span>
              <div>
                <b title={paths[roadmap].nodes[1]}>{paths[roadmap].nodes[1]}</b>
                <small>Build your base</small>
              </div>
            </div>
            <div className="route-node node-3">
              <span>✣</span>
              <div>
                <b title={paths[roadmap].nodes[2]}>{paths[roadmap].nodes[2]}</b>
                <small>Dig deeper</small>
              </div>
            </div>
            <div className="route-node node-4">
              <span>◇</span>
              <div>
                <b title={paths[roadmap].nodes[3]}>{paths[roadmap].nodes[3]}</b>
                <small>Keep growing</small>
              </div>
            </div>
            <div className="route-node node-5">
              <span>⌛</span>
              <div>
                <b title={paths[roadmap].nodes[4]}>{paths[roadmap].nodes[4]}</b>
                <small>Hands-on learning</small>
              </div>
            </div>
            <svg
              className="roadmap-lines"
              viewBox="0 0 500 320"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M115 85 C115 150 145 160 205 160 S270 160 270 160" />
              <path d="M300 160 C345 160 345 95 390 95" />
              <path d="M390 125 C390 200 350 215 312 215" />
              <path d="M270 220 C270 270 230 270 200 270" />
            </svg>
          </div>
          <div className="roadmap-list">
            <h3>Popular Roadmaps</h3>
            {paths.map((p, i) => (
              <button
                className={i === roadmap ? "selected" : ""}
                onClick={() => setRoadmap(i)}
                key={p.name}
              >
                <span style={{ color: p.color }}>⬡</span>
                <div>
                  <b>{p.name}</b>
                  <small>{p.sub}</small>
                </div>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="codespace-section" id="codespace">
        <div className="section-layout code-layout">
          <Reveal className="section-copy">
            <SectionTag>CODE. BUILD. EXPERIMENT.</SectionTag>
            <h2>
              Code<em>Space</em>
            </h2>
            <p>
              Preview the workspace, then open the existing editor and coding
              practice tools.
            </p>
            <ul className="code-benefits">
              <li>
                <Code2 />
                Existing code editor
              </li>
              <li>
                <Layers />
                Practice and experiment
              </li>
              <li>
                <Users />
                Save your workspace
              </li>
              <li>
                <Rocket />
                Practice coding challenges
              </li>
            </ul>
            <Pill href="/workspace">Launch CodeSpace</Pill>
          </Reveal>
          <CodeDemo />
        </div>
      </section>
      <section className="community-section light" id="community">
        <div className="section-layout community-layout">
          <Reveal className="section-copy">
            <SectionTag>A VIBRANT DEVELOPER COMMUNITY</SectionTag>
            <h2>
              Learn Together,
              <br />
              Grow Together
            </h2>
            <p>
              Join fellow developers, ask questions, share knowledge and build
              meaningful connections.
            </p>
            <Pill href="#join">Join Community</Pill>
          </Reveal>
          <div className="community-posts">
            <div className="post">
              <span className="avatar">⌘</span>
              <div>
                <b>Your developer community</b>
                <p>
                  Meet fellow builders in the existing DevHarbour community.
                  Discussions and posts are not yet available through a platform
                  API.
                </p>
                <a className="pill" href="/community">
                  Open Community <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>
          <div className="community-info">
            <div className="avatar-row">
              👩🏽 👨🏻 👩🏼 👨🏿 <span>Build together</span>
            </div>
            <h3>
              A global community
              <br />
              of builders
            </h3>
            <p>
              Connect, collaborate and grow with developers from around the
              world.
            </p>
            <ul>
              <li>Discussions & Q&A</li>
              <li>Project feedback</li>
              <li>Study groups</li>
              <li>Networking opportunities</li>
            </ul>
          </div>
        </div>
      </section>
      <section id="join" className="final-cta">
        <SectionTag>READY TO START YOUR JOURNEY?</SectionTag>
        <h2>
          Build Your Future with <em>DevHarbour</em>
        </h2>
        <p>Learn, build and grow alongside the DevHarbour community.</p>
        <div className="center-actions">
          <Pill href="#join">Get Started Free</Pill>
          <a className="border-button" href="/courses">
            Explore Platform
          </a>
        </div>
        <div className="footer-features">
          <span>♧ &nbsp; Hackathons</span>
          <span>▣ &nbsp; Courses</span>
          <span>▤ &nbsp; Projects</span>
          <span>⌘ &nbsp; Roadmaps</span>
          <span>❀ &nbsp; Community</span>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-cols">
          <div>
            <a className="logo" href="#top">
              <span className="logo-icon">⌘</span> DevHarbour
            </a>
            <p>
              A modern developer platform to learn,
              <br />
              build, compete and grow together.
            </p>
            <div className="socials">
              <a
                href="https://github.com/RujulaSharma/devharbour.in"
                aria-label="GitHub"
              >
                <Github size={15} />
              </a>
              <a
                href="https://www.linkedin.com/company/devharbour/"
                aria-label="LinkedIn"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="https://www.instagram.com/devharbour.official"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
            </div>
          </div>
          <div>
            <b>Platform</b>
            <a href="/hackathons">Hackathons</a>
            <a href="/courses">Courses</a>
            <a href="/projects">Projects</a>
            <a href="/roadmaps">Roadmaps</a>
            <a href="/community">Community</a>
          </div>
          <div>
            <b>Resources</b>
            <a href="/courses">Learning resources</a>
            <a href="/workspace">Workspace</a>
            <a href="/community">Community</a>
            <a href="/projects">Projects</a>
            <a href="/community">Connect</a>
          </div>
          <div>
            <b>Company</b>
            <span className="unavailable">About · coming soon</span>
            <span className="unavailable">Contact · coming soon</span>
            <span className="unavailable">Privacy Policy · coming soon</span>
            <span className="unavailable">Terms of Service · coming soon</span>
          </div>
          <div className="subscribe">
            <b>Subscribe</b>
            <p>
              Get the latest updates, hackathons
              <br />
              and new courses.
            </p>
            <a
              className="pill"
              href="https://chat.whatsapp.com/Dt87L7lU5SOBSfKDKuNS8s"
              target="_blank"
              rel="noopener noreferrer"
            >
              Community updates <ArrowUpRight size={16} />
            </a>
            <small>Newsletter signup is not available yet.</small>
          </div>
        </div>
        <div className="footer-base">
          <span>© 2026 DevHarbour. All rights reserved.</span>
          <b>DEVHARBOUR</b>
          <span>Build · Learn · Grow · Belong — Together.</span>
        </div>
      </footer>
    </main>
  );
}
