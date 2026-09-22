/** Projects: screenshot beside the text, one project per row. */
import { lazy, Suspense, useState } from "react";
import type { Item, Media } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { rgba } from "../lib/color";
import { FONT_BODY, INK, LINE, MUTED } from "../lib/tokens";
import { ArrowLink, Bullets, Chip } from "./Layout";

const VibeGraphEmbed = lazy(() => import("./VibeGraphEmbed"));

export default function ProjectList({ items, color }: { items: Item[]; color: string }) {
  const narrow = useNarrow();
  const [liveOpen, setLiveOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item, i) => (
        <Project key={i} item={item} color={color} narrow={narrow} first={i === 0}
          liveOpen={liveOpen === i}
          onToggleLive={item.media?.some(m => m.type === "embed") ? () => setLiveOpen(liveOpen === i ? null : i) : undefined} />
      ))}
    </div>
  );
}

function Project({ item, color, narrow, first, liveOpen, onToggleLive }: {
  item: Item; color: string; narrow: boolean; first: boolean; liveOpen: boolean; onToggleLive?: () => void;
}) {
  const media = item.media ?? [];
  const site  = media.find((m): m is Extract<Media, { type: "iframe" }> => m.type === "iframe");
  const links = media.filter((m): m is Extract<Media, { type: "link" | "paper" | "pdf" }> =>
    m.type === "link" || m.type === "paper" || m.type === "pdf");

  return (
    <section style={{ padding: narrow ? "1.8rem 0" : "2.6rem 0", borderTop: first ? "none" : `1px solid ${LINE}` }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: narrow || !item.image ? "1fr" : "minmax(0, 0.9fr) minmax(0, 1.1fr)",
        gap: narrow ? "1.1rem" : "2.5rem", alignItems: "start",
      }}>
        {item.image && (
          <a href={site?.url} target={site ? "_blank" : undefined} rel="noreferrer" style={{
            display: "block", aspectRatio: "16 / 10", overflow: "hidden", borderRadius: 12,
            border: `1px solid ${LINE}`, background: rgba(INK, 0.04),
          }}>
            <img src={item.image} alt={`${item.title} screenshot`} loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
          </a>
        )}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem 0.9rem", flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "clamp(1.15rem, 1.8vw, 1.35rem)", letterSpacing: "-0.015em", margin: 0, color: INK, lineHeight: 1.25 }}>
              {item.title}
            </h2>
            {item.meta && <span style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: MUTED }}>{item.meta}</span>}
          </div>
          <div style={{ marginTop: "0.9rem" }}>
            <Bullets items={item.bullets} color={color} size="0.9rem" />
          </div>
          {item.skills && (
            <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {item.skills.map((s, j) => <Chip key={j} color={color}>{s}</Chip>)}
            </div>
          )}
          {(site || links.length > 0 || onToggleLive) && (
            <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem" }}>
              {site && <ArrowLink href={site.url}>live site</ArrowLink>}
              {links.map((m, j) => <ArrowLink key={j} href={m.url}>{m.label ?? "paper"}</ArrowLink>)}
              {onToggleLive && <ArrowLink onClick={onToggleLive}>{liveOpen ? "close the live map" : "explore the live map"}</ArrowLink>}
            </div>
          )}
        </div>
      </div>
      {liveOpen && (
        <div style={{ marginTop: "1.5rem", height: "min(72vh, 620px)", borderRadius: 12, overflow: "hidden", border: `1px solid ${LINE}` }}>
          <Suspense fallback={<div style={{ width: "100%", height: "100%", background: rgba(INK, 0.06) }} />}>
            <VibeGraphEmbed />
          </Suspense>
        </div>
      )}
    </section>
  );
}
