/** Service as a grid of tinted tiles, each in its own colour. */
import type { Item } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { rgba } from "../lib/color";
import { FONT_BODY, INK, MUTED } from "../lib/tokens";
import { Bullets, palette } from "./Layout";
import Reveal from "./Reveal";

export default function ServiceTiles({ items, color }: { items: Item[]; color: string }) {
  const narrow = useNarrow();
  const colors = palette(color);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: narrow ? "1fr" : "repeat(6, 1fr)",
      gap: "1rem",
    }}>
      {items.map((item, i) => {
        const wide = !narrow && (i === 0 || i === 1);           // first row: two wide tiles
        const c = colors[i % colors.length];
        const tint = c === "#FEE09D" ? 0.5 : 0.3;                // the yellow needs more to show
        const parts = (item.meta ?? "").split(" · ").filter(Boolean);
        return (
          <Reveal key={i} as="article" delay={i * 0.05} style={{
            gridColumn: narrow ? undefined : wide ? "span 3" : "span 2",
            background: rgba(c, tint), borderRadius: 20,
            padding: narrow ? "1.4rem 1.3rem" : "1.7rem 1.6rem",
            display: "flex", flexDirection: "column", gap: "0.9rem", minWidth: 0,
          }}>
            <div>
              <h2 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "1.2rem", letterSpacing: "-0.01em", margin: 0, color: INK, lineHeight: 1.25 }}>
                {item.title}
              </h2>
              {parts.length > 0 && (
                <div style={{ fontFamily: FONT_BODY, fontSize: "0.84rem", color: MUTED, marginTop: "0.2rem" }}>{parts.join(" · ")}</div>
              )}
            </div>
            <Bullets items={item.bullets} color={INK} size="0.88rem" />
          </Reveal>
        );
      })}
    </div>
  );
}
