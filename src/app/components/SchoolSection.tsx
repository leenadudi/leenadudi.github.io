import { useState } from "react";
import { motion } from "motion/react";
import type { Item } from "../App";
import { labelColor, rgba } from "../lib/color";
import { useMediaQuery, useNarrow } from "../hooks/useMediaQuery";
import { MediaPane } from "./MediaPane";

export default function SchoolSection({ items, ink }: { items: Item[]; ink: string }) {
  const narrow   = useNarrow();
  const medium   = useMediaQuery("(max-width: 1023px)"); // tablets: two columns, awards below
  const mit      = items[0];
  const research = items.slice(1);
  const [activeR, setActiveR] = useState(0);
  const activeItem = research[activeR];
  const pdfMedia    = activeItem?.media?.find(m => m.type === "pdf") as { type: "pdf"; url: string; label?: string } | undefined;
  const iframeMedia = activeItem?.media?.find(m => m.type === "iframe") as { type: "iframe"; url: string; label?: string } | undefined;
  const hasVisual   = !!pdfMedia || !!iframeMedia;

  return (
    <div className="section-scroll" style={{
      flex: 1, minHeight: 0, overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "1.3rem",
    }}>

      {/* ── MIT header ── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem 0.75rem", flexWrap: "wrap" }}>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, margin: 0,
          fontSize: "clamp(1rem,1.9vw,1.15rem)", letterSpacing: "-0.01em", color: ink,
        }}>
          {mit.title}
        </h3>
        <span style={{ fontSize: "clamp(0.86rem,1.6vw,1.05rem)", color: ink, opacity: 0.82, fontStyle: "italic" }}>
          {mit.meta}
        </span>
      </div>

      {/* ── Courses + Activities + Awards: three columns, stacked on phones ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: narrow ? "1fr" : medium ? "1fr 1fr" : "1fr 1fr 1.2fr",
        gap: narrow ? "1.25rem" : "2rem",
        paddingBottom: "1.2rem", borderBottom: `1px solid ${rgba(ink, 0.13)}`,
      }}>

        {/* Coursework */}
        <div>
          <ColLabel ink={ink}>coursework</ColLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.22rem" }}>
            {mit.bullets.map((b, i) => (
              <span key={i} style={{ fontSize: "clamp(0.84rem,1.45vw,0.94rem)", lineHeight: 1.5, color: ink }}>
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div>
          <ColLabel ink={ink}>activities</ColLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.28rem" }}>
            {mit.activities?.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "clamp(0.84rem,1.45vw,0.94rem)", color: ink }}>
                  {a.name}
                </span>
                {a.role && (
                  <span style={{ fontSize: "clamp(0.76rem,1.25vw,0.84rem)", color: ink, opacity: 0.72, fontStyle: "italic" }}>
                    {a.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        {mit.awards && (
          <div style={{ gridColumn: medium && !narrow ? "1 / -1" : undefined }}>
            <ColLabel ink={ink}>awards & honors</ColLabel>
            <div style={{ display: "grid", gridTemplateColumns: medium && !narrow ? "repeat(3, 1fr)" : "1fr 1fr", gap: "0.45rem" }}>
              {mit.awards.map((a, i) => (
                <div key={i} style={{
                  padding: "0.5rem 0.65rem", borderRadius: "8px",
                  background: rgba(ink, 0.07), border: `1px solid ${rgba(ink, 0.14)}`,
                  display: "flex", flexDirection: "column", gap: "0.2rem",
                }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "clamp(0.72rem,1.2vw,0.8rem)", color: ink, lineHeight: 1.25 }}>{a.name}</span>
                  {a.description && <span style={{ fontSize: "clamp(0.64rem,1vw,0.7rem)", color: ink, opacity: 0.8, lineHeight: 1.4 }}>{a.description}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Research & Projects (tab layout) ── */}
      {research.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <ColLabel ink={ink}>research & projects</ColLabel>

          {/* Tab pills */}
          <div role="tablist" aria-label="research and projects" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {research.map((it, i) => (
              <button key={i} role="tab" aria-selected={i === activeR} onClick={() => setActiveR(i)} style={{
                padding: "6px 15px", borderRadius: "99px", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(0.74rem,1.25vw,0.8rem)", fontWeight: 700,
                letterSpacing: "-0.01em",
                position: "relative",
                background: "transparent",
                color: i === activeR ? labelColor(ink) : ink,
                border: `2px solid ${i === activeR ? ink : rgba(ink, 0.65)}`,
                opacity: i === activeR ? 1 : 0.88,
                transition: "color .2s, border-color .2s, opacity .2s",
              }}>
                {i === activeR && (
                  <motion.span
                    layoutId="school-pill-bg"
                    style={{ position: "absolute", inset: 0, background: ink, borderRadius: "99px" }}
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{it.title}</span>
              </button>
            ))}
          </div>

          {/* Active item: text beside the media on desktop, stacked on phones */}
          {activeItem && (
            <div style={{
              display: "flex", flexDirection: narrow ? "column" : "row", gap: "0.8rem",
              minHeight: hasVisual && !narrow ? "min(420px, 55vh)" : undefined,
            }}>
              <div style={{ width: hasVisual && !narrow ? "clamp(240px, 30%, 420px)" : "100%", flexShrink: 0 }}>
                {activeItem.meta && (
                  <div style={{ fontSize: "clamp(0.74rem,1.2vw,0.82rem)", color: ink, opacity: 0.72, fontStyle: "italic", marginBottom: "0.5rem" }}>
                    {activeItem.meta}
                  </div>
                )}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {activeItem.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: "clamp(0.84rem,1.45vw,0.94rem)", lineHeight: 1.55, color: ink }}>
                      {b}
                    </li>
                  ))}
                </ul>
                {activeItem.skills && activeItem.skills.length > 0 && (
                  <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {activeItem.skills.map((s, j) => (
                      <span key={j} style={{
                        padding: "3px 10px", borderRadius: "99px",
                        fontSize: "clamp(0.68rem,1.05vw,0.74rem)",
                        fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500,
                        color: ink, background: rgba(ink, 0.1), border: `1px solid ${rgba(ink, 0.16)}`,
                      }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {pdfMedia && <MediaPane kind="pdf" url={pdfMedia.url} label={pdfMedia.label ?? "paper"} ink={ink} narrow={narrow} />}
              {iframeMedia && <MediaPane kind="iframe" url={iframeMedia.url} label={iframeMedia.label ?? activeItem.title} ink={ink} narrow={narrow} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ColLabel({ ink, children }: { ink: string; children: string }) {
  return (
    <div style={{
      fontSize: "0.66rem", fontFamily: "'Plus Jakarta Sans',sans-serif",
      fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
      color: ink, opacity: 0.9, marginBottom: "0.5rem",
    }}>
      {children}
    </div>
  );
}
