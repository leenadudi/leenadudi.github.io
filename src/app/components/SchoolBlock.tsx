import { useState } from "react";
import type { Item } from "../content";
import { rgba } from "../lib/color";
import { useMediaQuery, useNarrow } from "../hooks/useMediaQuery";
import { CARD, FONT_BODY, INK, LINE, MUTED, RADIUS } from "../lib/tokens";
import { Chip } from "./ui";
import { MediaPane } from "./MediaPane";

/** School: MIT summary in three columns, then research and projects as tabs. */
export default function SchoolBlock({ items, color }: { items: Item[]; color: string }) {
  const narrow = useNarrow();
  const medium = useMediaQuery("(max-width: 1023px)");
  const mit      = items[0];
  const research = items.slice(1);
  const [active, setActive] = useState(0);
  const item = research[active];
  const pdf    = item?.media?.find(m => m.type === "pdf")    as { type: "pdf"; url: string; label?: string } | undefined;
  const iframe = item?.media?.find(m => m.type === "iframe") as { type: "iframe"; url: string; label?: string } | undefined;
  const hasVisual = !!pdf || !!iframe;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* MIT */}
      <div style={{
        background: CARD, border: `1px solid ${LINE}`, borderTop: `3px solid ${color}`, borderRadius: RADIUS,
        padding: "1.25rem 1.4rem 1.4rem",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem 0.75rem", flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.01em", margin: 0, color: INK }}>
            {mit.title}
          </h3>
          <span style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: MUTED }}>{mit.meta}</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: narrow ? "1fr" : medium ? "1fr 1fr" : "1fr 1fr 1.25fr",
          gap: narrow ? "1.25rem" : "2rem", marginTop: "1.25rem",
        }}>
          <div>
            <Label>coursework</Label>
            <List items={mit.bullets} />
          </div>
          <div>
            <Label>activities</Label>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {mit.activities?.map((a, i) => (
                <li key={i} style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", lineHeight: 1.5, color: INK }}>
                  {a.name}
                  {a.role && <span style={{ color: MUTED }}> · {a.role}</span>}
                </li>
              ))}
            </ul>
          </div>
          {mit.awards && (
            <div style={{ gridColumn: medium && !narrow ? "1 / -1" : undefined }}>
              <Label>awards and honors</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {mit.awards.map((a, i) => <Chip key={i} color={color} strong>{a.name}</Chip>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Research and projects */}
      {research.length > 0 && (
        <div>
          <Label>research and projects</Label>
          <div role="tablist" aria-label="research and projects" style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {research.map((it, i) => {
              const on = i === active;
              return (
                <button key={i} role="tab" aria-selected={on} onClick={() => setActive(i)} style={{
                  padding: "6px 14px", borderRadius: 99, cursor: "pointer",
                  fontFamily: FONT_BODY, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "-0.01em",
                  color: INK, background: on ? color : "transparent",
                  border: `1.5px solid ${on ? color : rgba(INK, 0.22)}`,
                  transition: "background .2s, border-color .2s",
                }}>
                  {it.title}
                </button>
              );
            })}
          </div>

          {item && (
            <div style={{
              background: CARD, border: `1px solid ${LINE}`, borderRadius: RADIUS, padding: "1.25rem 1.4rem",
              display: "flex", flexDirection: narrow ? "column" : "row", gap: "1.25rem",
              minHeight: hasVisual && !narrow ? "min(460px, 58vh)" : undefined,
            }}>
              <div style={{ width: hasVisual && !narrow ? "clamp(260px, 34%, 440px)" : "100%", flexShrink: 0 }}>
                {item.meta && <div style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: MUTED, marginBottom: "0.6rem" }}>{item.meta}</div>}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {item.bullets.map((b, j) => (
                    <li key={j} style={{ display: "flex", gap: "0.5rem", fontFamily: FONT_BODY, fontSize: "0.88rem", lineHeight: 1.55, color: INK }}>
                      <span aria-hidden style={{ width: 9, height: 2, borderRadius: 1, background: color, flexShrink: 0, marginTop: "0.72em" }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {item.skills && item.skills.length > 0 && (
                  <div style={{ marginTop: "0.9rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {item.skills.map((s, j) => <Chip key={j} color={color}>{s}</Chip>)}
                  </div>
                )}
              </div>
              {pdf    && <MediaPane kind="pdf"    url={pdf.url}    label={pdf.label ?? "paper"}       ink={INK} narrow={narrow} />}
              {iframe && <MediaPane kind="iframe" url={iframe.url} label={iframe.label ?? item.title} ink={INK} narrow={narrow} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: string }) {
  return (
    <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.8rem", color: MUTED, marginBottom: "0.5rem" }}>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      {items.map((b, i) => (
        <li key={i} style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", lineHeight: 1.5, color: INK }}>{b}</li>
      ))}
    </ul>
  );
}
