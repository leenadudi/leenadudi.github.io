import type { Item, Media } from "../App";

export default function ExperienceSection({ items, ink }: { items: Item[]; ink: string }) {
  return (
    <div style={{
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
  // meta format: "Role · Dates · Location"
  const parts = (item.meta ?? "").split(" · ");
  const role     = parts[0] ?? "";
  const dates    = parts[1] ?? "";
  const location = parts.slice(2).join(" · ");

  return (
    <div style={{
      padding: "1.1rem 0",
      borderBottom: last ? "none" : `1px solid ${rgba(ink, 0.13)}`,
    }}>
      {/* Company + date */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", gap: "0.75rem",
      }}>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(1rem, 1.9vw, 1.15rem)",
          letterSpacing: "-0.01em",
          color: ink,
        }}>
          {item.title}
        </span>
        <span style={{
          fontSize: "clamp(0.72rem, 1.25vw, 0.82rem)",
          color: ink, opacity: 0.52,
          whiteSpace: "nowrap", flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
        }}>
          {dates}
        </span>
      </div>

      {/* Role + location */}
      {(role || location) && (
        <div style={{
          marginTop: "0.22rem",
          fontSize: "clamp(0.75rem, 1.3vw, 0.85rem)",
          color: ink, opacity: 0.8,
          fontStyle: "italic",
        }}>
          {role}{location ? <span style={{ opacity: 0.9 }}>{" · "}{location}</span> : null}
        </div>
      )}

      {/* Bullets */}
      <ul style={{
        listStyle: "none", margin: "0.6rem 0 0", padding: 0,
        display: "flex", flexDirection: "column", gap: "0.3rem",
      }}>
        {item.bullets.map((b, j) => (
          <li key={j} style={{
            display: "flex", gap: "0.5rem",
            fontSize: "clamp(0.84rem, 1.5vw, 0.96rem)",
            lineHeight: 1.48, color: ink, opacity: 1,
          }}>
            <span style={{ opacity: 0.38, flexShrink: 0, userSelect: "none" }}>-</span>
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
              padding: "2px 9px",
              borderRadius: "99px",
              fontSize: "clamp(0.67rem, 1.1vw, 0.76rem)",
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
              padding: "2px 10px",
              borderRadius: "99px",
              fontSize: "clamp(0.67rem, 1.1vw, 0.76rem)",
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
    </div>
  );
}

function rgba(hex: string, a: number) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
