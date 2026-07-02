import { useRef, useLayoutEffect, useState, lazy, Suspense } from "react";
import { useScroll } from "motion/react";
const VibeGraphEmbed = lazy(() => import("./components/VibeGraphEmbed"));

const SECTIONS = [
  { id: "work",     title: "experience", color: "#f56483ff" },
  { id: "projects", title: "projects",   color: "#fea100ff" },
  { id: "research", title: "school",     color: "#c66724ff" },
  { id: "service",  title: "service",    color: "#15484cff" },
  { id: "hobbies",  title: "hobbies",    color: "#31bab2ff" },
];

const SECTION_CONTENT = [
  { bullets: ["role · company · 2024", "role · company · 2023", "role · company · 2022"],         visual: "timeline" },
  { bullets: ["Spotify Vibe Graph · data viz · 2025", "project · description", "project · description"], visual: "screenshots" },
  { bullets: ["university · degree · year", "coursework & research focus", "awards & highlights"], visual: "skills map" },
  { bullets: ["org · role · duration", "org · role · duration", "impact summary"],                 visual: "impact map" },
  { bullets: ["rock climbing · indoor & outdoor", "ceramics · hand-building & glazing", "rollercoasters · obviously"], visual: "photos" },
];

const VW = 1000;
const VH = 600;
const K  = 0.5523;
const SW = 20;

// ── Phase 1 geometry ─────────────────────────────────────────────────────────
const LINE_Y     = [278, 301, 324, 347, 370] as const;
const APP_X      = 365;   // x where the flat strands start curving up into the loop
// Each strand makes its OWN loop; centres are stacked upward and leaned slightly
// right so the five rings nest into an interlocking tower (pink top → teal front).
const LOOP_R     = 58;                              // ring radius (equal → clean nested rings)
const LOOP_CX    = [605, 615, 625, 635, 645] as const;
const LOOP_CY    = [120, 143, 166, 189, 212] as const;
const WAVE_END_X = 870;
const WAVE_TOP_Y = [18, 41, 64, 87, 110] as const;
const DESCENT_R  = [45, 65, 85, 105, 125] as const;
// Each line's x on the right wall
const DX = DESCENT_R.map(dr => WAVE_END_X + dr); // [915,935,955,975,995]

// ── Phase 2 wave geometry ─────────────────────────────────────────────────────
// Lines turn from DOWN→LEFT at P2_TURN_Y using turn radius P2_TR[i].
// Because DX[i] - P2_TR[i] = 865 for all i, all lines arrive at the same
// x after the corner — they bundle vertically and wave together.
const P2_TURN_Y = 130;
const P2_TR     = [50, 70, 90, 110, 130] as const; // turn radii
const P2_AMP    = 95;   // peak wave amplitude (±y at the middle of the coil)
const P2_HW     = 96;   // half-wavelength (horizontal span per half-wave)
// Half-wave count across the coil (same for every strand).  Combined with a
// per-strand PHASE offset (i·2π/5) this makes the strands weave over one another.
// (span = P2_N·P2_HW = 672, so the coil runs from x=865 down to x=193.)
const P2_N      = 7;
// x where each line enters the wave section (all = 865)
const P2_WAVE_X = DX[0] - P2_TR[0]; // 865

// Drop points where each strand turns down and descends. They're ~22px apart
// so the five descents fall as a tight bundle at the far left.
const P2_LOOP_X = [65, 88, 111, 134, 157] as const; // descent x, pink→teal (far left)
const P2_QTR = 18;  // quarter-turn radius (LEFT → DOWN pivot)

// ── Phase 2b: cursive petal flourish (own sticky screen) ─────────────────────
// The strands descend off Phase 2's screen; here they re-enter from the top,
// turn RIGHT, run level, then loop through petals that ALTERNATE above and
// below the midline.  Each petal is one full garland (cycloid) loop
//   x = M·t + R·sin t,  y = cc ± R2·(1 − cos t),  t ∈ [0, 2π]
// which starts and ends ON the midline with a horizontal tangent, so
// consecutive mirrored petals stitch together smoothly and self-cross (M < R).
const P2B_M   = 13;   // rightward march per radian
const P2B_R   = 34;   // horizontal swing (> M ⇒ each petal self-crosses)
const P2B_R2  = 42;   // petal half-height (petal reaches 2·R2 from midline)
const P2B_N   = 4;    // number of petals (up, down, up, down)
const P2B_CC  = 250;  // flourish midline y for pink; each strand nests +22 below
const P2B_RUN = 70;   // level run after the right turn, before the petals

// Phase 3 columns — a strand lands where its post-flourish descent drops.
const CONTACT_X = P2_LOOP_X.map(
  (x) => x + 2 * P2_QTR + P2B_RUN + P2B_M * P2B_N * 2 * Math.PI
);
const FLOOR_Y = 300; // y where strands land in Phase 3

// Label text color: cream on dark columns, warm-dark on light ones
function labelColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 100 ? "#FDF6EC" : "#3d3427";
}

// ── Path builders ─────────────────────────────────────────────────────────────

function phase1Path(i: number): string {
  const y  = LINE_Y[i];
  const wt = WAVE_TOP_Y[i];
  const dr = DESCENT_R[i];
  const dx = DX[i];
  const cx = LOOP_CX[i];
  const cy = LOOP_CY[i];
  const r  = LOOP_R;
  const bot = cy + r;              // loop entry/exit (6 o'clock)
  return [
    `M -50,${y}`, `L ${APP_X},${y}`,
    // flat strand sweeps up to the bottom of this line's own loop
    `C ${cx-130},${y} ${cx-60},${bot} ${cx},${bot}`,
    // full CW circle: bottom → right → top → left → bottom
    `C ${cx+r*K},${bot} ${cx+r},${cy+r*K} ${cx+r},${cy}`,
    `C ${cx+r},${cy-r*K} ${cx+r*K},${cy-r} ${cx},${cy-r}`,
    `C ${cx-r*K},${cy-r} ${cx-r},${cy-r*K} ${cx-r},${cy}`,
    `C ${cx-r},${cy+r*K} ${cx-r*K},${bot} ${cx},${bot}`,
    // leave the loop bottom and sweep up to the wave crest, then descend
    `C ${cx+100},${bot} ${WAVE_END_X-40},${wt} ${WAVE_END_X},${wt}`,
    `C ${WAVE_END_X+dr*K},${wt} ${dx},${wt+dr*(1-K)} ${dx},${wt+dr}`,
    `L ${dx},${VH+10}`,
  ].join(" ");
}

/**
 * Phase 2 path for line i:
 *   enter from top → descend to P2_TURN_Y
 *   → 90° CW arc  DOWN→LEFT  (pivot around corner)
 *   → P2_N sinusoidal half-waves going LEFT (all lines share the same count,
 *     so they travel as one nested ribbon)
 *   → straight run LEFT to this line's own drop x (staggers the loop stack)
 *   → 90° arc  LEFT→DOWN  → CW loop → descend off bottom
 */
function phase2Path(i: number): string {
  const dx = DX[i];
  const tr = P2_TR[i];
  const ey = P2_TURN_Y;
  const cy = ey + tr;       // ribbon centre y for this line
  const wx = P2_WAVE_X;    // 865 — x where wave begins (same for all)

  // ── top turn: DOWN→LEFT, CW quarter-circle ─────────────────────────────
  // Bezier: arrive at (dx,ey) going down, depart (wx,cy) going left
  const topTurn = `C ${dx},${ey + tr*K} ${dx - tr + tr*K},${cy} ${wx},${cy}`;

  // ── coiled wave travelling LEFT ─────────────────────────────────────────
  // Each strand is a sine with its OWN phase (i·2π/5) under a bell envelope
  // that is zero at both ends and peaks in the middle.  Different phases + big
  // amplitude make the strands cross over one another → a woven coil; the
  // envelope funnels them back to their nested centres for the loop stack.
  const span      = P2_N * P2_HW;
  const waveEndX  = wx - span;
  const phi       = i * ((2 * Math.PI) / 5);
  const waveParts: string[] = [];
  for (let x = wx - 6; x > waveEndX; x -= 6) {
    const t   = wx - x;                          // distance travelled left (0…span)
    const env = Math.sin((Math.PI * t) / span);  // 0 at ends, 1 in the middle
    const y   = cy + P2_AMP * env * Math.sin((t * Math.PI) / P2_HW + phi);
    waveParts.push(`L ${x.toFixed(1)},${y.toFixed(1)}`);
  }
  waveParts.push(`L ${waveEndX},${cy}`);         // land back on the nested centre

  // ── straight run LEFT to this line's own loop drop point ────────────────
  // Different run lengths stagger the otherwise-identical loops into a stack.
  const qx     = P2_LOOP_X[i];   // descent x = rightmost point of this loop
  const qStart = qx + P2_QTR;    // x where the quarter-turn begins
  const runToLoop = `L ${qStart},${cy}`;

  // ── tight quarter-turn LEFT → DOWN ──────────────────────────────────────
  const qy = cy + P2_QTR;        // y after pivot
  const quarterTurn =
    `C ${qStart - P2_QTR*K},${cy} ${qx},${cy + P2_QTR*(1-K)} ${qx},${qy}`;

  return [
    `M ${dx},-10`,
    `L ${dx},${ey}`,
    topTurn,
    ...waveParts,
    runToLoop,
    quarterTurn,
    `L ${qx},${VH + 10}`,   // descend off the bottom (flourish is Phase 2b)
  ].join(" ");
}

/**
 * Phase 2b path for line i (own sticky screen — the coil is scrolled away):
 *   enter from top at this strand's descent x
 *   → 90° arc DOWN→RIGHT → level run
 *   → P2B_N alternating petal loops (up, down, up, down)
 *   → 90° arc RIGHT→DOWN → descend off bottom
 */
function phase2bPath(i: number): string {
  const qx  = P2_LOOP_X[i];
  const qtr = P2_QTR;
  const cc  = P2B_CC + i * 22;   // flourish midline (strands nest downward)
  const yv  = cc - qtr;          // where the down→right turn begins
  const xr  = qx + qtr;          // x right after the turn
  const x0  = xr + P2B_RUN;      // petal chain start x

  // down→right quarter-turn: arrive at (qx,yv) going down, leave (xr,cc) right
  const downToRight =
    `C ${qx},${yv + qtr*K} ${xr - qtr*K},${cc} ${xr},${cc}`;

  // alternating petal loops: each petal is one full garland loop that starts
  // and ends on the midline with a horizontal tangent → smooth stitching.
  const petals: string[] = [];
  for (let k = 0; k < P2B_N; k++) {
    const sgn = k % 2 === 0 ? -1 : 1;        // first petal UP (SVG y-down)
    const xk  = x0 + k * 2 * Math.PI * P2B_M;
    for (let t = 0.08; t <= 2 * Math.PI + 1e-6; t += 0.08) {
      const x = xk + P2B_M * t + P2B_R * Math.sin(t);
      const y = cc + sgn * P2B_R2 * (1 - Math.cos(t));
      petals.push(`L ${x.toFixed(1)},${y.toFixed(1)}`);
    }
  }
  const xe = x0 + P2B_N * 2 * Math.PI * P2B_M; // chain end x (back on midline)
  petals.push(`L ${xe.toFixed(1)},${cc}`);

  // right→down quarter-turn, then descend to the bottom
  const rightToDown =
    `C ${xe + qtr*K},${cc} ${xe + qtr},${cc + qtr*(1-K)} ${xe + qtr},${cc + qtr}`;

  return [
    `M ${qx},-10`,
    `L ${qx},${yv}`,     // vertical entry from the top
    downToRight,          // turn right
    ...petals,            // alternating petal flourish
    rightToDown,          // turn back down
    `L ${(xe + qtr).toFixed(1)},${VH + 10}`,
  ].join(" ");
}

// ── Scroll captions ───────────────────────────────────────────────────────────
const easeC = (t: number) => { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); };

/** Little narrator text that fades in at `at` (and optionally out at `fadeOut`)
 *  as the phase's scroll progress `p` advances. Position in % of the screen. */
function Caption({ p, at, fadeOut, x, y, rot = 0, size = "clamp(1.1rem,2.4vw,2rem)", children }: {
  p: number; at: number; fadeOut?: number; x: string; y: string;
  rot?: number; size?: string; children: React.ReactNode;
}) {
  const on  = easeC((p - at) / 0.06);
  const off = fadeOut === undefined ? 1 : 1 - easeC((p - fadeOut) / 0.06);
  return (
    <div className="absolute z-30 pointer-events-none" style={{
      left: x, top: y, opacity: on * off,
      transform: `translateY(${(1 - on) * 16}px) rotate(${rot}deg)`,
      transformOrigin: "left top",
      fontFamily: "'Poppins',sans-serif", fontStyle: "italic", fontWeight: 400,
      fontSize: size, color: "#15484c", letterSpacing: "-0.01em", whiteSpace: "nowrap",
    }}>{children}</div>
  );
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

  // Phase 2b (petal flourish)
  const p2bRef   = useRef<HTMLDivElement>(null);
  const p2bPaths = useRef<(SVGPathElement | null)[]>([]);
  const [p2bLen, setP2bLen] = useState<number[]>([99999,99999,99999,99999,99999]);
  const { scrollYProgress: sp2b } = useScroll({ target: p2bRef, offset: ["start start","end end"] });
  const [p2b, setP2b] = useState(0);
  useLayoutEffect(() => sp2b.on("change", setP2b), [sp2b]);

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
  useLayoutEffect(() => {
    const m = p2bPaths.current.map(el => el?.getTotalLength() ?? 99999);
    if (!m.some(l => l >= 99999))
      setP2bLen(prev => m.every((l,i) => Math.abs(l-prev[i]) < 0.5) ? prev : m);
  });

  const nameOpacity = Math.max(0, 1 - p1 * 10);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  // Phase 2 draws from the moment it enters — the path starts with the
  // vertical stripe segment so the stripe above the wave is always the
  // "already drawn" portion of the animated path (no static lines needed).
  const waveProgress = p2;

  // Phase 3 — stage 1 (0→0.5): strands land + perspective floor grows.
  //           stage 2 (0.5→1): bars cast UP from floor, then widen to full-bleed; floor fades.
  const ease3 = (t: number) => { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); };
  const p3s1 = Math.min(1, p3 / 0.5);
  const p3s2 = Math.max(0, (p3 - 0.5) / 0.5);
  const floorGrow      = ease3(p3s1);                 // ray-clip reveal, stage 1
  const barRise        = ease3(p3s2);                 // bar top: VH → 0 (rises from trapezoid base)
  const floorOpacity   = 1 - ease3(p3s2);             // floor fades as bars rise
  const p3LabelOpacity = ease3((p3s2 - 0.75) / 0.25); // labels last

  return (
    <>
      {/* ── Phase 1: name + M1 knot + M2 wave + M3 descent ── */}
      <div ref={p1Ref} className="relative" style={{ height: "500vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
            style={{ opacity: nameOpacity }}>
            <h1 style={{ fontFamily:"'Poppins',sans-serif", fontStyle:"italic", fontWeight:200,
              fontSize:"clamp(3rem,10vw,8rem)", color:"#15484cff", letterSpacing:"-0.035em", lineHeight:0.92 }}>
              leena dudi
            </h1>
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
          <Caption p={p1} at={0.1}  x="3%"  y="39%">i love rollercoasters :)</Caption>
          <Caption p={p1} at={0.3}  x="42%" y="65%" rot={-20}>wanna take a ride with me?</Caption>
          <Caption p={p1} at={0.7} x="95%" y="6%"  rot={58} size="clamp(1.2rem,2.4vw,2rem)">weeeee</Caption>
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

            {/* Continuity with Phase 1: at progress 0 the strands are full-height
                verticals (matching Phase 1's last frame).  Stage 1 (p<δ): the tail
                below the turn retracts upward — still ONE straight line.  Stage 2:
                only then does the tip curve away into the wave.  At every instant
                each strand is a single unbroken line — never cut, never forked. */}
            {SECTIONS.map((s, i) => {
              const len   = p2Len[i];
              const entry = P2_TURN_Y + 10;               // pre-drawn entry length
              const tail  = VH + 10 - P2_TURN_Y;          // tail below the turn
              const DELTA = 0.08;                         // scroll share for the pull-up
              const pullP = Math.min(1, waveProgress / DELTA);
              const waveP = Math.max(0, (waveProgress - DELTA) / (1 - DELTA));
              return <g key={`wave-${s.id}`}>
                <line x1={DX[i]} y1={P2_TURN_Y} x2={DX[i]} y2={VH + 10}
                  stroke={s.color} strokeWidth={SW}
                  strokeDasharray={tail} strokeDashoffset={tail * pullP} />
                <path ref={el => { p2Paths.current[i] = el; }}
                  d={phase2Path(i)} stroke={s.color} strokeWidth={SW}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={len} strokeDashoffset={Math.max(0, (len - entry)*(1-waveP))} />
              </g>;
            })}
          </svg>
          {/* at=-0.06 ⇒ already fully faded in at progress 0, so it's visible
              from the moment the screen slides in (while the lines are still
              vertical), then fades as the wave takes over */}
          <Caption p={p2} at={-0.03} fadeOut={0.1} x="90%" y="8%" rot={90}>breathe in</Caption>
          <Caption p={p2} at={0.25} x="82%" y="22%" rot={-8}>and out</Caption>
          <Caption p={p2} at={0.88} x="20%" y="55%" rot={90}>everyone deserves a break</Caption>
        </div>
      </div>
      {/* ── Phase 2b: cursive petal flourish (coil scrolled away) ── */}
      <div ref={p2bRef} className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">
            {/* Same continuity trick as Phase 2: full-height at progress 0, tail
                pulls up first, THEN the flourish draws — one unbroken line. */}
            {SECTIONS.map((s, i) => {
              const len   = p2bLen[i];
              const yv    = P2B_CC + i * 22 - P2_QTR;  // turn y (matches phase2bPath)
              const entry = yv + 10;                    // pre-drawn entry length
              const tail  = VH + 10 - yv;
              const qx    = P2_LOOP_X[i];
              const DELTA = 0.08;                       // scroll share for the pull-up
              const pullP = Math.min(1, p2b / DELTA);
              const flowP = Math.max(0, (p2b - DELTA) / (1 - DELTA));
              return <g key={`flourish-${s.id}`}>
                <line x1={qx} y1={yv} x2={qx} y2={VH + 10}
                  stroke={s.color} strokeWidth={SW}
                  strokeDasharray={tail} strokeDashoffset={tail * pullP} />
                <path ref={el => { p2bPaths.current[i] = el; }}
                  d={phase2bPath(i)} stroke={s.color} strokeWidth={SW}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={len} strokeDashoffset={Math.max(0, (len - entry)*(1-flowP))} />
              </g>;
            })}
          </svg>
          <Caption p={p2b} at={0.5} x="43%" y="26%" rot={34} size="clamp(1.3rem,2.8vw,2.4rem)">woah</Caption>
          <Caption p={p2b} at={0.9} x="63%" y="64%" rot={90}>that was unexpected.</Caption>
        </div>
      </div>

      {/* ── Phase 3: strands land → perspective floor → bars cast up → full-bleed columns ── */}
      <div ref={p3Ref} className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 w-screen h-screen overflow-hidden" style={{ background: "#FDF6EC" }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full" overflow="hidden">
            <defs>
              {/* perspective rays reveal — grows downward from the floor during stage 1 */}
              <clipPath id="ray-clip">
                <rect x="0" y={FLOOR_Y} width={VW}
                  height={Math.max(0, floorGrow * (VH - FLOOR_Y + 60))} />
              </clipPath>
            </defs>

            {/* Stage 1: descent strands + perspective floor (fades as bars widen) */}
            <g opacity={floorOpacity}>
              {SECTIONS.map((s, i) => (
                <line key={`p3-line-${s.id}`}
                  x1={CONTACT_X[i]} y1={-10}
                  x2={CONTACT_X[i]} y2={FLOOR_Y}
                  stroke={s.color} strokeWidth={SW} strokeLinecap="round" />
              ))}
              <line x1="0" y1={FLOOR_Y} x2={VW} y2={FLOOR_Y}
                stroke="#d8cbb8" strokeWidth="1.5" />
              <g clipPath="url(#ray-clip)">
                {SECTIONS.map((s, i) => {
                  const cx = CONTACT_X[i];
                  const cl = (i * VW) / 5;
                  const cr = ((i + 1) * VW) / 5;
                  return (
                    <path key={`ray-${s.id}`}
                      d={`M ${cx - SW / 2},${FLOOR_Y} L ${cl},${VH} L ${cr},${VH} L ${cx + SW / 2},${FLOOR_Y} Z`}
                      fill={s.color} />
                  );
                })}
              </g>
            </g>

            {/* Stage 2: bars rise UP from the trapezoid's wide base (full column width) */}
            {SECTIONS.map((s, i) => {
              const cl = (i * VW) / 5;
              const cr = ((i + 1) * VW) / 5;
              const top = VH * (1 - barRise); // VH → 0 (rises from the base upward)
              return (
                <rect key={`col-${s.id}`}
                  x={cl} y={top}
                  width={cr - cl} height={VH - top}
                  fill={s.color} />
              );
            })}
          </svg>
          <Caption p={p3} at={0.08} fadeOut={0.52} x="20%"  y="15%">hope you enjoyed the ride!</Caption>
          <Caption p={p3} at={0.3}  fadeOut={0.52} x="65%" y="25%">now more about me…</Caption>

          {/* Interactive column layer — fades in with animation, handles expand/collapse */}
          <div className="absolute inset-0 flex"
            style={{ opacity: p3LabelOpacity, pointerEvents: p3LabelOpacity > 0 ? "auto" : "none" }}>
            {SECTIONS.map((s, i) => {
              const isActive   = activeSection === i;
              const isCollapsed = activeSection !== null && !isActive;
              return (
                <div
                  key={`icol-${s.id}`}
                  onClick={() => setActiveSection(isActive ? null : i)}
                  style={{
                    flex: isActive ? 5 : isCollapsed ? 0.28 : 1,
                    background: s.color,
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "flex 0.48s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  {/* Label — only visible in default state */}
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500,
                    fontSize: "clamp(1.1rem,2.5vw,2.1rem)", lineHeight: 1.08,
                    letterSpacing: "-0.01em", textTransform: "lowercase",
                    color: labelColor(s.color),
                    pointerEvents: "none",
                    opacity: activeSection === null ? 1 : 0,
                    transition: "opacity 0.15s ease",
                    position: "relative", zIndex: 1,
                  }}>
                    {s.title}
                  </span>

                  {/* Expanded content */}
                  <div style={{
                    position: "absolute", inset: 0,
                    padding: "clamp(1.5rem,3vw,2.5rem)",
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 0.25s ease 0.12s",
                    pointerEvents: isActive ? "auto" : "none",
                    display: "flex", flexDirection: "column", gap: "1.25rem",
                    color: labelColor(s.color), overflow: "hidden",
                  }}>
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600,
                      fontSize: "clamp(1.2rem,2.5vw,1.9rem)", letterSpacing: "-0.02em", lineHeight: 1.05,
                    }}>
                      {s.title}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", flex: 1, minHeight: 0 }}>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5rem" }}>
                        {SECTION_CONTENT[i].bullets.map((b, j) => (
                          <li key={j} style={{ fontSize: "clamp(0.75rem,1.5vw,0.88rem)", paddingLeft: "0.85rem", position: "relative", opacity: 0.9 }}>
                            <span style={{ position: "absolute", left: 0, opacity: 0.55 }}>·</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                      {i === 1 ? (
                        <Suspense fallback={
                          <div style={{ borderRadius:"8px", background:"rgba(255,255,255,0.12)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"0.65rem", letterSpacing:"0.1em", textTransform:"uppercase", opacity:0.45 }}>
                            loading graph…
                          </div>
                        }>
                          <VibeGraphEmbed />
                        </Suspense>
                      ) : (
                        <div style={{
                          borderRadius: "8px", background: "rgba(255,255,255,0.12)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.55,
                        }}>
                          {SECTION_CONTENT[i].visual}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
