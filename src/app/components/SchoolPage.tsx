/** School: MIT in three columns, then research and projects as tabs. */
import { useState } from "react";
import type { Item } from "../content";
import { rgba } from "../lib/color";
import { useMediaQuery, useNarrow } from "../hooks/useMediaQuery";
import { FONT_BODY, INK, LINE, MUTED } from "../lib/tokens";
import { Bullets, Chip } from "./Layout";
import { MediaPane } from "./MediaPane";

export default function SchoolPage({ items, color }: { items: Item[]; color: string }) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2rem, 4vw, 3rem)", paddingBottom: "2rem" }}>
      {/* MIT */}
      <section>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem 0.9rem", flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "clamp(1.15rem, 1.8vw, 1.35rem)", letterSpacing: "-0.015em", margin: 0, color: INK }}>
            {mit.title}
          </h2>
          <span style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: MUTED }}>{mit.meta}</span>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: narrow ? "1fr" : medium ? "1fr 1fr" : "1fr 1fr 1.25fr",
          gap: narrow ? "1.5rem" : "2.5rem", marginTop: "1.5rem",
        }}>
          <div>
            <Label>coursework</Label>
            <Plain items={mit.bullets} />
          </div>
          <div>
            <Label>activities</Label>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {mit.activities?.map((a, i) => (
                <li key={i} style={{ fontFamily: FONT_BODY, fontSize: "0.93rem", lineHeight: 1.5, color: INK }}>
                  {a.name}{a.role && <span style={{ color: MUTED }}> · {a.role}</span>}
                </li>
              ))}
            </ul>
          </div>
          {mit.awards && (
            <div style={{ gridColumn: medium && !narrow ? "1 / -1" : undefined }}>
              <Label>awards and honors</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                {mit.awards.map((a, i) => <Chip key={i} color={color} strong>{a.name}</Chip>)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Research and projects */}
      {research.length > 0 && (
        <section data-rb="cross" style={{ paddingTop: "clamp(2.4rem, 4vw, 3.4rem)" }}>
          <Label>research and projects</Label>
          <div role="tablist" aria-label="research and projects" style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "1.4rem" }}>
            {research.map((it, i) => {
              const on = i === active;
              return (
                <button key={i} role="tab" aria-selected={on} onClick={() => setActive(i)} style={{
                  padding: "7px 15px", borderRadius: 99, cursor: "pointer",
                  fontFamily: FONT_BODY, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "-0.01em",
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
              display: "flex", flexDirection: narrow ? "column" : "row", gap: narrow ? "1.25rem" : "2.5rem",
              minHeight: hasVisual && !narrow ? "min(480px, 60vh)" : undefined,
            }}>
              <div style={{ width: hasVisual && !narrow ? "clamp(280px, 40%, 460px)" : "100%", flexShrink: 0 }}>
                <h2 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.015em", margin: "0 0 0.2rem", color: INK }}>
                  {item.title}
                </h2>
                {item.meta && <div style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: MUTED, marginBottom: "0.9rem" }}>{item.meta}</div>}
                <Bullets items={item.bullets} color={color} size="0.88rem" />
                {item.skills && item.skills.length > 0 && (
                  <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {item.skills.map((s, j) => <Chip key={j} color={color}>{s}</Chip>)}
                  </div>
                )}
              </div>
              {pdf    && <MediaPane kind="pdf"    url={pdf.url}    label={pdf.label ?? "paper"}       ink={INK} narrow={narrow} />}
              {iframe && <MediaPane kind="iframe" url={iframe.url} label={iframe.label ?? item.title} ink={INK} narrow={narrow} />}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Label({ children }: { children: string }) {
  return <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.82rem", color: MUTED, marginBottom: "0.6rem" }}>{children}</div>;
}

function Plain({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      {items.map((b, i) => <li key={i} style={{ fontFamily: FONT_BODY, fontSize: "0.93rem", lineHeight: 1.5, color: INK }}>{b}</li>)}
    </ul>
  );
}
