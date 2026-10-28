import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { BookOpen, Code2, Users, Trophy, Play } from "lucide-react";
import { Pill, SectionTag } from "./ui";
type Slide = {
  tag: string;
  title: string;
  accent: string;
  desc: string;
  button: string;
};
const slides: Slide[] = [
  {
    tag: "BUILD · LEARN · GROW · TOGETHER",
    title: "Your Developer Journey, All in One",
    accent: "Harbour.",
    desc: "Join a modern developer platform to learn, build, compete and grow. Hackathons, courses, projects, roadmaps and a vibrant community — everything you need, in one place.",
    button: "Get Started Free",
  },
  {
    tag: "TURN YOUR IDEAS INTO REALITY",
    title: "Dream It. Code It. Launch",
    accent: "Something Great.",
    desc: "From your first line of code to the projects you are proud to share. Find the tools and inspiration to keep building.",
    button: "Explore Projects",
  },
  {
    tag: "YOUR PEOPLE. YOUR POTENTIAL.",
    title: "Build More When We Build",
    accent: "Together.",
    desc: "Discover hackathons, find teammates and join a community of developers shaping what comes next.",
    button: "Join Community",
  },
];
function Laptop({ slide }: { slide: number }) {
  const content = [
    {
      lines: ["Code", "Learn", "Build", "Belong"],
      chips: [
        ["Live Hackathons", "Build. Compete. Win."],
        ["Structured Courses", "From basic to pro."],
        ["Active Community", "Learn together."],
        ["Real Projects", "Build your portfolio."],
      ],
    },
    {
      lines: ["Dream", "Code", "Create", "Launch"],
      chips: [
        ["CodeSpace", "Write. Run. Ship."],
        ["Learning Paths", "Your next big skill."],
        ["Project Gallery", "Show what you build."],
        ["Build Challenges", "Practice by doing."],
      ],
    },
    {
      lines: ["Meet", "Team Up", "Compete", "Grow"],
      chips: [
        ["Find Teammates", "Build together."],
        ["Hackathon Events", "Bring ideas to life."],
        ["Developer Network", "Meet your people."],
        ["Community Wins", "Celebrate every launch."],
      ],
    },
  ][slide];
  const icons = [Trophy, BookOpen, Users, Code2];
  return (
    <div className={"hero-laptop laptop-variant-" + slide}>
      <div className="hero-laptop-screen">
        <div className="laptop-notch" />
        <div className="laptop-screen-content">
          {content.lines.map((line) => (
            <span key={line}>│ {line}</span>
          ))}
        </div>
        <div className="laptop-glow" />
      </div>
      <div className="laptop-base" />
      <div className="laptop-shadow" />
      {content.chips.map(([heading, sub], i) => {
        const Icon = icons[i];
        return (
          <div
            key={heading}
            className={"float-chip chip-" + ["a", "b", "c", "d"][i]}
          >
            <Icon size={22} />
            <div>
              <b>{heading}</b>
              <small>{sub}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Hero({
  courseCount,
  projectCount,
  rankingCount,
}: {
  courseCount: number;
  projectCount: number;
  rankingCount: number;
}) {
  const [slide, setSlide] = useState(0);
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [heroPhase, setHeroPhase] = useState<"idle" | "exit" | "enter">("idle");
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changing = useRef(false);
  const slideRef = useRef(0);
  function changeHero(next: number) {
    if (next === slideRef.current || changing.current) return;
    if (reduce) {
      slideRef.current = next;
      setSlide(next);
      return;
    }
    changing.current = true;
    setHeroPhase("exit");
    transitionTimer.current = setTimeout(() => {
      // The previous scene has completely left before swapping content.
      slideRef.current = next;
      setSlide(next);
      setHeroPhase("enter");
      revealTimer.current = setTimeout(() => {
        setHeroPhase("idle");
        changing.current = false;
      }, 700);
    }, 340);
  }
  useEffect(() => {
    if (reduce || paused) return;
    const interval = setInterval(() => {
      if (!changing.current) changeHero((slideRef.current + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [reduce, paused]);
  useEffect(
    () => () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    },
    [],
  );

  const active = slides[slide];
  return (
    <section className="hero" aria-label="DevHarbour highlights">
      <div className="hero-content">
        <div className="hero-copy-stage">
          <div className={"hero-copy-frame hero-scene hero-scene-" + heroPhase}>
            <div className="hero-copy">
              <SectionTag>{active.tag}</SectionTag>
              <h1>
                {active.title}
                <br />
                <em>{active.accent}</em>
              </h1>
              <p>{active.desc}</p>
              <div className="hero-buttons">
                <Pill
                  href={
                    slide === 1
                      ? "#projects"
                      : slide === 2
                        ? "#community"
                        : "#join"
                  }
                >
                  {active.button}
                </Pill>
                <a className="watch-link" href="#codespace">
                  <span>
                    <Play size={14} />
                  </span>{" "}
                  Watch Demo
                </a>
              </div>
            </div>
            <div className="hero-stats">
              <div>
                <b>{courseCount}</b>
                <span>Courses</span>
              </div>
              <div>
                <b>{projectCount}</b>
                <span>Featured projects</span>
              </div>
              <div>
                <b>{rankingCount}</b>
                <span>Ranked developers</span>
              </div>
              <div>
                <b>01</b>
                <span>Featured event</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-dots" aria-label="Hero slides">
          {slides.map((s, i) => (
            <button
              key={i}
              className={slide === i ? "active" : ""}
              aria-label={"Show slide " + (i + 1)}
              aria-current={slide === i ? "true" : undefined}
              onClick={() => changeHero(i)}
            />
          ))}
          <button
            className="hero-pause"
            aria-label={
              paused ? "Resume hero animation" : "Pause hero animation"
            }
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>
      <div className="hero-art">
        <div className={"hero-art-slide hero-scene hero-scene-" + heroPhase}>
          <Laptop slide={slide} />
        </div>
      </div>
    </section>
  );
}
