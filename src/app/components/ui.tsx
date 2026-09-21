import type { ReactNode, CSSProperties } from "react";
import { rgba } from "../lib/color";
import { CARD, CONTAINER, FONT_BODY, GUTTER, INK, LINE, MUTED, RADIUS } from "../lib/tokens";

/** Centered content column with side gutters. */
export function Container({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ maxWidth: CONTAINER, margin: "0 auto", padding: `0 ${GUTTER}`, ...style }}>
      {children}
    </div>
  );
}

/** Section wrapper: anchor id, heading with the section's colour mark. */
export function Section({ id, title, color, children, lede }: {
  id: string; title: string; color: string; lede?: string; children: ReactNode;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: 80, padding: "clamp(3rem, 7vw, 5.5rem) 0 0" }}>
      <Container>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: lede ? "0.5rem" : "1.5rem" }}>
          <span aria-hidden style={{ width: 14, height: 14, borderRadius: 4, background: color, flexShrink: 0 }} />
          <h2 style={{
            fontFamily: FONT_BODY, fontWeight: 600, fontSize: "clamp(1.5rem, 2.6vw, 2rem)",
            letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0, color: INK,
          }}>
            {title}
          </h2>
        </div>
        {lede && (
          <p style={{ margin: "0 0 1.5rem", color: MUTED, fontSize: "0.98rem", lineHeight: 1.6, maxWidth: "62ch", fontFamily: FONT_BODY }}>
            {lede}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}

/** Small tinted label: skills, tags, awards. */
export function Chip({ children, color, strong }: { children: ReactNode; color: string; strong?: boolean }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 99,
      fontFamily: FONT_BODY, fontWeight: 500, fontSize: "0.74rem", letterSpacing: "0.01em",
      color: INK, background: rgba(color, strong ? 0.55 : 0.28), lineHeight: 1.5,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

/** Bordered card on the cream canvas with a coloured top edge. */
export function Card({ children, color, style }: { children: ReactNode; color: string; style?: CSSProperties }) {
  return (
    <article style={{
      background: CARD, border: `1px solid ${LINE}`, borderTop: `3px solid ${color}`,
      borderRadius: RADIUS, padding: "1.15rem 1.25rem 1.25rem",
      display: "flex", flexDirection: "column", minWidth: 0, ...style,
    }}>
      {children}
    </article>
  );
}

/** Text link with an arrow, for "live site", "paper", "slides". */
export function ArrowLink({ href, children, onClick }: { href?: string; children: ReactNode; onClick?: () => void }) {
  const style: CSSProperties = {
    fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.82rem", color: INK,
    textDecoration: "none", borderBottom: `1.5px solid ${rgba(INK, 0.35)}`, paddingBottom: 1,
    background: "none", border: "none", borderBottomWidth: 1.5, borderBottomStyle: "solid", cursor: "pointer",
    padding: 0, paddingBottom: 1,
  };
  if (href) {
    return <a href={href} target="_blank" rel="noreferrer" style={style}>{children} ↗</a>;
  }
  return <button type="button" onClick={onClick} style={style}>{children}</button>;
}

/** Small "show more / less" toggle. */
export function MoreToggle({ open, count, onClick }: { open: boolean; count: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={open} style={{
      alignSelf: "flex-start", marginTop: "0.5rem", background: "none", border: "none", padding: 0,
      fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.78rem", color: MUTED, cursor: "pointer",
    }}>
      {open ? "show less" : `+ ${count} more`}
    </button>
  );
}

/** Two-column grid that collapses to one column on phones. */
export function Grid({ children, min = 300 }: { children: ReactNode; min?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: "1rem" }}>
      {children}
    </div>
  );
}
