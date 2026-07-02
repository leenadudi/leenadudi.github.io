import { useRef, useLayoutEffect, useState } from "react";
import { useScroll } from "motion/react";

const SECTIONS = [
  { id: "work",     title: "Work Experience", color: "#F04878" },
  { id: "projects", title: "Projects",        color: "#F09820" },
  { id: "research", title: "Research",        color: "#A85C2A" },
  { id: "service",  title: "Service",         color: "#2D9B68" },
  { id: "hobbies",  title: "Hobbies",         color: "#2898A8" },
];

const VW = 1000;
const VH = 600;
const K  = 0.5523;
const SW = 20;

// ── Phase 1 geometry ─────────────────────────────────────────────────────────
const LINE_Y     = [278, 315, 352, 389, 426] as const;
const KX         = 630;
const KY         = 178;
const R          = 80;
const BOT        = KY + R;
const APP_X      = KX - 265;
const WAVE_END_X = 870;
const WAVE_TOP_Y = [18, 52, 86, 120, 154] as const;
const DESCENT_R  = [45, 65, 85, 105, 125] as const;
// Each line's x on the right wall
const DX = DESCENT_R.map(dr => WAVE_END_X + dr); // [915,935,955,975,995]

// ── Phase 2 wave geometry ─────────────────────────────────────────────────────
// Lines turn from DOWN→LEFT at P2_TURN_Y using turn radius P2_TR[i].
// Because DX[i] - P2_TR[i] = 865 for all i, all lines arrive at the same
// x after the corner — they bundle vertically and wave together.
const P2_TURN_Y = 130;
const P2_TR     = [50, 70, 90, 110, 130] as const; // turn radii
const P2_AMP    = 70;   // wave amplitude (±y from centre)
const P2_HW     = 95;   // half-wavelength (horizontal span per hump)
// Each line does a different number of half-waves before its loop,
// staggering the loop positions from left (pink, most waves) to right (teal, fewest).
// waveEndX per line = 865 - n*95: [295, 390, 485, 580, 675]
const P2_N_PER  = [6, 5, 4, 3, 2] as const;
// x where each line enters the wave section (all = 865)
const P2_WAVE_X = DX[0] - P2_TR[0]; // 865

// Small end-loop: after the waves, make a tight quarter-turn LEFT→DOWN
// then a small CW circle (entered at the 3-o'clock / rightmost position
// while going DOWN), then descend.  Same radius for every line.
const P2_QTR = 18;  // quarter-turn radius (LEFT → DOWN pivot)
const P2_LR  = 28;  // small loop radius

// Phase 3 floor perspective
// Contact x per line = where the post-loop descent column lands
const CONTACT_X = P2_N_PER.map((n) => (P2_WAVE_X - n * P2_HW) - P2_QTR);
// → [277, 372, 467, 562, 657]
const FLOOR_Y = 280; // y where lines hit the "floor" in Phase 3

// ── Path builders ─────────────────────────────────────────────────────────────

function phase1Path(i: number): string {
  const y  = LINE_Y[i];
  const wt = WAVE_TOP_Y[i];
  const dr = DESCENT_R[i];
  const dx = DX[i];
  return [
    `M -50,${y}`, `L ${APP_X},${y}`,
    `C ${KX-130},${y} ${KX-60},${BOT} ${KX},${BOT}`,
    `C ${KX+R*K},${BOT} ${KX+R},${KY+R*K} ${KX+R},${KY}`,
    `C ${KX+R},${KY-R*K} ${KX+R*K},${KY-R} ${KX},${KY-R}`,
    `C ${KX-R*K},${KY-R} ${KX-R},${KY-R*K} ${KX-R},${KY}`,
    `C ${KX-R},${KY+R*K} ${KX-R*K},${BOT} ${KX},${BOT}`,
    `C ${KX+100},${BOT} ${WAVE_END_X-40},${wt} ${WAVE_END_X},${wt}`,
    `C ${WAVE_END_X+dr*K},${wt} ${dx},${wt+dr*(1-K)} ${dx},${wt+dr}`,
    `L ${dx},${VH+10}`,
  ].join(" ");
}

/**
 * Phase 2 path for line i:
 *   enter from top → descend to P2_TURN_Y
 *   → 90° CW arc  DOWN→LEFT  (pivot around corner)
 *   → N sinusoidal half-waves going LEFT (bundle waves together)
 *   → 90° arc     LEFT→DOWN
 *   → descend off bottom
 */
function phase2Path(i: number): string {
  const dx = DX[i];
  const tr = P2_TR[i];
  const ey = P2_TURN_Y;
  const cy = ey + tr;       // wave centre y for this line
  const wx = P2_WAVE_X;    // 865 — x where wave begins (same for all)

  // ── top turn: DOWN→LEFT, CW quarter-circle ─────────────────────────────
  // Bezier: arrive at (dx,ey) going down, depart (wx,cy) going left
  const topTurn = `C ${dx},${ey + tr*K} ${dx - tr + tr*K},${cy} ${wx},${cy}`;

  // ── sinusoidal wave travelling LEFT ────────────────────────────────────
  const n = P2_N_PER[i];
  const waveParts: string[] = [];
  for (let w = 0; w < n; w++) {
    const x0    = wx - w * P2_HW;
    const x1    = wx - (w + 1) * P2_HW;
    const ydir  = w % 2 === 0 ? -1 : 1; // first hump goes UP
    const yPeak = cy + ydir * P2_AMP;
    waveParts.push(
      `C ${x0 - P2_HW * 0.3},${yPeak} ${x1 + P2_HW * 0.3},${yPeak} ${x1},${cy}`
    );
  }

  // wave ends here
  const waveEndX = wx - n * P2_HW;

  // ── tight quarter-turn LEFT → DOWN ──────────────────────────────────────
  // Pivots from going-left to going-down over a small radius (P2_QTR).
  const qx = waveEndX - P2_QTR;  // x after pivot
  const qy = cy + P2_QTR;        // y after pivot
  const quarterTurn =
    `C ${waveEndX - P2_QTR*K},${cy} ${qx},${cy + P2_QTR*(1-K)} ${qx},${qy}`;

  // ── small CW loop entered at 3-o'clock (rightmost) going DOWN ───────────
  // At the rightmost point of a CW circle the tangent is downward,
  // so the line flows in smoothly from the pivot above.
  // Circle center = (qx - P2_LR, qy).
  const lx = qx;                // rightmost = entry = (qx, qy)
  const lcx = qx - P2_LR;      // loop center x
  const lcy = qy;               // loop center y (same height as entry)
  const lr  = P2_LR;

  const loop = [
    // right → bottom
    `C ${lx},${lcy + lr*K}         ${lcx + lr*K},${lcy + lr}  ${lcx},${lcy + lr}`,
    // bottom → left
    `C ${lcx - lr*K},${lcy + lr}   ${lcx - lr},${lcy + lr*K}  ${lcx - lr},${lcy}`,
    // left → top
    `C ${lcx - lr},${lcy - lr*K}   ${lcx - lr*K},${lcy - lr}  ${lcx},${lcy - lr}`,
    // top → right (back to entry, now going DOWN again)
    `C ${lcx + lr*K},${lcy - lr}   ${lx},${lcy - lr*K}        ${lx},${lcy}`,
  ].join(" ");

  return [
    `M ${dx},-10`,
    `L ${dx},${ey}`,
    topTurn,
    ...waveParts,
    quarterTurn,
    loop,
    `L ${qx},${VH + 10}`,
  ].join(" ");
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function App() {
  // Phase 1
  const p1Ref   = useRef<HTMLDivElement>(null);
  const p1Paths = useRef<(SVGPathElement | null)[]>([]);
  const [p1Len, setP1Len] = useState<number[]>([99999,99999,99999,99999,99999]);
  const { scrollYProgress: sp1 } = useScroll({ target: p1Ref, offset: ["start start","end end"] });
  const [p1, setP1] = useState(0);
  useLayoutEffect(() => sp1.on("change", setP1), [sp1]);

  // Phase 3
  const p3Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sp3 } = useScroll({ target: p3Ref, offset: ["start start","end end"] });
  const [p3, setP3] = useState(0);
  useLayoutEffect(() => sp3.on("change", setP3), [sp3]);

  // Phase 2
  const p2Ref   = useRef<HTMLDivElement>(null);
  const p2Paths = useRef<(SVGPathElement | null)[]>([]);
  const [p2Len, setP2Len] = useState<number[]>([99999,99999,99999,99999,99999]);
  const { scrollYProgress: sp2 } = useScroll({ target: p2Ref, offset: ["start start","end end"] });
  const [p2, setP2] = useState(0);
  useLayoutEffect(() => sp2.on("change", setP2), [sp2]);

  useLayoutEffect(() => {
    const m = p1Paths.current.map(el => el?.getTotalLength() ?? 99999);
    if (!m.some(l => l >= 99999))
      setP1Len(prev => m.every((l,i) => Math.abs(l-prev[i]) < 0.5) ? prev : m);
  });
  useLayoutEffect(() => {
    const m = p2Paths.current.map(el => el?.getTotalLength() ?? 99999);
    if (!m.some(l => l >= 99999))
      setP2Len(prev => m.every((l,i) => Math.abs(l-prev[i]) < 0.5) ? prev : m);
  });

  const nameOpacity = Math.max(0, 1 - p1 * 10);

  // Phase 2 draws from the moment it enters — the path starts with the
  // vertical stripe segment so the stripe above the wave is always the
  // "already drawn" portion of the animated path (no static lines needed).
  const waveProgress = p2;

  return (
    <>
      {/* ── Phase 1: name + M1 knot + M2 wave + M3 descent ── */}
      <div ref={p1Ref} className="relative" style={{ height: "500vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
            style={{ opacity: nameOpacity }}>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontWeight:200,
              fontSize:"clamp(3rem,10vw,8rem)", color:"#1a1208", letterSpacing:"-0.035em", lineHeight:0.92 }}>
              leena dudi
            </h1>
            <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:400,
              fontSize:"0.65rem", letterSpacing:"0.32em", color:"#a08c70",
              marginTop:"2rem", textTransform:"uppercase" }}>
              scroll to explore
            </p>
          </div>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">
            {SECTIONS.map((s, i) => {
              const len = p1Len[i];
              return <path key={s.id} ref={el => { p1Paths.current[i] = el; }}
                d={phase1Path(i)} stroke={s.color} strokeWidth={SW}
                fill="none" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={len} strokeDashoffset={Math.max(0, len*(1-p1))} />;
            })}
          </svg>
          <div className="absolute bottom-0 left-0 h-px z-40" style={{
            width:`${p1*100}%`,
            background:"linear-gradient(90deg,#F04878,#F09820,#A85C2A,#2D9B68,#2898A8)",
            opacity:Math.min(1,p1*6) }} />
        </div>
      </div>

      {/* ── Phase 2: right-wall stripes + sinusoidal wave animation ── */}
      <div ref={p2Ref} className="relative" style={{ height: "400vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">

            {/* Animated path only — stripe + turn + wave + descent.
                The already-drawn portion acts as the visible stripe above the wave. */}
            {SECTIONS.map((s, i) => {
              const len = p2Len[i];
              return <path key={`wave-${s.id}`} ref={el => { p2Paths.current[i] = el; }}
                d={phase2Path(i)} stroke={s.color} strokeWidth={SW}
                fill="none" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={len} strokeDashoffset={Math.max(0, len*(1-waveProgress))} />;
            })}
          </svg>
        </div>
      </div>
      {/* ── Phase 3: floor + perspective rays fanning to column widths ── */}
      <div ref={p3Ref} className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">
            <defs>
              {/* clip for Phase 2 paths — only visible above the floor */}
              <clipPath id="above-floor">
                <rect x="0" y="-10" width={VW} height={FLOOR_Y + 10} />
              </clipPath>
              {/* clip for perspective rays — grows downward from the floor */}
              <clipPath id="ray-clip">
                <rect x="0" y={FLOOR_Y}
                  width={VW}
                  height={Math.max(0, p3 * (VH - FLOOR_Y + 60))} />
              </clipPath>
            </defs>

            {/* Straight descent lines — continuation of Phase 2's post-loop descent */}
            {SECTIONS.map((s, i) => (
              <line key={`p3-line-${s.id}`}
                x1={CONTACT_X[i]} y1={-10}
                x2={CONTACT_X[i]} y2={FLOOR_Y}
                stroke={s.color} strokeWidth={SW} strokeLinecap="round" />
            ))}

            {/* Thin floor line */}
            <line x1="0" y1={FLOOR_Y} x2={VW} y2={FLOOR_Y}
              stroke="#d8cbb8" strokeWidth="1.5" />

            {/* Perspective trapezoids — fan from contact point to full column width */}
            <g clipPath="url(#ray-clip)">
              {SECTIONS.map((s, i) => {
                const cx = CONTACT_X[i];
                const cl = i * VW / 5;
                const cr = (i + 1) * VW / 5;
                return (
                  <path key={`ray-${s.id}`}
                    d={`M ${cx - SW/2},${FLOOR_Y} L ${cl},${VH} L ${cr},${VH} L ${cx + SW/2},${FLOOR_Y} Z`}
                    fill={s.color} />
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
