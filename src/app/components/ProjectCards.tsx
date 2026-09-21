import { lazy, Suspense, useState, Fragment } from "react";
import type { Item, Media } from "../content";
import { rgba } from "../lib/color";
import { FONT_BODY, INK, LINE, MUTED, RADIUS } from "../lib/tokens";
import { ArrowLink, Card, Chip, Grid, MoreToggle } from "./ui";

const VibeGraphEmbed = lazy(() => import("./VibeGraphEmbed"));

/** Projects: screenshot cards. The music map can be opened live, inline. */
export default function ProjectCards({ items, color }: { items: Item[]; color: string }) {
  const [liveOpen, setLiveOpen] = useState<number | null>(null);
  return (
    <Grid min={340}>
      {items.map((item, i) => {
        const embed = item.media?.some(m => m.type === "embed");
        return (
          <Fragment key={i}>
            <ProjectCard
              item={item} color={color}
              liveOpen={liveOpen === i}
              onToggleLive={embed ? () => setLiveOpen(liveOpen === i ? null : i) : undefined}
            />
            {embed && liveOpen === i && (
              <div style={{
                gridColumn: "1 / -1", height: "min(72vh, 620px)",
                borderRadius: RADIUS, overflow: "hidden", border: `1px solid ${LINE}`,
              }}>
                <Suspense fallback={<div style={{ width: "100%", height: "100%", background: rgba(INK, 0.06) }} />}>
                  <VibeGraphEmbed />
                </Suspense>
              </div>
            )}
          </Fragment>
        );
      })}
    </Grid>
  );
}

function ProjectCard({ item, color, liveOpen, onToggleLive }: {
  item: Item; color: string; liveOpen: boolean; onToggleLive?: () => void;
}) {
  const [more, setMore] = useState(false);
  const media = item.media ?? [];
  const site  = media.find((m): m is Extract<Media, { type: "iframe" }> => m.type === "iframe");
  const links = media.filter((m): m is Extract<Media, { type: "link" | "paper" | "pdf" }> =>
    m.type === "link" || m.type === "paper" || m.type === "pdf");

  return (
    <Card color={color} style={{ padding: 0, overflow: "hidden" }}>
      {item.image && (
        <a href={site?.url} target={site ? "_blank" : undefined} rel="noreferrer"
          style={{ display: "block", aspectRatio: "16 / 10", overflow: "hidden", borderBottom: `1px solid ${LINE}`, background: rgba(INK, 0.04) }}>
          <img src={item.image} alt={`${item.title} screenshot`} loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
        </a>
      )}
      <div style={{ padding: "1.05rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.25rem 0.75rem", flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.01em", margin: 0, color: INK, lineHeight: 1.3 }}>
            {item.title}
          </h3>
          {item.meta && <span style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: MUTED }}>{item.meta}</span>}
        </div>
        {item.summary && (
          <p style={{ margin: "0.5rem 0 0", fontFamily: FONT_BODY, fontSize: "0.9rem", lineHeight: 1.55, color: INK }}>
            {item.summary}
          </p>
        )}
        {more && (
          <ul style={{ listStyle: "none", margin: "0.7rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {item.bullets.map((b, j) => (
              <li key={j} style={{ display: "flex", gap: "0.5rem", fontFamily: FONT_BODY, fontSize: "0.88rem", lineHeight: 1.55, color: INK }}>
                <span aria-hidden style={{ width: 9, height: 2, borderRadius: 1, background: color, flexShrink: 0, marginTop: "0.72em" }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        <MoreToggle open={more} count={item.bullets.length} onClick={() => setMore(m => !m)} />

        {item.skills && (
          <div style={{ marginTop: "0.9rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {item.skills.map((s, j) => <Chip key={j} color={color}>{s}</Chip>)}
          </div>
        )}
        {(site || links.length > 0 || onToggleLive) && (
          <div style={{ marginTop: "0.95rem", display: "flex", flexWrap: "wrap", gap: "0.5rem 1.1rem" }}>
            {site && <ArrowLink href={site.url}>live site</ArrowLink>}
            {links.map((m, j) => <ArrowLink key={j} href={m.url}>{m.label ?? "paper"}</ArrowLink>)}
            {onToggleLive && <ArrowLink onClick={onToggleLive}>{liveOpen ? "close the live map" : "explore the live map"}</ArrowLink>}
          </div>
        )}
      </div>
    </Card>
  );
}
