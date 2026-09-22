/** Home: the name, one line, email, and the ride's opening drawing, which
 *  draws itself in when the page loads. */
import { Link } from "react-router";
import { EMAIL, SECTIONS } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { CREAM, FONT_BODY, FONT_DISPLAY, INK, MUTED, STRIPE } from "../lib/tokens";
import { phase1Path, SW } from "../Ride";
import { Container } from "../components/Layout";

export default function Home() {
  const narrow = useNarrow();
  return (
    <header style={{
      padding: narrow ? "2.5rem 0 1rem" : "clamp(3rem, 8vw, 6rem) 0 2rem",
      minHeight: narrow ? undefined : "calc(100dvh - 56px - 8rem)",
      display: "flex", alignItems: "center",
    }}>
      <Container style={{ width: "100%" }}>
        <div style={{
          display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0, 1fr) minmax(0, 1.15fr)",
          gap: narrow ? "2.5rem" : "4rem", alignItems: "center",
        }}>
          <div>
            <h1 style={{
              fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 200,
              fontSize: "clamp(3rem, 6.5vw, 5.2rem)", letterSpacing: "-0.035em", lineHeight: 0.95, whiteSpace: "nowrap",
              margin: 0, color: INK,
            }}>
              leena dudi
            </h1>
            <div aria-hidden style={{ height: 4, width: "min(100%, 22rem)", background: STRIPE, borderRadius: 2, margin: "1.25rem 0 1.4rem" }} />
            <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.6, color: INK }}>
              computer science and engineering at MIT, class of 2029
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem 1.25rem", marginTop: "1.6rem" }}>
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
          <LoopArt />
        </div>
      </Container>
    </header>
  );
}

/** The ride's opening move: five strands sweep up into a loop tower and drop
 *  off the right. Each strand draws itself in on load (stroke reveal). */
function LoopArt() {
  const pad = { x: 0, y: 0 };
  return (
    <svg viewBox="380 -20 660 420" aria-hidden
      style={{ width: "100%", height: "auto", display: "block", overflow: "hidden" }}>
      {SECTIONS.map((s, i) => (
        <path key={s.id} className="draw-in" d={phase1Path(i, pad)} stroke={s.color} strokeWidth={SW}
          pathLength={1} fill="none" strokeLinecap="round" strokeLinejoin="round"
          style={{ animationDelay: `${0.15 + i * 0.09}s` }} />
      ))}
    </svg>
  );
}
