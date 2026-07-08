import { useState } from "react";
import { motion } from "motion/react";
import { type Item, labelColor } from "../App";

export default function SchoolSection({ items, ink }: { items: Item[]; ink: string }) {
  const mit      = items[0];
  const research = items.slice(1);
  const [activeR, setActiveR] = useState(0);
  const activeItem = research[activeR];
  const pdfMedia    = activeItem?.media?.find(m => m.type === "pdf") as { type: "pdf"; url: string; label?: string } | undefined;
  const iframeMedia = activeItem?.media?.find(m => m.type === "iframe") as { type: "iframe"; url: string; label?: string } | undefined;
  const hasVisual   = !!pdfMedia || !!iframeMedia;

  return (
    <div onClick={e => e.stopPropagation()} style={{
      flex: 1, minHeight: 0, overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "1.3rem",
    }}>

      {/* ── MIT header ── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
          fontSize: "clamp(1rem,1.9vw,1.15rem)", letterSpacing: "-0.01em", color: ink,
        }}>
          {mit.title}
        </span>
        <span style={{ fontSize: "clamp(0.9rem,1.6vw,1.05rem)", color: ink, opacity: 0.82, fontStyle: "italic" }}>
          {mit.meta}
        </span>
      </div>

      {/* ── Courses + Activities + Awards in one row ── */}
      <div style={{ display: "flex", gap: "2rem", paddingBottom: "1.2rem", borderBottom: `1px solid ${rgba(ink, 0.13)}` }}>

        {/* Coursework */}
        <div style={{ flex: 1 }}>
          <ColLabel ink={ink}>coursework</ColLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.22rem" }}>
            {mit.bullets.map((b, i) => (
              <span key={i} style={{ fontSize: "clamp(0.82rem,1.45vw,0.94rem)", lineHeight: 1.5, color: ink, opacity: 1 }}>
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div style={{ flex: 1 }}>
          <ColLabel ink={ink}>activities</ColLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.28rem" }}>
            {mit.activities?.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "clamp(0.82rem,1.45vw,0.94rem)", color: ink, opacity: 1 }}>
                  {a.name}
                </span>
                {a.role && (
                  <span style={{ fontSize: "clamp(0.74rem,1.25vw,0.84rem)", color: ink, opacity: 0.72, fontStyle: "italic" }}>
                    {a.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        {mit.awards && (
          <div style={{ flex: 1 }}>
            <ColLabel ink={ink}>awards & honors</ColLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem" }}>
              {mit.awards.map((a, i) => (
                <div key={i} style={{
                  padding: "0.5rem 0.65rem", borderRadius: "7px",
                  background: rgba(ink, 0.07), border: `1px solid ${rgba(ink, 0.14)}`,
                  display: "flex", flexDirection: "column", gap: "0.2rem",
                }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "clamp(0.7rem,1.2vw,0.8rem)", color: ink, lineHeight: 1.25, opacity: 1 }}>{a.name}</span>
                  {a.description && <span style={{ fontSize: "clamp(0.62rem,1vw,0.7rem)", color: ink, opacity: 0.8, lineHeight: 1.4 }}>{a.description}</span>}
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
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {research.map((it, i) => (
              <button key={i} onClick={() => setActiveR(i)} style={{
                padding: "6px 16px", borderRadius: "99px", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(0.74rem,1.25vw,0.82rem)", fontWeight: 700,
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

          {/* Active item content - 25/75 split if PDF, full width otherwise */}
          {activeItem && (
            <div style={{ display: "flex", gap: "0.7rem", minHeight: "370px" }}>
              {/* Text pane */}
              <div style={{ width: hasVisual ? "28%" : "100%", flexShrink: 0, overflowY: "auto" }}>
                {activeItem.meta && (
                  <div style={{ fontSize: "clamp(0.72rem,1.2vw,0.82rem)", color: ink, opacity: 0.72, fontStyle: "italic", marginBottom: "0.5rem" }}>
                    {activeItem.meta}
                  </div>
                )}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {activeItem.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: "clamp(0.82rem,1.45vw,0.94rem)", lineHeight: 1.55, color: ink, opacity: 1 }}>
                      {b}
                    </li>
                  ))}
                </ul>
                {activeItem.skills && activeItem.skills.length > 0 && (
                  <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {activeItem.skills.map((s, j) => (
                      <span key={j} style={{
                        padding: "3px 9px", borderRadius: "99px",
                        fontSize: "clamp(0.66rem,1.05vw,0.74rem)",
                        fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500,
                        color: ink, background: rgba(ink, 0.1), border: `1px solid ${rgba(ink, 0.16)}`,
                      }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* PDF pane */}
              {pdfMedia && (
                <div style={{ flex: 1, minWidth: 0, borderRadius: "8px", overflow: "hidden", background: rgba(ink, 0.04), display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "0.4rem 0.6rem", display: "flex", justifyContent: "flex-end", borderBottom: `1px solid ${rgba(ink, 0.1)}`, flexShrink: 0 }}>
                    <a href={pdfMedia.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.65rem", color: ink, opacity: 0.78, textDecoration: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>open ↗</a>
                  </div>
                  <object data={pdfMedia.url} type="application/pdf" style={{ flex: 1, width: "100%", border: "none", display: "block" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5, fontSize: "0.8rem", color: ink }}>
                      PDF preview unavailable - <a href={pdfMedia.url} target="_blank" rel="noreferrer" style={{ color: ink, marginLeft: "0.3em" }}>open directly</a>
                    </div>
                  </object>
                </div>
              )}

              {/* iframe pane (e.g. SharePoint embed) */}
              {iframeMedia && (
                <div style={{ flex: 1, minWidth: 0, borderRadius: "8px", overflow: "hidden", background: rgba(ink, 0.04), display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "0.4rem 0.6rem", display: "flex", justifyContent: "flex-end", borderBottom: `1px solid ${rgba(ink, 0.1)}`, flexShrink: 0 }}>
                    <a href={iframeMedia.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.65rem", color: ink, opacity: 0.78, textDecoration: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>open ↗</a>
                  </div>
                  <iframe
                    src={iframeMedia.url}
                    style={{ flex: 1, width: "100%", border: "none", display: "block" }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
                    title="embed"
                  />
                </div>
              )}
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
      fontSize: "0.65rem", fontFamily: "'Plus Jakarta Sans',sans-serif",
      fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
      color: ink, opacity: 0.9, marginBottom: "0.5rem",
    }}>
      {children}
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
