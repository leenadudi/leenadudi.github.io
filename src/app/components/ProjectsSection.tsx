import { lazy, Suspense, useState } from "react";
import { motion } from "motion/react";
import type { Item } from "../App";

const VibeGraphEmbed = lazy(() => import("./VibeGraphEmbed"));

export default function ProjectsSection({ items, ink, title }: { items: Item[]; ink: string; title?: string }) {
  const [active, setActive] = useState(0);
  const item = items[active];
  const hasEmbed = item.media?.some(m => m.type === "embed");
  const iframeMedia = item.media?.find(m => m.type === "iframe") as { type: "iframe"; url: string; label?: string } | undefined;
  const pdfMedia = item.media?.find(m => m.type === "pdf") as { type: "pdf"; url: string; label?: string } | undefined;
  const hasVisual = hasEmbed || !!iframeMedia || !!pdfMedia;

  return (
    <div onClick={e => e.stopPropagation()} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "0.7rem" }}>
      {/* Title + tab pills in one row */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", flexShrink: 0 }}>
        {title && (
          <span style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600,
            fontSize: "clamp(1.2rem,2.5vw,1.9rem)", letterSpacing: "-0.02em",
            lineHeight: 1.05, color: ink,
          }}>{title}</span>
        )}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {items.map((it, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: "6px 16px", borderRadius: "99px", cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", fontWeight: 700,
            letterSpacing: "-0.01em",
            position: "relative",
            background: "transparent",
            color: i === active ? "#3d2a0e" : ink,
            border: `2px solid ${i === active ? ink : rgba(ink, 0.65)}`,
            opacity: i === active ? 1 : 0.88,
            transition: "color .2s, border-color .2s, opacity .2s",
          }}>
            {i === active && (
              <motion.span
                layoutId="projects-pill-bg"
                style={{ position: "absolute", inset: 0, background: ink, borderRadius: "99px" }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>{it.title}</span>
          </button>
        ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "0.7rem", overflow: "hidden" }}>
        {/* Text - 25% when visual present, full width otherwise */}
        <div style={{ width: hasVisual ? "25%" : "100%", flexShrink: 0, overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: hasVisual ? "center" : "flex-start" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {item.bullets.map((b, j) => (
              <li key={j} style={{ fontSize: "clamp(0.88rem,1.55vw,1rem)", lineHeight: 1.55, color: ink, opacity: 1 }}>
                {b}
              </li>
            ))}
          </ul>
          {item.skills && (
            <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {item.skills.map((s, j) => (
                <span key={j} style={{ padding: "3px 9px", borderRadius: "99px", fontSize: "0.76rem", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500, color: ink, background: rgba(ink, 0.1), border: `1px solid ${rgba(ink, 0.16)}` }}>{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Visual - 75% */}
        {hasEmbed && (
          <div style={{ flex: 1, minWidth: 0, borderRadius: "8px", overflow: "hidden" }}>
            <Suspense fallback={<div style={{ width:"100%",height:"100%",background:rgba(ink,0.08),borderRadius:"8px" }} />}>
              <VibeGraphEmbed />
            </Suspense>
          </div>
        )}
        {iframeMedia && (
          <div style={{ flex: 1, minWidth: 0, borderRadius: "8px", overflow: "hidden", background: rgba(ink, 0.06), display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "0.4rem 0.6rem", display: "flex", justifyContent: "flex-end", borderBottom: `1px solid ${rgba(ink, 0.1)}`, flexShrink: 0 }}>
              <a href={iframeMedia.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.65rem", color: ink, opacity: 0.78, textDecoration: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>
                open ↗
              </a>
            </div>
            <iframe
              src={iframeMedia.url}
              style={{ flex: 1, width: "100%", border: "none", display: "block" }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
              title="project embed"
            />
          </div>
        )}
        {pdfMedia && (
          <div style={{ flex: 1, minWidth: 0, borderRadius: "8px", overflow: "hidden", background: rgba(ink, 0.04), position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "0.4rem 0.6rem", display: "flex", justifyContent: "flex-end", borderBottom: `1px solid ${rgba(ink, 0.1)}` }}>
              <a href={pdfMedia.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.65rem", color: ink, opacity: 0.78, textDecoration: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>
                open ↗
              </a>
            </div>
            <object
              data={pdfMedia.url}
              type="application/pdf"
              style={{ flex: 1, width: "100%", border: "none", display: "block" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.4, fontSize: "0.8rem", color: ink }}>
                PDF preview unavailable -{" "}
                <a href={pdfMedia.url} target="_blank" rel="noreferrer" style={{ color: ink, marginLeft: "0.3em" }}>open directly</a>
              </div>
            </object>
          </div>
        )}
      </div>
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
