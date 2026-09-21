/**
 * The main page: cream canvas, one content column, the five section colours
 * used as accents. Desktop visitors can still "take the ride" (#ride).
 */
import { useEffect } from "react";
import { EMAIL, GITHUB, LINKEDIN, SECTIONS, SECTION_CONTENT } from "./content";
import { useNarrow } from "./hooks/useMediaQuery";
import { rgba } from "./lib/color";
import { CREAM, FONT_BODY, FONT_DISPLAY, INK, LINE, MUTED, STRIPE } from "./lib/tokens";
import { phase1Path, SW } from "./Ride";
import { Container, Section } from "./components/ui";
import ExperienceCards from "./components/ExperienceCards";
import ProjectCards from "./components/ProjectCards";
import SchoolBlock from "./components/SchoolBlock";
import HobbiesSection from "./components/HobbiesSection";

const byId = Object.fromEntries(SECTIONS.map((s, i) => [s.id, { ...s, items: SECTION_CONTENT[i].items }]));

export default function Site() {
  const narrow = useNarrow();

  // Arriving from the ride (or a shared #section link): scroll to the section.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && id !== "ride") {
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    }
  }, []);

  return (
    <div style={{ background: CREAM, color: INK, minHeight: "100dvh", fontFamily: FONT_BODY }}>
      <Nav narrow={narrow} />
      <main>
        <Hero narrow={narrow} />

        <Section id="experience" title="experience" color={byId.experience.color}>
          <ExperienceCards items={byId.experience.items} color={byId.experience.color} />
        </Section>

        <Section id="projects" title="projects" color={byId.projects.color}>
          <ProjectCards items={byId.projects.items} color={byId.projects.color} />
        </Section>

        <Section id="school" title="school" color={byId.school.color}>
          <SchoolBlock items={byId.school.items} color={byId.school.color} />
        </Section>

        <Section id="service" title="service" color={byId.service.color}>
          <ExperienceCards items={byId.service.items} color={byId.service.color} />
        </Section>

        <Section id="hobbies" title="hobbies" color={byId.hobbies.color}>
          <HobbiesSection color={byId.hobbies.color} />
        </Section>
      </main>
      <Footer narrow={narrow} />
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ narrow }: { narrow: boolean }) {
  const link: React.CSSProperties = {
    fontFamily: FONT_BODY, fontSize: "0.86rem", fontWeight: 500, color: INK, textDecoration: "none", opacity: 0.8,
  };
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: rgba(CREAM, 0.85), backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      borderBottom: `1px solid ${LINE}`,
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <Container style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{ fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 400, fontSize: "1.05rem", color: INK, textDecoration: "none", letterSpacing: "-0.02em" }}>
          leena dudi
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: narrow ? "0.9rem" : "1.4rem" }}>
          {!narrow && SECTIONS.map(s => <a key={s.id} href={`#${s.id}`} style={link}>{s.title}</a>)}
          {!narrow && <span aria-hidden style={{ width: 1, height: 16, background: LINE }} />}
          <a href={`mailto:${EMAIL}`} style={link}>email</a>
          <a href={GITHUB} target="_blank" rel="noreferrer" style={link}>github</a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer" style={link}>linkedin</a>
        </div>
      </Container>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ narrow }: { narrow: boolean }) {
  return (
    <header style={{ padding: narrow ? "3rem 0 1rem" : "clamp(3.5rem, 8vw, 6rem) 0 1.5rem" }}>
      <Container>
        <div style={{
          display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: narrow ? "2rem" : "3rem", alignItems: "center",
        }}>
          <div>
            <h1 style={{
              fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 200,
              fontSize: "clamp(3rem, 7vw, 5.4rem)", letterSpacing: "-0.035em", lineHeight: 0.95, whiteSpace: "nowrap",
              margin: 0, color: INK,
            }}>
              leena dudi
            </h1>
            <div aria-hidden style={{ height: 4, width: "min(100%, 22rem)", background: STRIPE, borderRadius: 2, margin: "1.25rem 0 1.5rem" }} />
            <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.6, color: INK, maxWidth: "34ch" }}>
              I study computer science and physics at MIT, class of 2029. I build software, machine learning systems, and the data behind them.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem 1.25rem", marginTop: "1.75rem" }}>
              <a href={`mailto:${EMAIL}`} style={{
                fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.9rem", color: CREAM, background: INK,
                padding: "0.65rem 1.2rem", borderRadius: 99, textDecoration: "none",
              }}>
                {EMAIL}
              </a>
              <a href="#experience" style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.9rem", color: INK, textDecoration: "none", opacity: 0.8 }}>
                see my work ↓
              </a>
              {!narrow && (
                <a href="#ride" style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: "0.9rem", color: MUTED, textDecoration: "none" }}>
                  or take the ride →
                </a>
              )}
            </div>
          </div>
          {!narrow && <LoopArt />}
        </div>
      </Container>
    </header>
  );
}

/** Static drawing of the ride's loop tower in the five colours. */
function LoopArt() {
  const pad = { x: 0, y: 0 };
  return (
    <svg viewBox="400 0 620 380" aria-hidden style={{ width: "100%", height: "auto", display: "block", overflow: "hidden" }}>
      {SECTIONS.map((s, i) => (
        <path key={s.id} d={phase1Path(i, pad)} stroke={s.color} strokeWidth={SW}
          fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer({ narrow }: { narrow: boolean }) {
  const link: React.CSSProperties = { fontFamily: FONT_BODY, fontSize: "0.85rem", color: INK, textDecoration: "none", opacity: 0.8 };
  return (
    <footer style={{ marginTop: "clamp(3rem, 7vw, 5.5rem)", borderTop: `1px solid ${LINE}` }}>
      <div aria-hidden style={{ height: 3, background: STRIPE }} />
      <Container style={{
        padding: `1.5rem clamp(1.25rem, 5vw, 3rem) calc(1.5rem + env(safe-area-inset-bottom, 0px))`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem 1.5rem",
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontStyle: "italic", fontSize: "0.95rem", color: MUTED }}>leena dudi</span>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <a href={`mailto:${EMAIL}`} style={link}>{EMAIL}</a>
          <a href={GITHUB} target="_blank" rel="noreferrer" style={link}>github</a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer" style={link}>linkedin</a>
          {!narrow && <a href="#ride" style={{ ...link, color: MUTED }}>take the ride →</a>}
        </div>
      </Container>
    </footer>
  );
}
