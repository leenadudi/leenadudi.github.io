/** Experience as a timeline: a five-strand rail that grows as you scroll,
 *  a marker per role in its own colour, the year in big type beside it, and
 *  the work on the right. */
import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "motion/react";
import type { Item, Media } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { FONT_BODY, FONT_DISPLAY, INK, MUTED } from "../lib/tokens";
import { ArrowLink, Bullets, Chip, palette } from "./Layout";
import { SECTIONS } from "../content";
import Reveal from "./Reveal";

function splitMeta(meta?: string) {
  const parts  = (meta ?? "").split(" · ").filter(Boolean);
  const isDate = (s: string) => /\b(19|20)\d{2}\b|\bpresent\b/i.test(s);
  const dates  = parts.find(isDate) ?? "";
  const rest   = parts.filter(p => p !== dates);
  const year   = (dates.match(/\b(19|20)\d{2}\b/g) ?? []).slice(-1)[0] ?? "";
  return { dates, rest, year: /present/i.test(dates) ? "now" : year };
}

export default function Timeline({ items, color }: { items: Item[]; color: string }) {
  const narrow = useNarrow();
  const railX = narrow ? 11 : 119;                   // rail centre from the left
  const colors = palette(color);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 75%"] });
  return (
    <div ref={ref} style={{ position: "relative", paddingLeft: narrow ? 34 : 0 }}>
      {/* rail: five strands, drawn down the page as you scroll */}
      <motion.div aria-hidden style={{
        position: "absolute", top: 12, bottom: 12, left: railX - 11, width: 22,
        display: "flex", justifyContent: "space-between",
        transformOrigin: "top", scaleY: reduce ? 1 : scrollYProgress,
      }}>
        {SECTIONS.map(sec => <span key={sec.id} style={{ width: 2.5, borderRadius: 2, background: sec.color }} />)}
      </motion.div>
      {items.map((item, i) => {
        const { dates, rest, year } = splitMeta(item.meta);
        const c = colors[i % colors.length];
        const pdfs = (item.media ?? []).filter((m): m is Extract<Media, { type: "pdf" }> => m.type === "pdf");
        return (
          <Reveal key={i} as="section" delay={0.05} style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: narrow ? "1fr" : "96px 44px minmax(0, 1fr)",
            columnGap: narrow ? 0 : "1rem",
            padding: narrow ? "0 0 2.4rem" : "0 0 3.2rem",
          }}>
            {/* marker on the rail */}
            <span aria-hidden style={{
              position: "absolute", top: 8, left: narrow ? -34 + railX - 9 : railX - 9,
              width: 18, height: 18, borderRadius: "50%", background: c,
              boxShadow: `0 0 0 4px #FDF6EC`,
            }} />
            {/* year, big and light */}
            {!narrow && (
              <div style={{ textAlign: "right", paddingRight: "0.25rem" }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 200, fontSize: "2.4rem", lineHeight: 1, color: INK, letterSpacing: "-0.03em" }}>
                  {year}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: MUTED, marginTop: "0.45rem", fontVariantNumeric: "tabular-nums" }}>{dates}</div>
              </div>
            )}
            {!narrow && <div />}
            <div style={{ minWidth: 0 }}>
              {narrow && (
                <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", fontWeight: 600, color: INK, marginBottom: "0.2rem", fontVariantNumeric: "tabular-nums" }}>{dates}</div>
              )}
              <h2 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "clamp(1.2rem, 1.9vw, 1.45rem)", letterSpacing: "-0.015em", margin: 0, color: INK, lineHeight: 1.2 }}>
                {item.title}
              </h2>
              {rest.length > 0 && (
                <div style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: MUTED, marginTop: "0.25rem" }}>{rest.join(" · ")}</div>
              )}
              <div style={{ marginTop: "0.9rem" }}>
                <Bullets items={item.bullets} color={c} />
              </div>
              {((item.skills && item.skills.length > 0) || pdfs.length > 0) && (
                <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                  {item.skills?.map((s, j) => <Chip key={j} color={c} strong>{s}</Chip>)}
                  {pdfs.map((m, j) => (
                    <span key={j} style={{ marginLeft: "0.35rem" }}>
                      <ArrowLink href={m.url}>{m.label ?? "paper"}</ArrowLink>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
