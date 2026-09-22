/**
 * PageRibbon: one continuous five-strand ribbon that runs through a whole page.
 *
 * The route is built from the real positions of the content: it comes in off
 * the left edge behind the page title, rises into a loop tower, descends down
 * one margin, crosses the page at every gap between entries (alternating
 * sides), and runs off the bottom into the footer band. Content is drawn on
 * top of it, so it weaves around and behind the text.
 *
 * Anchors are plain data attributes on the page:
 *   data-rb="title"      the page title (the ribbon passes behind it)
 *   data-rb="hero-loop"  where the home page's loop tower goes
 *   data-rb="hero-cta"   home page on phones: start below this row
 *   data-rb="cross"      an element whose top edge is a gap to cross at
 *   data-rb="index"      home page: the section list (the ribbon crosses above it)
 *   data-rb="row"        home page: a section title; strand i underlines row i
 */
import { useEffect, useState, type RefObject } from "react";
import { SECTIONS } from "../content";

type Pt = { x: number; y: number };
type Dir = { x: number; y: number }; // unit, axis-aligned
type Loop = { x: number; r: number };
type Leg = { to: Pt; kind?: "line" | "step"; loops?: Loop[] };
type Fan = { ys: number[]; toX: number; r: number };   // strand i peels off rightward at ys[i]
type Route = { start: Pt; legs: Leg[]; radius: number; fan?: Fan };

const N = SECTIONS.length;

function dirOf(a: Pt, b: Pt, kind: Leg["kind"]): Dir {
  if (kind === "step") return { x: Math.sign(b.x - a.x) || 1, y: 0 };
  const dx = b.x - a.x, dy = b.y - a.y;
  return Math.abs(dx) >= Math.abs(dy) ? { x: Math.sign(dx) || 1, y: 0 } : { x: 0, y: Math.sign(dy) || 1 };
}
const leftN = (d: Dir): Dir => ({ x: d.y, y: -d.x });           // left-hand normal (screen coords)
const add = (p: Pt, d: Dir, k: number): Pt => ({ x: p.x + d.x * k, y: p.y + d.y * k });
const f = (v: number) => v.toFixed(1);

/**
 * Turn a centre-line route into one SVG path per strand. Strand i rides at a
 * signed lateral offset d_i = (2 - i) * gap (positive = left of travel), so on
 * a rightward leg strand 0 is on top; corners get per-strand radii so the
 * bundle stays nested through every turn, like the ride.
 */
function strandPaths(route: Route, gap: number, lean: number): string[] {
  const out: string[][] = Array.from({ length: N }, () => []);
  const d = (i: number) => (2 - i) * gap;
  const R = route.radius;
  const legs = route.legs;
  const pts: Pt[] = [route.start, ...legs.map(l => l.to)];
  const dirs: Dir[] = legs.map((l, k) => dirOf(pts[k], pts[k + 1], l.kind));

  const turnAt = (k: number) => k > 0 && k < legs.length && (dirs[k - 1].x !== dirs[k].x || dirs[k - 1].y !== dirs[k].y);

  // start points
  {
    const A = dirs[0], n = leftN(A);
    for (let i = 0; i < N; i++) {
      const p = add(route.start, n, d(i));
      out[i].push(`M ${f(p.x)},${f(p.y)}`);
    }
  }

  for (let k = 0; k < legs.length; k++) {
    const leg = legs[k];
    const A = dirs[k], n = leftN(A);
    const from = turnAt(k) ? add(pts[k], A, R) : pts[k];
    const to   = turnAt(k + 1) ? add(pts[k + 1], A, -R) : pts[k + 1];

    if (leg.kind === "step") {
      // smooth horizontal-tangent step (offsets are vertical throughout)
      const cx = (to.x - from.x) * 0.5;
      for (let i = 0; i < N; i++) {
        const o = d(i) * n.y;
        out[i].push(`C ${f(from.x + cx)},${f(from.y + o)} ${f(to.x - cx)},${f(to.y + o)} ${f(to.x)},${f(to.y + o)}`);
      }
    } else {
      // loops along a horizontal leg, in travel order
      const loops = [...(leg.loops ?? [])].sort((a, b) => (a.x - b.x) * A.x);
      for (const lp of loops) {
        for (let i = 0; i < N; i++) {
          const y = from.y + d(i) * n.y;
          const x = lp.x + lean * i * A.x;          // tower leans in the travel direction
          const sweep = A.x > 0 ? 0 : 1;            // up the far side, over the top, back down
          out[i].push(`L ${f(x)},${f(y)}`);
          out[i].push(`a ${lp.r},${lp.r} 0 1 ${sweep} 0,${f(-2 * lp.r)}`);
          out[i].push(`a ${lp.r},${lp.r} 0 1 ${sweep} 0,${f(2 * lp.r)}`);
        }
      }
      for (let i = 0; i < N; i++) {
        const p = add(to, n, d(i));
        out[i].push(`L ${f(p.x)},${f(p.y)}`);
      }
    }

    // rounded corner into the next leg
    if (turnAt(k + 1)) {
      const B = dirs[k + 1];
      const cross = A.x * B.y - A.y * B.x;          // > 0: clockwise on screen
      const K = pts[k + 1];
      const nB = leftN(B);
      for (let i = 0; i < N; i++) {
        const cw = cross > 0;
        const Ri = cw ? R + d(i) : R - d(i);
        // arc end = point on leg B, R along from the corner, offset by the strand's lateral position
        const end = add(add(K, B, R), nB, d(i));
        out[i].push(`A ${f(Ri)},${f(Ri)} 0 0 ${cw ? 1 : 0} ${f(end.x)},${f(end.y)}`);
      }
    }
  }
  // Fan-out: from a downward leg, each strand turns right at its own row and
  // runs under it. Strand 0 is rightmost on a downward leg, so it turns first
  // and nobody crosses anybody.
  if (route.fan) {
    const { ys, toX, r } = route.fan;
    const A = dirs[dirs.length - 1], n = leftN(A);
    const end = pts[pts.length - 1];
    for (let i = 0; i < N; i++) {
      const y = ys[i] ?? ys[ys.length - 1];
      const x = end.x + n.x * d(i);
      out[i].push(`L ${f(x)},${f(y - r)}`);
      out[i].push(`A ${f(r)},${f(r)} 0 0 0 ${f(x + r)},${f(y)}`);
      out[i].push(`L ${f(toX)},${f(y)}`);
    }
  }
  return out.map(cmds => cmds.join(" "));
}

// ── Route planning from the DOM ─────────────────────────────────────────────
// The ribbon only travels through empty space: above the page title, down the
// gutters beside the content, across the gaps between entries, and (on the
// home page) inside the empty column beside the name and under the intro.
type Metrics = { W: number; H: number; narrow: boolean; compact: boolean };

function rect(el: Element, root: DOMRect): DOMRect {
  const r = el.getBoundingClientRect();
  return new DOMRect(r.left - root.left, r.top - root.top, r.width, r.height);
}

export function geometry(narrow: boolean, compact: boolean) {
  const small = narrow || compact;
  return {
    gap: small ? 8.5 : 12,      // strand spacing
    sw: small ? 10 : 14,        // stroke width
    half: small ? 22 : 31,      // half the bundle width
    R: small ? 44 : 80,         // corner radius (centre line)
    loopR: small ? 30 : 46,     // loop radius
    lean: small ? 5 : 8,
    fanR: small ? 34 : 60,
  };
}

function planRoute(main: HTMLElement, m: Metrics): Route | null {
  const root = main.getBoundingClientRect();
  const q = (sel: string) => Array.from(main.querySelectorAll<HTMLElement>(`[data-rb="${sel}"]`));
  const title = q("title")[0];
  const hero = q("hero")[0];
  const heroLoop = q("hero-loop")[0];
  const heroCta = q("hero-cta")[0];
  const crosses = q("cross").map(el => rect(el, root));
  const rows = q("row").map(el => rect(el, root));
  const { W, H, narrow, compact } = m;
  const g = geometry(narrow, compact);
  const { R, loopR, half } = g;
  const OFF = 120; // off-screen run-in

  // content column edges (the ribbon's lanes live outside them)
  const colEl = title ?? heroCta ?? heroLoop;
  if (!colEl) return null;
  const colParent = colEl.closest("main > * > div, main > div") as HTMLElement | null;
  const col = rect(colParent ?? colEl, root);
  const gutter = Math.max(20, rect(colEl, root).left - col.left);
  const cl = col.left + gutter, cr = col.right - gutter;
  const laneR = W - cr, laneL = cl;                     // gutter widths
  const xR = laneR >= 2 * half + 40 ? cr + half + 40 : W - half - 6;
  const xL = laneL >= 2 * half + 40 ? cl - half - 40 : half + 6;
  const lanesFit = !narrow && xR - half >= cr + 2 && xL + half <= cl - 2;

  const legs: Leg[] = [];
  let start: Pt;
  let side: "R" | "L" = "R";
  let fan: Fan | undefined;

  if (hero && rows.length === N) {
    // ── Home ────────────────────────────────────────────────────────────
    const h = rect(hero, root);
    const c = heroCta ? rect(heroCta, root) : h;
    if (heroLoop && !narrow) {
      // In from the right edge, loop in the empty column beside the name, dive
      // down inside that column, sweep left under the intro, then fan out.
      const L = rect(heroLoop, root);
      const r = Math.min(loopR + 10, L.height * 0.18);
      const yHigh = L.top + L.height * 0.5;
      const xDive = L.left + half + 40;
      const yBand = Math.max(h.bottom, c.bottom) + half + 40;
      start = { x: W + OFF, y: yHigh };
      legs.push({ to: { x: xDive, y: yHigh }, loops: [{ x: Math.max(xDive + R + r + 40, L.left + L.width * 0.55), r }] });
      legs.push({ to: { x: xDive, y: yBand } });
      legs.push({ to: { x: xL, y: yBand } });
    } else {
      // Phone: in from the right under the buttons, loop, over to the left lane.
      const yBand = c.bottom + half + 84;
      start = { x: W + OFF, y: yBand };
      legs.push({ to: { x: xL, y: yBand }, loops: [{ x: Math.max(W * 0.55, xL + R + loopR + 40), r: loopR }] });
    }
    const ys = rows.map(rw => rw.bottom + (narrow ? 6 : 10));
    legs.push({ to: { x: xL, y: ys[0] - g.fanR - 4 } });
    fan = { ys, toX: cr, r: g.fanR };
    return { start, legs, radius: R, fan };
  }

  if (!title) return null;

  // ── Section page ──────────────────────────────────────────────────────
  // Flourish above the title: in from the left, loop tower to the right of
  // the title, out to the right lane (or off the right edge on phones).
  const t = rect(title, root);
  const y = t.top - half - (narrow ? 14 : 18);
  const endX = lanesFit ? xR : W + OFF;
  const maxX = endX - R - loopR - g.lean * 4 - 10;
  const loopX = Math.min(narrow || compact ? Math.max(t.right + 30, W * 0.55) : Math.max(t.right + 110, cr - 260), maxX);
  start = { x: -OFF, y };
  legs.push({ to: { x: endX, y }, loops: loopX > t.right + 10 ? [{ x: loopX, r: loopR }] : [] });
  if (!lanesFit) return { start, legs, radius: R };

  // Down the right lane; cross the page at every gap between entries.
  let lastY = y;
  for (const cx of crosses) {
    const cy = cx.top;
    if (cy - lastY < 2 * R + 40) continue;
    const from = side === "R" ? xR : xL;
    const to   = side === "R" ? xL : xR;
    legs.push({ to: { x: from, y: cy } });
    legs.push({ to: { x: to, y: cy } });
    side = side === "R" ? "L" : "R";
    lastY = cy;
  }
  legs.push({ to: { x: side === "R" ? xR : xL, y: H + OFF } });
  return { start, legs, radius: R };
}

/** Draws the ribbon behind `mainRef`'s content. Re-plans on resize and content changes. */
export default function PageRibbon({ mainRef, narrow }: { mainRef: RefObject<HTMLElement | null>; narrow: boolean }) {
  const [state, setState] = useState<{ W: number; H: number; sw: number; paths: string[] } | null>(null);

  // A passive effect: the parent's ref is attached by the time it runs.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    let raf = 0;
    const plan = () => {
      const W = main.clientWidth, H = main.scrollHeight;
      const compact = W < 1100;
      const route = planRoute(main, { W, H, narrow, compact });
      if (!route) { setState(null); return; }
      const g = geometry(narrow, compact);
      setState({ W, H, sw: g.sw, paths: strandPaths(route, g.gap, g.lean) });
    };
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(plan); };
    plan();
    const ro = new ResizeObserver(schedule);
    ro.observe(main);
    main.querySelectorAll("[data-rb]").forEach(el => ro.observe(el));
    window.addEventListener("resize", schedule);
    // fonts settle a moment after mount
    const t = setTimeout(plan, 400);
    return () => { ro.disconnect(); window.removeEventListener("resize", schedule); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [mainRef, narrow]);

  if (!state) return null;
  const sw = state.sw;
  return (
    <svg aria-hidden width={state.W} height={state.H} viewBox={`0 0 ${state.W} ${state.H}`}
      style={{ position: "absolute", top: 0, left: 0, width: state.W, height: state.H, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {state.paths.map((d, i) => (
        <path key={SECTIONS[i].id} d={d} stroke={SECTIONS[i].color} strokeWidth={sw}
          fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
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
