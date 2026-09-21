import type { Item, Media } from "../App";
import { rgba } from "../lib/color";

export default function ExperienceSection({ items, ink }: { items: Item[]; ink: string }) {
  return (
    <div className="section-scroll" style={{
      flex: 1, minHeight: 0, overflowY: "auto",
      display: "flex", flexDirection: "column",
    }}>
      {items.map((item, i) => (
        <Row key={i} item={item} ink={ink} last={i === items.length - 1} />
      ))}
    </div>
  );
}

function Row({ item, ink, last }: { item: Item; ink: string; last: boolean }) {
  // meta format: "Role · Dates · Location" (any part may be missing). The part
  // that contains a year (or "present") is the date; everything else is the
  // role / organisation line.
  const parts   = (item.meta ?? "").split(" · ").filter(Boolean);
  const isDate  = (s: string) => /\b(19|20)\d{2}\b|\bpresent\b/i.test(s);
  const dates   = parts.find(isDate) ?? "";
  const rest    = parts.filter(p => p !== dates);
  const role     = rest[0] ?? "";
  const location = rest.slice(1).join(" · ");

  return (
    <article style={{
      padding: "1.1rem 0",
      borderBottom: last ? "none" : `1px solid ${rgba(ink, 0.13)}`,
    }}>
      {/* Company + date (wraps onto two lines on narrow screens) */}
      <div style={{
        display: "flex", justifyContent: "space-between", flexWrap: "wrap",
        alignItems: "baseline", gap: "0.2rem 0.75rem",
      }}>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(1rem, 1.9vw, 1.15rem)",
          letterSpacing: "-0.01em",
          color: ink, margin: 0, lineHeight: 1.25,
        }}>
          {item.title}
        </h3>
        {dates && (
          <span style={{
            fontSize: "clamp(0.72rem, 1.25vw, 0.82rem)",
            color: ink, opacity: 0.6,
            whiteSpace: "nowrap", flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
          }}>
            {dates}
          </span>
        )}
      </div>

      {/* Role + location */}
      {(role || location) && (
        <div style={{
          marginTop: "0.22rem",
          fontSize: "clamp(0.78rem, 1.3vw, 0.88rem)",
          color: ink, opacity: 0.8,
          fontStyle: "italic",
        }}>
          {role}{location ? <span>{" · "}{location}</span> : null}
        </div>
      )}

      {/* Bullets */}
      <ul style={{
        listStyle: "none", margin: "0.6rem 0 0", padding: 0,
        display: "flex", flexDirection: "column", gap: "0.35rem",
      }}>
        {item.bullets.map((b, j) => (
          <li key={j} style={{
            display: "flex", gap: "0.5rem",
            fontSize: "clamp(0.86rem, 1.5vw, 0.96rem)",
            lineHeight: 1.5, color: ink,
          }}>
            <span aria-hidden style={{ opacity: 0.38, flexShrink: 0 }}>-</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* Skill chips + PDF link */}
      {((item.skills && item.skills.length > 0) || item.media?.some(m => m.type === "pdf")) && (
        <div style={{
          marginTop: "0.75rem",
          display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center",
        }}>
          {item.skills?.map((s, j) => (
            <span key={j} style={{
              padding: "3px 10px",
              borderRadius: "99px",
              fontSize: "clamp(0.68rem, 1.1vw, 0.76rem)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: ink,
              background: rgba(ink, 0.1),
              border: `1px solid ${rgba(ink, 0.18)}`,
            }}>
              {s}
            </span>
          ))}
          {item.media?.filter((m): m is Extract<Media, { type: "pdf" }> => m.type === "pdf").map((m, j) => (
            <a key={j} href={m.url} target="_blank" rel="noreferrer" style={{
              padding: "3px 11px",
              borderRadius: "99px",
              fontSize: "clamp(0.68rem, 1.1vw, 0.76rem)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: ink,
              background: rgba(ink, 0.18),
              border: `1px solid ${rgba(ink, 0.32)}`,
              textDecoration: "none",
            }}>
              {m.label ?? "view paper"} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
