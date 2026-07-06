/**
 * ItemVisual — one small visualization per portfolio item.
 *
 * "Mixed per item": most items get a custom line-art SVG themed to the item
 * and drawn in the column's ink colour; items with real numbers get a tiny
 * data chart; items that would ideally show a real image get a dashed
 * "add a photo/screenshot" placeholder tile so Leena can drop assets in later.
 *
 * All art is drawn in a 0 0 100 100 viewBox with `ink` as the stroke so it
 * reads cleanly on any of the five column colours.
 */

type Props = { art: string; ink: string };

const box: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
};

function Svg({ ink, children }: { ink: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" style={box} fill="none"
      stroke={ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

// faint fill derived from the ink colour
function soft(ink: string, a = 0.14) {
  const h = ink.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── tiny bar chart (AP exams: 11 fives) ───────────────────────────────
function BarChart({ ink }: { ink: string }) {
  const n = 11;
  const gap = 2.5;
  const w = (86 - gap * (n - 1)) / n;
  return (
    <svg viewBox="0 0 100 100" style={box} fill="none"
      stroke={ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="82" x2="94" y2="82" opacity={0.5} />
      {Array.from({ length: n }).map((_, i) => {
        const x = 8 + i * (w + gap);
        return <rect key={i} x={x} y={22} width={w} height={60} rx={1.2}
          fill={soft(ink, 0.55)} stroke="none" />;
      })}
      <text x="51" y="14" textAnchor="middle" fill={ink} stroke="none"
        fontSize="11" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight={700}>
        11 × 5
      </text>
    </svg>
  );
}

// ── photo / screenshot placeholder ────────────────────────────────────
function Placeholder({ ink, label }: { ink: string; label: string }) {
  return (
    <div style={{
      width: "100%", height: "100%", borderRadius: 10,
      border: `1.5px dashed ${soft(ink, 0.5)}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, textAlign: "center", padding: 10,
    }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={ink}
        strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.8}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.8" />
        <path d="M21 16l-5-5-9 9" />
      </svg>
      <span style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.62rem",
        letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.75,
        color: ink, lineHeight: 1.3,
      }}>{label}</span>
    </div>
  );
}

export default function ItemVisual({ art, ink }: Props) {
  const f = soft(ink);

  switch (art) {
    // ── experience ──────────────────────────────────────────────────
    case "flow": // Agent Vista — agentic AI workflow: nodes + links
      return <Svg ink={ink}>
        <circle cx="20" cy="30" r="9" fill={f} />
        <circle cx="50" cy="62" r="11" fill={soft(ink, 0.28)} />
        <circle cx="80" cy="28" r="9" fill={f} />
        <circle cx="78" cy="72" r="7" fill={f} />
        <path d="M28 34 L42 56 M59 58 L72 33 M58 66 L72 70" />
        <circle cx="50" cy="62" r="3" fill={ink} stroke="none" />
      </Svg>;

    case "route": // Bungii — last-mile delivery routes
      return <Svg ink={ink}>
        <path d="M14 78 C 34 78 30 42 50 42 S 70 20 86 20" strokeDasharray="4 5" />
        <circle cx="14" cy="78" r="4" fill={f} />
        <path d="M86 12 c 7 0 11 6 11 11 c 0 8 -11 15 -11 15 s -11 -7 -11 -15 c 0 -5 4 -11 11 -11 z" fill={f} />
        <circle cx="86" cy="23" r="3" fill={ink} stroke="none" />
      </Svg>;

    case "wildfire": // NASA — real-time wildfire risk
      return <Svg ink={ink}>
        <path d="M50 20 c 10 14 16 20 16 34 a16 16 0 0 1 -32 0 c 0 -10 6 -14 8 -22 c 4 6 2 12 8 12 c 6 0 -2 -12 0 -24 z" fill={f} />
        <path d="M22 82 h56" opacity={0.5} />
      </Svg>;

    case "grid": // Kiewit — 500+ project billing spreadsheet
      return <Svg ink={ink}>
        <rect x="16" y="20" width="68" height="60" rx="3" fill={f} />
        <line x1="16" y1="36" x2="84" y2="36" />
        <line x1="16" y1="52" x2="84" y2="52" />
        <line x1="16" y1="68" x2="84" y2="68" />
        <line x1="39" y1="20" x2="39" y2="80" />
        <line x1="61" y1="20" x2="61" y2="80" />
        <rect x="16" y="20" width="23" height="16" fill={soft(ink, 0.3)} stroke="none" />
      </Svg>;

    // ── projects ────────────────────────────────────────────────────
    case "civic": // ClerkFlow — civic SaaS for local government
      return <Svg ink={ink}>
        <path d="M18 40 L50 22 L82 40" fill={f} />
        <line x1="18" y1="40" x2="82" y2="40" />
        <line x1="26" y1="44" x2="26" y2="74" />
        <line x1="42" y1="44" x2="42" y2="74" />
        <line x1="58" y1="44" x2="58" y2="74" />
        <line x1="74" y1="44" x2="74" y2="74" />
        <line x1="14" y1="80" x2="86" y2="80" />
      </Svg>;

    case "phoneapp": // NASA wildfire app — Flutter mockup
      return <Svg ink={ink}>
        <rect x="34" y="12" width="32" height="76" rx="6" fill={f} />
        <line x1="44" y1="18" x2="56" y2="18" />
        <path d="M50 34 c 5 7 8 10 8 17 a8 8 0 0 1 -16 0 c 0 -5 3 -7 4 -11 c 2 3 1 6 4 6 c 3 0 -1 -6 0 -12 z"
          fill={soft(ink, 0.3)} />
        <line x1="42" y1="72" x2="58" y2="72" opacity={0.5} />
      </Svg>;

    // ── school ──────────────────────────────────────────────────────
    case "dome": // MIT — great dome
      return <Svg ink={ink}>
        <path d="M22 66 a28 22 0 0 1 56 0 z" fill={f} />
        <line x1="16" y1="66" x2="84" y2="66" />
        <line x1="30" y1="66" x2="30" y2="82" />
        <line x1="42" y1="66" x2="42" y2="82" />
        <line x1="58" y1="66" x2="58" y2="82" />
        <line x1="70" y1="66" x2="70" y2="82" />
        <line x1="14" y1="82" x2="86" y2="82" />
        <line x1="50" y1="24" x2="50" y2="44" />
      </Svg>;

    case "aps": // Blue Valley West — 11 AP fives (bar chart)
      return <BarChart ink={ink} />;

    case "medal": // awards & honors
      return <Svg ink={ink}>
        <path d="M38 18 L46 46 M62 18 L54 46" />
        <circle cx="50" cy="64" r="18" fill={f} />
        <path d="M50 54 l3 6 6 1 -4.5 4.5 1 6.5 -5.5 -3 -5.5 3 1 -6.5 -4.5 -4.5 6 -1 z"
          fill={soft(ink, 0.4)} stroke="none" />
      </Svg>;

    case "radar": // Lincoln Lab — Doppler / SAR radar
      return <Svg ink={ink}>
        <circle cx="50" cy="72" r="10" fill={f} />
        <path d="M50 72 A34 34 0 0 1 84 72" opacity={0.35} />
        <path d="M50 72 A24 24 0 0 1 74 72" opacity={0.55} />
        <path d="M50 72 A14 14 0 0 1 64 72" opacity={0.8} />
        <line x1="50" y1="72" x2="80" y2="46" />
      </Svg>;

    // ── service / research ──────────────────────────────────────────
    case "soccer": // FIFA + MIT Sports Lab — optical tracking
      return <Svg ink={ink}>
        <rect x="14" y="24" width="72" height="52" rx="3" fill={f} />
        <line x1="50" y1="24" x2="50" y2="76" />
        <circle cx="50" cy="50" r="9" />
        <circle cx="34" cy="40" r="2.5" fill={ink} stroke="none" />
        <circle cx="66" cy="60" r="2.5" fill={ink} stroke="none" />
        <circle cx="62" cy="38" r="2.5" fill={ink} stroke="none" />
        <path d="M34 40 L62 38 M62 38 L66 60" strokeDasharray="3 3" opacity={0.6} />
      </Svg>;

    case "geo": // Urban Risk Lab — geospatial / Earth Engine
      return <Svg ink={ink}>
        <circle cx="50" cy="50" r="30" fill={f} />
        <ellipse cx="50" cy="50" rx="30" ry="12" />
        <ellipse cx="50" cy="50" rx="12" ry="30" />
        <line x1="20" y1="50" x2="80" y2="50" />
      </Svg>;

    case "mentor": // Heartland STEM 501c3 — mentorship
      return <Svg ink={ink}>
        <circle cx="34" cy="38" r="10" fill={f} />
        <path d="M18 74 c 0 -12 8 -18 16 -18 s 16 6 16 18" fill={f} />
        <circle cx="68" cy="44" r="8" fill={soft(ink, 0.28)} />
        <path d="M54 76 c 0 -10 7 -15 14 -15 s 14 5 14 15" fill={soft(ink, 0.28)} />
      </Svg>;

    case "rocket": // Million Girls Moonshot
      return <Svg ink={ink}>
        <circle cx="70" cy="30" r="12" fill={f} />
        <path d="M40 74 c -6 -22 6 -42 20 -50 c 4 14 2 34 -8 46 z" fill={soft(ink, 0.28)} />
        <path d="M40 74 l -8 6 l 8 -2 z" fill={ink} stroke="none" />
        <circle cx="52" cy="46" r="4" />
      </Svg>;

    case "robot": // FTC Robotics captain
      return <Svg ink={ink}>
        <rect x="28" y="34" width="44" height="36" rx="6" fill={f} />
        <circle cx="41" cy="52" r="4.5" fill={ink} stroke="none" />
        <circle cx="59" cy="52" r="4.5" fill={ink} stroke="none" />
        <line x1="50" y1="34" x2="50" y2="22" />
        <circle cx="50" cy="20" r="3" fill={f} />
        <line x1="28" y1="60" x2="20" y2="60" />
        <line x1="72" y1="60" x2="80" y2="60" />
      </Svg>;

    // ── hobbies ──────────────────────────────────────────────────────
    case "basketball":
      return <Svg ink={ink}>
        <circle cx="50" cy="50" r="30" fill={f} />
        <line x1="20" y1="50" x2="80" y2="50" />
        <line x1="50" y1="20" x2="50" y2="80" />
        <path d="M29 29 C 44 44 44 56 29 71" />
        <path d="M71 29 C 56 44 56 56 71 71" />
      </Svg>;

    case "music": // singing / Ohms Acapella
      return <Svg ink={ink}>
        <path d="M20 70 q 8 -22 16 0 t 16 -6 t 16 8 t 12 -14" opacity={0.6} />
        <circle cx="40" cy="72" r="7" fill={f} />
        <circle cx="72" cy="64" r="7" fill={f} />
        <line x1="47" y1="72" x2="47" y2="34" />
        <line x1="79" y1="64" x2="79" y2="28" />
        <path d="M47 34 L79 28" />
      </Svg>;

    case "coaster": // rollercoasters — the site's signature motif
      return <Svg ink={ink}>
        <path d="M14 78 C 30 78 24 30 40 30 C 56 30 52 60 66 60 C 78 60 74 34 88 34" />
        <path d="M14 84 L20 78 M28 84 L34 78 M42 84 L48 78 M56 84 L62 78 M70 84 L76 78 M84 84 L90 78" opacity={0.5} />
        <circle cx="40" cy="30" r="3.5" fill={f} />
        <circle cx="66" cy="60" r="3.5" fill={f} />
      </Svg>;

    // ── photo/screenshot placeholders ───────────────────────────────
    case "photo:basketball": return <Placeholder ink={ink} label="add a photo" />;
    case "photo:screenshot": return <Placeholder ink={ink} label="add a screenshot" />;
    case "photo:acapella":   return <Placeholder ink={ink} label="add a photo" />;

    default:
      return <Placeholder ink={ink} label="add a visual" />;
  }
}
