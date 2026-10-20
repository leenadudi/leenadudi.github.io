/** Five strands across the column, used between entries in place of a
 *  hairline. Each divider makes one move from the ride (a loop, a wave, a
 *  twist) and draws itself in when it scrolls into view. */
import { motion, useReducedMotion } from "motion/react";
import { SECTIONS } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { CREAM } from "../lib/tokens";

export type Move = "loop" | "wave" | "twist";
const MOVES: Move[] = ["loop", "wave", "twist"];
export const moveAt = (i: number): Move => MOVES[i % MOVES.length];

const K   = 0.5523;     // cubic-bezier circle constant
const GAP = 9;          // vertical spacing between strands
const SW  = 5;          // strand width
const Y0  = 104;        // y of the top strand
const H   = Y0 + GAP * 4 + 14;

function path(move: Move, i: number, W: number, at: number): string {
  const y = Y0 + i * GAP;
  if (move === "loop") {
    // loop-the-loop: same radius per strand, each loop stepped right and
    // down so they stack like the home drawing
    const r = 44, cx = W * at + i * 13, cy = y - r;
    return [
      `M 0,${y} L ${cx},${y}`,
      `C ${cx + r * K},${y} ${cx + r},${cy + r * K} ${cx + r},${cy}`,
      `C ${cx + r},${cy - r * K} ${cx + r * K},${cy - r} ${cx},${cy - r}`,
      `C ${cx - r * K},${cy - r} ${cx - r},${cy - r * K} ${cx - r},${cy}`,
      `C ${cx - r},${cy + r * K} ${cx - r * K},${y} ${cx},${y}`,
      `L ${W},${y}`,
    ].join(" ");
  }
  if (move === "wave") {
    // four half-waves, strands parallel
    const n = 4, h = W / n, A = 26;
    let d = `M 0,${y}`;
    for (let k = 0; k < n; k++) {
      const x0 = k * h, s = k % 2 ? 1 : -1;
      d += ` C ${x0 + h * 0.36},${y + s * A * 1.33} ${x0 + h * 0.64},${y + s * A * 1.33} ${x0 + h},${y}`;
    }
    return d;
  }
  // twist: each strand is a sine with its own phase under a bell envelope,
  // so the five braid over and under each other in the middle and run
  // flat and parallel at both ends (the ride's coil, in miniature)
  const mid = Y0 + 2 * GAP, A = 34, span = W * 0.5, c = W * at;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 6) {
    const t = Math.min(1, Math.abs(x - c) / (span / 2));
    const env = t >= 1 ? 0 : (1 + Math.cos(Math.PI * t)) / 2;
    const yy = mid + (y - mid) * (1 - env) + A * env * Math.sin(((x - c) / span) * 4 * Math.PI + (i * 2 * Math.PI) / 5);
    pts.push(`${x},${yy.toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
}

export default function StrandDivider({ move = "loop", at = 0.5, style }: {
  move?: Move; at?: number; style?: React.CSSProperties;
}) {
  const narrow = useNarrow();
  const reduce = useReducedMotion();
  const W = narrow ? 520 : 1000;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible", ...style }}>
      {SECTIONS.map((s, i) => {
        const d = path(move, i, W, at);
        const draw = {
          initial: reduce ? false : { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true, amount: 0.6 },
          transition: { duration: 1.4, delay: i * 0.08, ease: [0.65, 0, 0.35, 1] },
        } as const;
        return (
          <g key={s.id}>
            {/* cream underlay so crossings read as one strand passing over another */}
            <motion.path d={d} stroke={CREAM} strokeWidth={SW + 4} fill="none" strokeLinecap="round" strokeLinejoin="round" {...draw} />
            <motion.path d={d} stroke={s.color} strokeWidth={SW} fill="none" strokeLinecap="round" strokeLinejoin="round" {...draw} />
          </g>
        );
      })}
    </svg>
  );
}
