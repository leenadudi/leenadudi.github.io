/** Shared page chrome: sticky nav, content column, footer with the line band. */
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { EMAIL, GITHUB, LINKEDIN, SECTIONS } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { rgba } from "../lib/color";
import { CONTAINER, CREAM, FONT_BODY, FONT_DISPLAY, GUTTER, INK, LINE, MUTED } from "../lib/tokens";
import { LineBand } from "./Ribbon";

export function Container({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ maxWidth: CONTAINER, margin: "0 auto", padding: `0 ${GUTTER}`, ...style }}>
      {children}
    </div>
  );
}

/** Root layout for every route except the ride. */
export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div style={{ background: CREAM, color: INK, minHeight: "100dvh", fontFamily: FONT_BODY, display: "flex", flexDirection: "column" }}>
      <Nav />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  const narrow = useNarrow();
  const link: CSSProperties = {
    fontFamily: FONT_BODY, fontSize: "0.86rem", fontWeight: 500, color: INK, textDecoration: "none",
    opacity: 0.8, paddingBottom: 3, borderBottom: "2px solid transparent", whiteSpace: "nowrap",
  };
  const sectionLinks = SECTIONS.map(s => (
    <NavLink key={s.id} to={`/${s.id}`} style={({ isActive }) => ({
      ...link, opacity: isActive ? 1 : 0.8, borderBottomColor: isActive ? s.color : "transparent",
    })}>
      {s.title}
    </NavLink>
  ));
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: rgba(CREAM, 0.88), backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      borderBottom: `1px solid ${LINE}`, paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <Container style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <Link to="/" style={{ fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 400, fontSize: "1.05rem", color: INK, textDecoration: "none", letterSpacing: "-0.02em" }}>
          leena dudi
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: narrow ? "0.9rem" : "1.4rem" }}>
          {!narrow && sectionLinks}
          {!narrow && <span aria-hidden style={{ width: 1, height: 16, background: LINE }} />}
          <a href={`mailto:${EMAIL}`} style={link}>email</a>
          <a href={GITHUB} target="_blank" rel="noreferrer" style={link}>github</a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer" style={link}>linkedin</a>
        </div>
      </Container>
      {narrow && (
        <div style={{ overflowX: "auto", scrollbarWidth: "none", borderTop: `1px solid ${LINE}` }}>
          <div style={{ display: "flex", gap: "1.2rem", padding: `0.55rem ${GUTTER}`, width: "max-content" }}>
            {sectionLinks}
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  const narrow = useNarrow();
  const link: CSSProperties = { fontFamily: FONT_BODY, fontSize: "0.85rem", color: INK, textDecoration: "none", opacity: 0.8 };
  return (
    <footer style={{ marginTop: "clamp(3rem, 7vw, 5.5rem)" }}>
      <Container style={{
        padding: `1.5rem ${GUTTER} calc(1.5rem + env(safe-area-inset-bottom, 0px))`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem 1.5rem",
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontStyle: "italic", fontSize: "0.95rem", color: MUTED }}>leena dudi</span>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <a href={`mailto:${EMAIL}`} style={link}>{EMAIL}</a>
          <a href={GITHUB} target="_blank" rel="noreferrer" style={link}>github</a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer" style={link}>linkedin</a>
          {!narrow && <Link to="/ride" style={{ ...link, color: MUTED }}>take the ride →</Link>}
        </div>
      </Container>
      <LineBand />
    </footer>
  );
}

/** Small tinted label: skills, tags, awards. */
export function Chip({ children, color, strong }: { children: ReactNode; color: string; strong?: boolean }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 99,
      fontFamily: FONT_BODY, fontWeight: 500, fontSize: "0.74rem", letterSpacing: "0.01em",
      color: INK, background: rgba(color, strong ? 0.55 : 0.28), lineHeight: 1.5, whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

/** Text link with an arrow, for "live site", "paper", "slides". */
export function ArrowLink({ href, children, onClick }: { href?: string; children: ReactNode; onClick?: () => void }) {
  const style: CSSProperties = {
    fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.85rem", color: INK, textDecoration: "none",
    background: "none", border: "none", borderBottom: `1.5px solid ${rgba(INK, 0.35)}`,
    cursor: "pointer", padding: 0, paddingBottom: 1,
  };
  if (href) return <a href={href} target="_blank" rel="noreferrer" style={style}>{children} ↗</a>;
  return <button type="button" onClick={onClick} style={style}>{children}</button>;
}

/** Bullet list with a short coloured tick as the marker. */
export function Bullets({ items, color, size = "0.93rem" }: { items: string[]; color: string; size?: string }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {items.map((b, j) => (
        <li key={j} style={{ display: "flex", gap: "0.6rem", fontFamily: FONT_BODY, fontSize: size, lineHeight: 1.6, color: INK }}>
          <span aria-hidden style={{ width: 10, height: 2, borderRadius: 1, background: color, flexShrink: 0, marginTop: "0.78em" }} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

/** Page title block used by every section page. */
export function PageTitle({ title, lede }: { title: string; lede?: string }) {
  return (
    <Container style={{ paddingTop: "clamp(2rem, 5vw, 3.5rem)", paddingBottom: "0.5rem" }}>
      <h1 style={{
        fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 200,
        fontSize: "clamp(2.6rem, 6vw, 4.4rem)", letterSpacing: "-0.03em", lineHeight: 1, margin: 0, color: INK,
      }}>
        {title}
      </h1>
      {lede && (
        <p style={{ margin: "1rem 0 0", fontFamily: FONT_BODY, fontSize: "clamp(0.98rem, 1.5vw, 1.1rem)", lineHeight: 1.6, color: MUTED, maxWidth: "58ch" }}>
          {lede}
        </p>
      )}
    </Container>
  );
}
