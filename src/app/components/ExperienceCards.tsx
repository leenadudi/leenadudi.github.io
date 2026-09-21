import { useState } from "react";
import type { Item, Media } from "../content";
import { FONT_BODY, INK, MUTED } from "../lib/tokens";
import { ArrowLink, Card, Chip, Grid, MoreToggle } from "./ui";

const PREVIEW = 2; // bullets shown before "more"

/** Experience and service: a card per role, two per row on desktop. */
export default function ExperienceCards({ items, color }: { items: Item[]; color: string }) {
  return (
    <Grid min={340}>
      {items.map((item, i) => <RoleCard key={i} item={item} color={color} />)}
    </Grid>
  );
}

function RoleCard({ item, color }: { item: Item; color: string }) {
  const [open, setOpen] = useState(false);
  // meta: "Role · Dates · Location" (any part may be missing). The part with a
  // year (or "present") is the date; the rest is the role line.
  const parts  = (item.meta ?? "").split(" · ").filter(Boolean);
  const isDate = (s: string) => /\b(19|20)\d{2}\b|\bpresent\b/i.test(s);
  const dates  = parts.find(isDate) ?? "";
  const role   = parts.filter(p => p !== dates).join(" · ");
  const hidden = item.bullets.length - PREVIEW;
  const shown  = open ? item.bullets : item.bullets.slice(0, PREVIEW);
  const pdfs   = (item.media ?? []).filter((m): m is Extract<Media, { type: "pdf" }> => m.type === "pdf");

  return (
    <Card color={color}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.25rem 0.75rem", flexWrap: "wrap" }}>
        <h3 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.01em", margin: 0, color: INK, lineHeight: 1.3 }}>
          {item.title}
        </h3>
        {dates && (
          <span style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: MUTED, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
            {dates}
          </span>
        )}
      </div>
      {role && (
        <div style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: MUTED, marginTop: "0.15rem" }}>{role}</div>
      )}

      <ul style={{ listStyle: "none", margin: "0.8rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {shown.map((b, j) => (
          <li key={j} style={{ display: "flex", gap: "0.5rem", fontFamily: FONT_BODY, fontSize: "0.9rem", lineHeight: 1.55, color: INK }}>
            <span aria-hidden style={{ width: 9, height: 2, borderRadius: 1, background: color, flexShrink: 0, marginTop: "0.72em" }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {hidden > 0 && <MoreToggle open={open} count={hidden} onClick={() => setOpen(o => !o)} />}

      {((item.skills && item.skills.length > 0) || pdfs.length > 0) && (
        <div style={{ marginTop: "0.9rem", display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
          {item.skills?.map((s, j) => <Chip key={j} color={color}>{s}</Chip>)}
          {pdfs.map((m, j) => (
            <span key={j} style={{ marginLeft: "0.25rem" }}>
              <ArrowLink href={m.url}>{m.label ?? "paper"}</ArrowLink>
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
