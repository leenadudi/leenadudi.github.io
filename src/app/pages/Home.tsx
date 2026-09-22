/** Home: the name, one line, email, and the ribbon drawing beside the name. */
import { Link } from "react-router";
import { EMAIL } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { CREAM, FONT_BODY, FONT_DISPLAY, INK, MUTED, STRIPE } from "../lib/tokens";
import { Container } from "../components/Layout";

export default function Home() {
  const narrow = useNarrow();
  return (
    <>
      <header data-rb="hero" style={{ padding: narrow ? "2.5rem 0 9rem" : "clamp(4rem, 9vw, 7rem) 0 4rem", minHeight: narrow ? undefined : "calc(100dvh - 56px - 8rem)" }}>
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

    </>
  );
}
