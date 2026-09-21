import { lazy, Suspense, useState } from "react";
import { motion } from "motion/react";
import type { Item } from "../App";
import { labelColor, rgba } from "../lib/color";
import { useNarrow } from "../hooks/useMediaQuery";
import { MediaPane } from "./MediaPane";

const VibeGraphEmbed = lazy(() => import("./VibeGraphEmbed"));

export default function ProjectsSection({ items, ink }: { items: Item[]; ink: string }) {
  const narrow = useNarrow();
  const [active, setActive] = useState(0);
  const item = items[active];
  const hasEmbed = item.media?.some(m => m.type === "embed");
  const iframeMedia = item.media?.find(m => m.type === "iframe") as { type: "iframe"; url: string; label?: string } | undefined;
  const pdfMedia = item.media?.find(m => m.type === "pdf") as { type: "pdf"; url: string; label?: string } | undefined;
  const hasVisual = hasEmbed || !!iframeMedia || !!pdfMedia;

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      {/* Project tabs */}
      <div role="tablist" aria-label="projects" style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", flexShrink: 0 }}>
        {items.map((it, i) => (
          <button key={i} role="tab" aria-selected={i === active} onClick={() => setActive(i)} style={{
            padding: "6px 15px", borderRadius: "99px", cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(0.74rem,1.25vw,0.8rem)", fontWeight: 700,
            letterSpacing: "-0.01em",
            position: "relative",
            background: "transparent",
            color: i === active ? labelColor(ink) : ink,
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

      {/* Content: text beside the visual on desktop, stacked on phones */}
      <div className="section-scroll" style={{
        flex: 1, minHeight: 0,
        display: "flex", flexDirection: narrow ? "column" : "row", gap: "0.8rem",
        overflowY: narrow ? "auto" : "hidden",
      }}>
        <div className={narrow ? undefined : "section-scroll"} style={{
          width: hasVisual && !narrow ? "clamp(240px, 28%, 420px)" : "100%",
          flexShrink: 0,
          overflowY: narrow ? "visible" : "auto",
          display: "flex", flexDirection: "column",
          justifyContent: hasVisual && !narrow ? "center" : "flex-start",
        }}>
          {item.meta && (
            <div style={{ fontSize: "clamp(0.74rem,1.2vw,0.84rem)", color: ink, opacity: 0.72, fontStyle: "italic", marginBottom: "0.4rem" }}>
              {item.meta}
            </div>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {item.bullets.map((b, j) => (
              <li key={j} style={{ fontSize: "clamp(0.88rem,1.55vw,1rem)", lineHeight: 1.55, color: ink }}>
                {b}
              </li>
            ))}
          </ul>
          {item.skills && (
            <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {item.skills.map((s, j) => (
                <span key={j} style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "0.74rem", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500, color: ink, background: rgba(ink, 0.1), border: `1px solid ${rgba(ink, 0.16)}` }}>{s}</span>
              ))}
            </div>
          )}
        </div>

        {hasEmbed && (
          <div style={{
            flex: narrow ? "none" : 1, minWidth: 0,
            height: narrow ? "min(70vh, 520px)" : "auto",
            borderRadius: "10px", overflow: "hidden",
          }}>
            <Suspense fallback={<div style={{ width:"100%",height:"100%",background:rgba(ink,0.08),borderRadius:"10px" }} />}>
              <VibeGraphEmbed />
            </Suspense>
          </div>
        )}
        {iframeMedia && <MediaPane kind="iframe" url={iframeMedia.url} label={iframeMedia.label ?? "project"} ink={ink} narrow={narrow} />}
        {pdfMedia && <MediaPane kind="pdf" url={pdfMedia.url} label={pdfMedia.label ?? "paper"} ink={ink} narrow={narrow} />}
      </div>
    </div>
  );
}
