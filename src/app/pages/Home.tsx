/** Home: the name, and the five sections in big type. The page ribbon comes in
 *  from the left, loops beside the name, and then fans out so each strand
 *  underlines its own section. */
import { Link } from "react-router";
import { EMAIL, SECTIONS } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { CREAM, FONT_BODY, FONT_DISPLAY, INK, MUTED, STRIPE } from "../lib/tokens";
import { Container } from "../components/Layout";

export default function Home() {
  const narrow = useNarrow();
  return (
    <>
      <header data-rb="hero" style={{ padding: narrow ? "2.5rem 0 0" : "clamp(3rem, 7vw, 5.5rem) 0 0" }}>
        <Container>
          <div style={{
            display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0, 1.1fr) minmax(0, 1fr)",
            gap: narrow ? "2rem" : "4rem", alignItems: "center",
          }}>
            <div>
              <h1 style={{
                fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 200,
                fontSize: "clamp(3rem, 7vw, 5.4rem)", letterSpacing: "-0.035em", lineHeight: 0.95, whiteSpace: "nowrap",
                margin: 0, color: INK,
              }}>
                leena dudi
              </h1>
              <div aria-hidden style={{ height: 4, width: "min(100%, 22rem)", background: STRIPE, borderRadius: 2, margin: "1.25rem 0 1.4rem" }} />
              <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.6, color: INK }}>
                computer science and engineering at MIT, class of 2029
              </p>
              <div data-rb="hero-cta" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem 1.25rem", marginTop: "1.6rem" }}>
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
            {!narrow && <div data-rb="hero-loop" aria-hidden style={{ aspectRatio: "620 / 380", width: "100%" }} />}
          </div>
        </Container>
      </header>

      {/* Section index: each strand of the ribbon lands under its own title */}
      <Container style={{ paddingTop: "11rem", paddingBottom: narrow ? "1rem" : "3rem" }}>
        <nav aria-label="sections" data-rb="index" style={{ display: "flex", flexDirection: "column", gap: narrow ? "1.6rem" : "2.1rem", paddingLeft: narrow ? "3.5rem" : 0 }}>
          {SECTIONS.map((s) => (
            <Link key={s.id} to={`/${s.id}`} className="index-row" style={{ color: INK, textDecoration: "none", alignSelf: "flex-start" }}>
              <span data-rb="row" style={{
                display: "inline-flex", alignItems: "baseline", gap: "0.9rem",
                fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 200,
                fontSize: narrow ? "clamp(2.2rem, 10vw, 2.8rem)" : "clamp(2.6rem, 4.6vw, 3.8rem)",
                letterSpacing: "-0.03em", lineHeight: 1,
              }}>
                {s.title}
                <span aria-hidden className="index-arrow" style={{ fontFamily: FONT_BODY, fontStyle: "normal", fontWeight: 400, fontSize: "0.5em", opacity: 0.55 }}>→</span>
              </span>
            </Link>
          ))}
        </nav>
      </Container>
    </>
  );
}
