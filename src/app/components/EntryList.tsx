/** Experience and service: dates and role on the left, the work on the right. */
import type { Item, Media } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { FONT_BODY, INK, LINE, MUTED } from "../lib/tokens";
import { ArrowLink, Bullets, Chip } from "./Layout";

export default function EntryList({ items, color }: { items: Item[]; color: string }) {
  const narrow = useNarrow();
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item, i) => <Entry key={i} item={item} color={color} narrow={narrow} first={i === 0} />)}
    </div>
  );
}

function Entry({ item, color, narrow, first }: { item: Item; color: string; narrow: boolean; first: boolean }) {
  const parts  = (item.meta ?? "").split(" · ").filter(Boolean);
  const isDate = (s: string) => /\b(19|20)\d{2}\b|\bpresent\b/i.test(s);
  const dates  = parts.find(isDate) ?? "";
  const rest   = parts.filter(p => p !== dates);
  const pdfs   = (item.media ?? []).filter((m): m is Extract<Media, { type: "pdf" }> => m.type === "pdf");

  return (
    <section style={{
      display: "grid",
      gridTemplateColumns: narrow ? "1fr" : "200px minmax(0, 1fr)",
      gap: narrow ? "0.6rem" : "2.5rem",
      padding: narrow ? "1.8rem 0" : "2.5rem 0",
      borderTop: first ? "none" : `1px solid ${LINE}`,
    }}>
      {/* meta column */}
      <div style={{ fontFamily: FONT_BODY, display: "flex", flexDirection: narrow ? "row" : "column", flexWrap: "wrap", gap: narrow ? "0.25rem 0.75rem" : "0.25rem" }}>
        {dates && <div style={{ fontSize: "0.9rem", fontWeight: 600, color: INK, fontVariantNumeric: "tabular-nums" }}>{dates}</div>}
        {rest.map((r, j) => <div key={j} style={{ fontSize: "0.88rem", color: MUTED, lineHeight: 1.45 }}>{r}</div>)}
      </div>

      {/* body */}
      <div>
        <h2 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "clamp(1.15rem, 1.8vw, 1.35rem)", letterSpacing: "-0.015em", margin: "0 0 0.8rem", color: INK, lineHeight: 1.25 }}>
          {item.title}
        </h2>
        <Bullets items={item.bullets} color={color} />
        {((item.skills && item.skills.length > 0) || pdfs.length > 0) && (
          <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
            {item.skills?.map((s, j) => <Chip key={j} color={color}>{s}</Chip>)}
            {pdfs.map((m, j) => (
              <span key={j} style={{ marginLeft: "0.35rem" }}>
                <ArrowLink href={m.url}>{m.label ?? "paper"}</ArrowLink>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
