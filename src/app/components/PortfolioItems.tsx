/**
 * PortfolioItems — the item list inside an expanded column.
 *
 * Each item is a card that always shows its visual + title + bullet-point
 * description.  If the item has attachments (slide deck, links, papers,
 * images, or the live Vibe Graph), a toggle expands them inline beneath the
 * bullets — so the text is always readable and the extras open on click.
 * Items with nothing attached yet show a dashed "attach …" cue.
 */
import { useState, lazy, Suspense } from "react";
import type { Item, Media } from "../App";
import ItemVisual from "./ItemVisual";

const VibeGraphEmbed = lazy(() => import("./VibeGraphEmbed"));

function toggleLabel(media: Media[]): string {
  if (media.some(m => m.type === "embed")) return "▸ explore the live graph";
  const slides = media.find(m => m.type === "slides") as Extract<Media, { type: "slides" }> | undefined;
  if (slides) return `▤ view ${slides.images.length} slides`;
  const n = media.length;
  return `◇ open ${n} attachment${n > 1 ? "s" : ""}`;
}

export default function PortfolioItems({ items, ink }: { items: Item[]; ink: string }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "0.35rem",
      display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {items.map((it, i) => <Card key={i} item={it} ink={ink} />)}
    </div>
  );
}

function Card({ item, ink }: { item: Item; ink: string }) {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const media = item.media ?? [];
  const hasMedia = media.length > 0;

  return (
    <div className="pg-tile" style={{
      background: "rgba(255,255,255,0.11)", border: "1px solid rgba(255,255,255,0.16)",
      borderRadius: "14px", padding: "clamp(0.85rem,1.6vw,1.15rem)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "clamp(64px,16%,96px) 1fr",
        gap: "1rem", alignItems: "center" }}>
        <div className="pg-tile-art" style={{ width: "100%", aspectRatio: "1 / 1" }}>
          <ItemVisual art={item.art} ink={ink} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600,
              fontSize: "clamp(0.92rem,1.8vw,1.12rem)", letterSpacing: "-0.01em" }}>{item.title}</span>
            {item.meta && (
              <span style={{ fontSize: "clamp(0.6rem,1.2vw,0.72rem)", opacity: 0.65 }}>{item.meta}</span>
            )}
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.45rem 0 0",
            display: "flex", flexDirection: "column", gap: "0.32rem" }}>
            {item.bullets.map((b, j) => (
              <li key={j} style={{ position: "relative", paddingLeft: "0.9rem",
                fontSize: "clamp(0.72rem,1.35vw,0.85rem)", lineHeight: 1.42,
                opacity: item.todo ? 0.62 : 0.9, fontStyle: item.todo ? "italic" : "normal" }}>
                <span style={{ position: "absolute", left: 0, opacity: 0.55 }}>·</span>{b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* attachment control */}
      {hasMedia ? (
        <button className="pg-chip" onClick={() => setOpen(o => !o)}
          style={{ marginTop: "0.8rem", border: "none", cursor: "pointer",
            background: "rgba(255,255,255,0.2)", color: ink, padding: "7px 14px",
            borderRadius: "20px", fontSize: "0.72rem", fontFamily: "'Plus Jakarta Sans',sans-serif",
            letterSpacing: "0.02em" }}>
          {open ? "▾ hide" : toggleLabel(media)}
        </button>
      ) : (
        <div style={{ marginTop: "0.8rem", borderRadius: "10px",
          border: "1.5px dashed rgba(0,0,0,0.18)", padding: "0.6rem 0.9rem",
          fontSize: "0.68rem", opacity: 0.65, letterSpacing: "0.02em" }}>
          ＋ attach slides, a PDF, screenshots, or links here
        </div>
      )}

      {/* expandable attachment panel */}
      {open && hasMedia && (
        <div style={{ marginTop: "0.8rem", animation: "pg-pop 0.35s ease" }}>
          {media.map((m, k) => (
            <MediaBlock key={k} m={m} ink={ink} slide={slide} setSlide={setSlide} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaBlock({ m, ink, slide, setSlide }: {
  m: Media; ink: string; slide: number; setSlide: (f: (s: number) => number) => void;
}) {
  if (m.type === "embed") {
    return (
      <div style={{ width: "100%", height: "clamp(200px,32vh,320px)", marginBottom: "0.7rem" }}>
        <Suspense fallback={
          <div style={{ width: "100%", height: "100%", borderRadius: "10px",
            background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.55rem", letterSpacing: "0.1em",
            textTransform: "uppercase", opacity: 0.45 }}>loading graph…</div>
        }>
          <VibeGraphEmbed />
        </Suspense>
      </div>
    );
  }

  if (m.type === "slides") {
    const imgs = m.images;
    if (imgs.length === 0) return null;
    const idx = ((slide % imgs.length) + imgs.length) % imgs.length;
    return (
      <div style={{ marginBottom: "0.7rem" }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9",
          borderRadius: "10px", overflow: "hidden", background: "rgba(0,0,0,0.25)" }}>
          <img src={imgs[idx]} alt={`slide ${idx + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "0.5rem" }}>
          <button className="pg-rbtn" style={rbtn(ink)}
            onClick={() => setSlide(s => s - 1)}>‹</button>
          <div style={{ display: "flex", gap: "6px" }}>
            {imgs.map((_, j) => (
              <span key={j} style={{ width: 7, height: 7, borderRadius: "50%",
                background: j === idx ? ink : "rgba(0,0,0,0.25)" }} />
            ))}
          </div>
          <button className="pg-rbtn" style={rbtn(ink)}
            onClick={() => setSlide(s => s + 1)}>›</button>
        </div>
      </div>
    );
  }

  if (m.type === "image") {
    return (
      <figure style={{ margin: "0 0 0.7rem" }}>
        <img src={m.src} alt={m.caption ?? ""} style={{ width: "100%", borderRadius: "10px" }} />
        {m.caption && <figcaption style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: "0.3rem" }}>{m.caption}</figcaption>}
      </figure>
    );
  }

  // link / paper
  return (
    <a href={m.url} target="_blank" rel="noreferrer" className="pg-chip"
      style={{ display: "inline-block", marginRight: "0.5rem", marginBottom: "0.4rem",
        fontSize: "0.72rem", background: "rgba(255,255,255,0.18)", color: ink,
        padding: "6px 12px", borderRadius: "20px", textDecoration: "none" }}>
      ↗ {m.label}
    </a>
  );
}

function rbtn(ink: string): React.CSSProperties {
  return { border: "none", background: "rgba(255,255,255,0.2)", color: ink,
    width: 38, height: 38, borderRadius: "50%", fontSize: "1.1rem", cursor: "pointer", lineHeight: 1 };
}
