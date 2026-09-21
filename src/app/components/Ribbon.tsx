/**
 * Ribbon: the five strands doing one move, drawn full-width. The scene is a
 * 1000-wide box that is scaled to cover its element (`slice`), so the strands
 * stay bold on phones (the sides crop) and the loops are never squashed.
 */
import { SECTIONS } from "../content";

export type Move = "loop" | "wave" | "braid" | "coil" | "flat";

const W = 1000, SW = 20, K = 0.5523;
/** scene height per move (the loop tower needs more room) */
const HEIGHT: Record<Move, number> = { loop: 210, wave: 180, braid: 180, coil: 180, flat: 180 };
const GAP = 18;                 // spacing between nested strands
const BASE = 96;                // y of the first strand (teal)

function circle(cx: number, cy: number, r: number): string {
  // full clockwise circle starting and ending at 6 o'clock
  const bot = cy + r;
  return [
    `C ${cx + r * K},${bot} ${cx + r},${cy + r * K} ${cx + r},${cy}`,
    `C ${cx + r},${cy - r * K} ${cx + r * K},${cy - r} ${cx},${cy - r}`,
    `C ${cx - r * K},${cy - r} ${cx - r},${cy - r * K} ${cx - r},${cy}`,
    `C ${cx - r},${cy + r * K} ${cx - r * K},${bot} ${cx},${bot}`,
  ].join(" ");
}

function loopPath(i: number): string {
  // Like the ride's first move: strands come in low, sweep up into a nested
  // loop tower, and leave high on the right. No strand runs through a loop.
  const yIn = 126 + i * GAP;    // entry height (bundle low-left)
  const yOut = 34 + i * GAP;    // exit height (bundle high-right)
  const r = 40;
  const cx = 470 + i * 10;      // tower leans right
  const cy = 58 + i * GAP;
  const bot = cy + r;
  return [
    `M -50,${yIn}`, `L 200,${yIn}`,
    `C ${cx - 150},${yIn} ${cx - 70},${bot} ${cx},${bot}`,
    circle(cx, cy, r),
    `C ${cx + 110},${bot} ${cx + 230},${yOut} ${cx + 330},${yOut}`,
    `L ${W + 50},${yOut}`,
  ].join(" ");
}

function wavePath(i: number): string {
  const y0 = BASE + i * GAP - 30;
  const amp = 34, lambda = 260, phi = i * 0.55;
  const pts: string[] = [];
  for (let x = -50; x <= W + 50; x += 8) {
    const env = Math.sin((Math.PI * (x + 50)) / (W + 100)); // fades at both ends
    const y = y0 + amp * env * Math.sin((2 * Math.PI * x) / lambda + phi);
    pts.push(`${x === -50 ? "M" : "L"} ${x},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function coilPath(i: number): string {
  // tighter, higher-amplitude weave: strands cross over one another
  const y0 = BASE + i * GAP - 30;
  const amp = 40, lambda = 180, phi = (i * 2 * Math.PI) / 5;
  const pts: string[] = [];
  for (let x = -50; x <= W + 50; x += 6) {
    const env = Math.sin((Math.PI * (x + 50)) / (W + 100));
    const y = y0 + amp * env * Math.sin((2 * Math.PI * x) / lambda + phi);
    pts.push(`${x === -50 ? "M" : "L"} ${x},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function braidPath(i: number): string {
  // Strands swing in opposite directions and cross over one another
  const y0 = BASE + i * GAP - 30;
  const amp = 44 * (i % 2 === 0 ? 1 : -1), lambda = 420;
  const pts: string[] = [];
  for (let x = -50; x <= W + 50; x += 8) {
    const env = Math.sin((Math.PI * (x + 50)) / (W + 100));
    const y = y0 + amp * env * Math.sin((2 * Math.PI * x) / lambda);
    pts.push(`${x === -50 ? "M" : "L"} ${x},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function flatPath(i: number): string {
  const y = BASE + i * GAP;
  return `M -50,${y} L ${W + 50},${y}`;
}

const BUILDERS: Record<Move, (i: number) => string> = {
  loop: loopPath, wave: wavePath, braid: braidPath, coil: coilPath, flat: flatPath,
};

export default function Ribbon({ move, height, emphasis }: {
  move: Move;
  height?: string;
  /** section id: that strand is drawn last, on top of the others */
  emphasis?: string;
}) {
  const build = BUILDERS[move];
  const H = HEIGHT[move];
  const h = height ?? `clamp(130px, ${H / 10}vw, ${Math.round(H * 1.5)}px)`;
  const order = emphasis
    ? [...SECTIONS.filter(s => s.id !== emphasis), ...SECTIONS.filter(s => s.id === emphasis)]
    : [...SECTIONS];
  return (
    <div aria-hidden style={{ width: "100%", height: h, overflow: "hidden" }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}>
        {order.map((s) => {
          const i = SECTIONS.findIndex(x => x.id === s.id);
          return (
            <path key={s.id} d={build(i)} stroke={s.color} strokeWidth={SW}
              fill="none" strokeLinecap="round" strokeLinejoin="round" />
          );
        })}
      </svg>
    </div>
  );
}

/** Five flat lines stacked, for the page foot. */
export function LineBand({ thickness = 5 }: { thickness?: number }) {
  return (
    <div aria-hidden style={{ display: "flex", flexDirection: "column" }}>
      {SECTIONS.map(s => <div key={s.id} style={{ height: thickness, background: s.color }} />)}
    </div>
  );
}
