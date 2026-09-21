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
type Metrics = { W: number; H: number; narrow: boolean };

function rect(el: Element, root: DOMRect): DOMRect {
  const r = el.getBoundingClientRect();
  return new DOMRect(r.left - root.left, r.top - root.top, r.width, r.height);
}

function planRoute(main: HTMLElement, m: Metrics): Route | null {
  const root = main.getBoundingClientRect();
  const q = (sel: string) => Array.from(main.querySelectorAll<HTMLElement>(`[data-rb="${sel}"]`));
  const title = q("title")[0];
  const heroLoop = q("hero-loop")[0];
  const heroCta = q("hero-cta")[0];
  const crosses = q("cross").map(el => rect(el, root));
  const index = q("index")[0];
  const rows = q("row").map(el => rect(el, root));
  const { W, H, narrow } = m;
  const R = narrow ? 44 : 80;
  const loopR = narrow ? 30 : 46;
  const OFF = 120; // off-screen run-in

  // content column edges
  const colEl = title ?? heroCta ?? heroLoop;
  if (!colEl) return null;
  const colParent = colEl.closest("main > * > div, main > div") as HTMLElement | null;
  const col = rect(colParent ?? colEl, root);
  const gutter = narrow ? 20 : Math.max(20, rect(colEl, root).left - col.left);
  const cl = col.left + gutter, cr = col.right - gutter;
  const xR = W - cr >= 130 ? cr + 70 : W - 36;
  const xL = cl >= 130 ? cl - 70 : 36;

  const legs: Leg[] = [];
  let start: Pt;
  let side: "R" | "L" = "R";
  let fan: Fan | undefined;

  if (heroLoop && !narrow) {
    // Home: come in under the buttons, rise in the empty right column into the
    // tower beside the name, exit high on the right.
    const L = rect(heroLoop, root);
    const c = heroCta ? rect(heroCta, root) : L;
    const yLow = Math.max(c.bottom + 46, L.top + L.height * 0.85);
    const yHigh = L.top + L.height * 0.55;
    start = { x: -OFF, y: yLow };
    legs.push({ to: { x: L.left - 30, y: yLow } });
    legs.push({ to: { x: L.left + 150, y: yHigh }, kind: "step" });
    legs.push({ to: { x: xR, y: yHigh }, loops: [{ x: L.left + L.width * 0.55, r: Math.min(56, L.height * 0.18) }] });
  } else if (heroCta) {
    // Home on phones: start under the buttons, small loop, descend the right edge.
    const c = rect(heroCta, root);
    const y = c.bottom + 44;
    start = { x: -OFF, y };
    legs.push({ to: { x: xR, y }, loops: [{ x: W * 0.5, r: loopR }] });
  } else if (title) {
    // Section page: pass behind the title, loop to its right, descend on the right.
    const t = rect(title, root);
    const y = t.top + t.height * 0.62;
    const maxX = xR - R - loopR - lean(narrow) * 4 - 10;      // last x where the tower still fits
    const loopX = Math.min(narrow ? Math.max(t.right + 24, W * 0.5) : Math.max(t.right + 110, cr - 260), maxX);
    start = { x: -OFF, y };
    legs.push({ to: { x: xR, y }, loops: loopX > t.right + 10 ? [{ x: loopX, r: loopR }] : [] });
  } else {
    return null;
  }

  // Cross the page at every gap, alternating sides.
  let lastY = legs[legs.length - 1].to.y;
  for (const c of crosses) {
    const y = c.top;
    if (y - lastY < 2 * R + 40) continue;        // too close to the previous corner
    const from = side === "R" ? xR : xL;
    const to   = side === "R" ? xL : xR;
    legs.push({ to: { x: from, y } });
    legs.push({ to: { x: to, y } });
    side = side === "R" ? "L" : "R";
    lastY = y;
  }

  const xEnd = side === "R" ? xR : xL;
  if (index && rows.length === N) {
    // Home: cross above the index to the left margin, then fan out under the rows.
    const ix = rect(index, root);
    const fr = narrow ? 34 : 60;
    const yCross = ix.top - (narrow ? 56 : 80);
    if (side === "R") {
      legs.push({ to: { x: xR, y: yCross } });
      legs.push({ to: { x: xL, y: yCross } });
    }
    const ys = rows.map(r => r.bottom + (narrow ? 6 : 10));
    legs.push({ to: { x: xL, y: ys[0] - fr - 4 } });
    fan = { ys, toX: cr, r: fr };
  } else {
    // Run off the bottom into the footer band.
    legs.push({ to: { x: xEnd, y: H + OFF } });
  }
  return { start, legs, radius: R, fan };
}

const lean = (narrow: boolean) => (narrow ? 5 : 8);

/** Draws the ribbon behind `mainRef`'s content. Re-plans on resize and content changes. */
export default function PageRibbon({ mainRef, narrow }: { mainRef: RefObject<HTMLElement | null>; narrow: boolean }) {
  const [state, setState] = useState<{ W: number; H: number; paths: string[] } | null>(null);

  // A passive effect: the parent's ref is attached by the time it runs.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    let raf = 0;
    const plan = () => {
      const W = main.clientWidth, H = main.scrollHeight;
      const route = planRoute(main, { W, H, narrow });
      if (!route) { setState(null); return; }
      const gap = narrow ? 8.5 : 12;
      setState({ W, H, paths: strandPaths(route, gap, lean(narrow)) });
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
  const sw = narrow ? 10 : 14;
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
