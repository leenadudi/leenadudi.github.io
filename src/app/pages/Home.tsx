/** Home: name, one line, the loop drawing, and an index of the five sections. */
import { Link } from "react-router";
import { EMAIL, SECTIONS } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { CREAM, FONT_BODY, FONT_DISPLAY, INK, LINE, MUTED, STRIPE } from "../lib/tokens";
import { phase1Path, SW } from "../Ride";
import { Container } from "../components/Layout";

export default function Home() {
  const narrow = useNarrow();
  return (
    <>
      <header style={{ padding: narrow ? "2.5rem 0 1rem" : "clamp(3rem, 7vw, 5.5rem) 0 1rem" }}>
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
                I study computer science and engineering at MIT, class of 2029. I build software, machine learning systems, and the data behind them.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem 1.25rem", marginTop: "1.75rem" }}>
                <a href={`mailto:${EMAIL}`} style={{
                  fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.9rem", color: CREAM, background: INK,
                  padding: "0.65rem 1.2rem", borderRadius: 99, textDecoration: "none",
                }}>
                  {EMAIL}
                </a>
                {!narrow && (
                  <Link to="/ride" style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: "0.9rem", color: MUTED, textDecoration: "none" }}>
                    take the ride →
                  </Link>
                )}
              </div>
            </div>
            {!narrow && <LoopArt />}
          </div>
        </Container>
      </header>

      {/* Section index */}
      <Container style={{ paddingTop: narrow ? "1.5rem" : "2.5rem" }}>
        <nav aria-label="sections" style={{ display: "flex", flexDirection: "column" }}>
          {SECTIONS.map((s, i) => (
            <Link key={s.id} to={`/${s.id}`} className="index-row" style={{
              display: "grid", gridTemplateColumns: narrow ? "8px 1fr auto" : "8px minmax(180px, 0.55fr) 1fr auto",
              alignItems: "center", gap: narrow ? "1rem" : "1.5rem",
              padding: narrow ? "1.1rem 0" : "1.35rem 0",
              borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
              color: INK, textDecoration: "none",
            }}>
              <span aria-hidden style={{ width: 8, height: narrow ? 34 : 40, borderRadius: 4, background: s.color }} />
              <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: narrow ? "1.25rem" : "clamp(1.3rem, 2.2vw, 1.7rem)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {s.title}
                {narrow && <span style={{ display: "block", fontWeight: 400, fontSize: "0.85rem", color: MUTED, marginTop: "0.3rem", letterSpacing: 0 }}>{s.teaser}</span>}
              </span>
              {!narrow && <span style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: MUTED }}>{s.teaser}</span>}
              <span aria-hidden className="index-arrow" style={{ fontFamily: FONT_BODY, fontSize: "1.2rem", color: INK, opacity: 0.6 }}>→</span>
            </Link>
          ))}
        </nav>
      </Container>
    </>
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
