/** Five strands across the column, used between entries in place of a
 *  hairline. Each divider makes one move from the ride (a loop, a wave, a
 *  hump) and draws itself in when it scrolls into view. */
import { motion, useReducedMotion } from "motion/react";
import { SECTIONS } from "../content";
import { useNarrow } from "../hooks/useMediaQuery";
import { CREAM } from "../lib/tokens";

export type Move = "loop" | "wave" | "hump";
const MOVES: Move[] = ["loop", "wave", "hump"];
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
  // hump: flat, sweep up to a crest, run along it, drop back down
  const a = W * at - W * 0.22, b = W * at + W * 0.22, top = y - 64;
  return [
    `M 0,${y} L ${a - 90},${y}`,
    `C ${a - 30},${y} ${a - 30},${top} ${a + 40},${top}`,
    `L ${b - 40},${top}`,
    `C ${b + 30},${top} ${b + 30},${y} ${b + 90},${y}`,
    `L ${W},${y}`,
  ].join(" ");
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
            <motion.path d={d} stroke={CREAM} strokeWidth={SW + 4} fill="none" strokeLinecap="round" {...draw} />
            <motion.path d={d} stroke={s.color} strokeWidth={SW} fill="none" strokeLinecap="round" {...draw} />
          </g>
        );
      })}
    </svg>
  );
}
