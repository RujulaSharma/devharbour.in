import {
  ArrowUpRight,
  Globe2,
  Users,
  Trophy,
  Sparkles,
  Check,
} from "lucide-react";
import { Reveal } from "./ui";
import type { useHomepageData } from "./platform";
export default function Competitions({
  hackathon,
  rankings,
}: Pick<ReturnType<typeof useHomepageData>, "hackathon" | "rankings">) {
  return (
    <section className="hack-section challenge-hub" id="hackathons">
      <div className="challenge-frame">
        <div className="challenge-heading">
          <div>
            <span className="challenge-eyebrow">
              DEVHARBOUR / COMPETE & PRACTICE
            </span>
            <h2>
              Make your mark. <em>Level up.</em>
            </h2>
            <p>
              Build with a team, sharpen your skills, and celebrate every
              milestone.
            </p>
          </div>
          <span className="challenge-header-number">01 — CHALLENGES</span>
        </div>
        <div className="challenge-grid">
          <Reveal className="challenge-event">
            <div className="challenge-event-glow" />
            <div className="challenge-event-top">
              <span className="challenge-kicker">
                <span className="live-dot" /> FEATURED HACKATHON
              </span>
              <span className="challenge-event-index">01 / EVENTS</span>
            </div>
            <div className="challenge-event-body">
              <div className="challenge-event-copy">
                <span className="challenge-small">
                  CREATE SOMETHING EXTRAORDINARY
                </span>
                <h3>{hackathon.name}</h3>
                <p>{hackathon.desc}</p>
                <div className="challenge-pills">
                  <span>
                    <Globe2 size={14} /> {hackathon.status}
                  </span>
                  <span>
                    <Users size={14} /> Existing featured event
                  </span>
                </div>
                <a className="challenge-action" href="#platform-hack">
                  Explore Hackathons <ArrowUpRight size={17} />
                </a>
              </div>
              <div className="challenge-orb-wrap">
                <div className="challenge-orb" />
                <div className="challenge-orb-ring" />
                <span className="challenge-orb-star">✳</span>
                <span className="challenge-orb-caption">
                  BUILD / COMPETE / WIN
                </span>
              </div>
            </div>
            <div className="challenge-event-foot">
              <span>✦ Discover challenges</span>
              <span>⌘ Build with others</span>
              <span>↗ Ship real projects</span>
            </div>
          </Reveal>
          <Reveal className="challenge-leaderboard">
            <div className="challenge-side-head">
              <span>
                <Trophy size={16} /> HALL OF FAME
              </span>
              <span className="challenge-side-issue">TOP BUILDERS</span>
            </div>
            <h3>
              Leaderboard<span>.</span>
            </h3>
            <p className="challenge-side-intro">
              A spotlight for the creators who go further.
            </p>
            <div className="leaderboard-lines">
              {rankings.slice(0, 3).map((person, i) => (
                <div
                  className={"leader-row " + (i === 0 ? "first" : "")}
                  key={person.userId}
                >
                  <span className="leader-rank">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leader-avatar">
                    {person.username.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <strong>{person.fullName || person.username}</strong>
                    <small>{person.challengesSolved} challenges solved</small>
                  </div>
                  <span className="leader-medal">{person.xp} XP</span>
                </div>
              ))}
              {!rankings.length && <p>Rankings unavailable.</p>}
            </div>
            <div className="leaderboard-foot">
              <span className="live-dot" /> Verified platform XP rankings{" "}
              <ArrowUpRight size={16} />
            </div>
          </Reveal>
          <Reveal className="challenge-dsa">
            <div className="dsa-top">
              <span className="challenge-kicker">⌘ DAILY CODING PRACTICE</span>
              <span className="dsa-label">02 / PRACTICE</span>
            </div>
            <div className="dsa-layout">
              <div className="dsa-copy">
                <span className="challenge-small">ONE PROBLEM AT A TIME</span>
                <h3>
                  Train your mind.
                  <br />
                  <em>Master DSA.</em>
                </h3>
                <p>
                  Sharpen problem-solving with arrays, strings, trees, graphs
                  and more. Practice consistently. Grow confidently.
                </p>
                <a href="#platform-practice" className="dsa-cta">
                  Explore DSA Practice <ArrowUpRight size={17} />
                </a>
              </div>
              <div className="dsa-code-card">
                <div className="dsa-code-top">
                  <span className="dsa-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>challenge.js</span>
                  <span>● PRACTICE</span>
                </div>
                <div className="dsa-code-content">
                  <span>
                    01 &nbsp; <b>function</b> twoSum(nums, target) {"{"}
                  </span>
                  <span>
                    02 &nbsp;&nbsp; <b>const</b> seen = <em>new Map</em>();
                  </span>
                  <span>
                    03 &nbsp;&nbsp; <b>for</b> (let i = 0; i &lt; nums.length;
                    i++) {"{"}
                  </span>
                  <span>
                    04 &nbsp;&nbsp;&nbsp; <b>if</b> (seen.has(target - nums[i]))
                  </span>
                  <span>
                    05 &nbsp;&nbsp;&nbsp;&nbsp; <em>return</em> [seen.get(target
                    - nums[i]), i];
                  </span>
                  <span>06 &nbsp;&nbsp; {"}"}</span>
                  <span>07 &nbsp; {"}"}</span>
                </div>
                <div className="dsa-code-bottom">
                  <span>
                    <Check size={13} /> Sample challenge
                  </span>
                  <span>JavaScript</span>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal className="challenge-progress">
            <div className="challenge-side-head">
              <span>
                <Sparkles size={16} /> YOUR NEXT STEP
              </span>
              <span className="challenge-side-issue">PRACTICE</span>
            </div>
            <h3>
              Keep the
              <br />
              <em>momentum.</em>
            </h3>
            <p className="challenge-side-intro">
              Small wins become serious skills. Start with a challenge today.
            </p>
            <div className="practice-preview">
              <div>
                <span className="practice-circle">01</span>
                <div>
                  <strong>Start with arrays</strong>
                  <small>Beginner · Problem solving</small>
                </div>
                <ArrowUpRight size={17} />
              </div>
              <div>
                <span className="practice-circle">02</span>
                <div>
                  <strong>Explore strings</strong>
                  <small>Beginner · Fundamentals</small>
                </div>
                <ArrowUpRight size={17} />
              </div>
            </div>
            <a href="#platform-work" className="practice-link">
              Open CodeSpace <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
