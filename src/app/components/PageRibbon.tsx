/**
 * PageRibbon: the five strands as a thin ribbon that makes one gesture per
 * page in empty space, then runs down the right gutter into the footer band.
 *
 * Section pages: the ribbon enters off the left edge above the title, does the
 * page's move (wave, loop, braid, coil) to the right of the title, turns down
 * the right gutter and runs off the bottom. Phones: the gesture only.
 * Home: the ride's opening move in the empty column beside the name, then the
 * same descent.
 *
 * Anchors: data-rb="title" (page title), data-rb="hero-loop" (home column),
 * data-rb="hero-cta" (home buttons row).
 */
import { useEffect, useState, type RefObject } from "react";
import { SECTIONS } from "../content";

export type Move = "wave" | "loop" | "braid" | "coil" | "loop2";
export const MOVES: Record<string, Move> = {
  experience: "wave", projects: "loop", school: "braid", service: "coil", hobbies: "loop2",
};

const N = SECTIONS.length;
const K = 0.5523;
const f = (v: number) => v.toFixed(1);

type Geo = { sw: number; gap: number; r: number; r0: number };
export function geometry(W: number): Geo {
  if (W < 768)  return { sw: 6,  gap: 9,  r: 26, r0: 26 };
  if (W < 1100) return { sw: 8,  gap: 12, r: 30, r0: 34 };
  return         { sw: 10, gap: 15, r: 38, r0: 44 };
}

/** Sinusoid from x0 to x1 for strand i (baseline y). */
function sine(i: number, x0: number, x1: number, y: number, amp: number, lambda: number, phi: number, begin: boolean): string[] {
  const pts: string[] = [];
  const span = x1 - x0;
  for (let x = x0; x <= x1 + 0.5; x += 6) {
    const t = (x - x0) / span;
    const env = Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
    const yy = y + amp * env * Math.sin((2 * Math.PI * (x - x0)) / lambda + phi);
    pts.push(`${begin && x === x0 ? "M" : "L"} ${f(x)},${f(yy)}`);
  }
  void i;
  return pts;
}

/** Nested loop tower at cx: strand i loops around (cx + lean·i, y_i - r). */
function loop(i: number, cx: number, y: number, r: number, lean: number): string[] {
  const x = cx + lean * i;
  return [`L ${f(x)},${f(y)}`, `a ${r},${r} 0 1 0 0,${f(-2 * r)}`, `a ${r},${r} 0 1 0 0,${f(2 * r)}`];
}

/**
 * Turn from a rightward run at height y into a descent, ride-style: strand i
 * turns with radius r0 + i·gap so the bundle stays nested, then runs to yEnd.
 */
function descend(i: number, xTurn: number, y: number, g: Geo, yEnd: number): string[] {
  const dr = g.r0 + i * g.gap;
  const x = xTurn + dr;
  return [
    `L ${f(xTurn)},${f(y)}`,
    `C ${f(xTurn + dr * K)},${f(y)} ${f(x)},${f(y + dr * (1 - K))} ${f(x)},${f(y + dr)}`,
    `L ${f(x)},${f(yEnd)}`,
  ];
}

type Plan = { W: number; H: number; g: Geo; paths: string[] };

function rect(el: Element, root: DOMRect): DOMRect {
  const r = el.getBoundingClientRect();
  return new DOMRect(r.left - root.left, r.top - root.top, r.width, r.height);
}

function plan(main: HTMLElement, move: Move): Plan | null {
  const root = main.getBoundingClientRect();
  const W = main.clientWidth, H = main.scrollHeight;
  const g = geometry(W);
  const narrow = W < 768;
  const q = (sel: string) => main.querySelector<HTMLElement>(`[data-rb="${sel}"]`);
  const title = q("title"), heroLoop = q("hero-loop"), heroCta = q("hero-cta");
  const OFF = 80;
  const half = (2 * g.gap + g.sw / 2);
  const lean = g.gap * 0.55;

  // content column and the right gutter lane
  const colEl = title ?? heroCta ?? heroLoop;
  if (!colEl) return null;
  const colParent = colEl.closest("main > * > div, main > div") as HTMLElement | null;
  const col = rect(colParent ?? colEl, root);
  const cl = col.left + Math.max(20, rect(colEl, root).left - col.left);
  const cr = col.right - (cl - col.left);
  const gutterW = W - cr;
  const bundle = 4 * g.gap + g.sw;
  const laneFits = !narrow && gutterW >= bundle + 24;
  // descent: strand 0 lands at xTurn + r0; the bundle should sit centred in the gutter
  const xTurn = cr + (gutterW - bundle) / 2 - g.r0;

  const paths: string[] = [];

  if (heroLoop && !narrow) {
    // ── Home: the ride's opening move inside the empty column ──────────
    const L = rect(heroLoop, root);
    const r = Math.max(28, Math.min(g.r + 8, L.height * 0.16));
    const yLow  = L.top + L.height * 0.78;
    const yHigh = L.top + L.height * 0.30;
    const x0 = L.left + 10;
    const cx = L.left + L.width * 0.42;
    for (let i = 0; i < N; i++) {
      const yl = yLow + i * g.gap, yh = yHigh + i * g.gap;
      const lx = cx + lean * i, bot = yh + 2 * r + (yLow - yHigh) * 0.25;
      const cy = bot - r;
      const p = [
        `M ${f(x0)},${f(yl)}`,
        `C ${f(lx - 150)},${f(yl)} ${f(lx - 70)},${f(bot)} ${f(lx)},${f(bot)}`,
        `C ${f(lx + r * K)},${f(bot)} ${f(lx + r)},${f(cy + r * K)} ${f(lx + r)},${f(cy)}`,
        `C ${f(lx + r)},${f(cy - r * K)} ${f(lx + r * K)},${f(cy - r)} ${f(lx)},${f(cy - r)}`,
        `C ${f(lx - r * K)},${f(cy - r)} ${f(lx - r)},${f(cy - r * K)} ${f(lx - r)},${f(cy)}`,
        `C ${f(lx - r)},${f(cy + r * K)} ${f(lx - r * K)},${f(bot)} ${f(lx)},${f(bot)}`,
        `C ${f(lx + 90)},${f(bot)} ${f(xTurn - 60)},${f(yh)} ${f(xTurn)},${f(yh)}`,
        ...(laneFits ? descend(i, xTurn, yh, g, H + OFF).slice(1) : [`L ${f(W + OFF)},${f(yh)}`]),
      ];
      paths.push(p.join(" "));
    }
    return { W, H, g, paths };
  }

  if (heroCta && !title) {
    // ── Home on phones: one band with a loop under the buttons ─────────
    const c = rect(heroCta, root);
    const y = c.bottom + 2 * g.r + half + 24;
    for (let i = 0; i < N; i++) {
      const yi = y + (i - 2) * g.gap;
      paths.push([`M ${f(-OFF)},${f(yi)}`, ...loop(i, W * 0.5, yi, g.r, lean), `L ${f(W + OFF)},${f(yi)}`].join(" "));
    }
    return { W, H, g, paths };
  }

  if (!title) return null;

  // ── Section page: gesture above the title, then down the right gutter ──
  const t = rect(title, root);
  const y = t.top - half - 22;                       // centre line of the run
  const xEnd = laneFits ? xTurn : W + OFF;
  const featL = Math.max(t.right + 40, W * 0.42);    // feature area, right of the title
  const featR = Math.min(xEnd - 30, W - 30);
  for (let i = 0; i < N; i++) {
    const yi = y + (i - 2) * g.gap;
    let p: string[] = [`M ${f(-OFF)},${f(yi)}`];
    if (move === "wave") {
      p = sine(i, -OFF, featR, yi, 26, 300, i * 0.5, true);
    } else if (move === "braid") {
      p = sine(i, -OFF, featR, yi, 30 * (i % 2 ? -1 : 1), 520, 0, true);
    } else if (move === "coil") {
      p = sine(i, -OFF, featR, yi, 30, 200, (i * 2 * Math.PI) / N, true);
    } else if (move === "loop") {
      const cx = Math.min(featL + 60, featR - g.r - lean * N - 20);
      p.push(...loop(i, cx, yi, g.r, lean));
    } else {
      const cx1 = Math.min(featL + 40, featR - 3 * g.r - lean * N - 40);
      p.push(...loop(i, cx1, yi, g.r, lean), ...loop(i, cx1 + 2 * g.r + lean * N + 30, yi, g.r, lean));
    }
    p.push(...(laneFits ? descend(i, xTurn, yi, g, H + OFF) : [`L ${f(W + OFF)},${f(yi)}`]));
    paths.push(p.join(" "));
  }
  return { W, H, g, paths };
}

/** Draws the ribbon behind `mainRef`'s content. Re-plans on resize and content changes. */
export default function PageRibbon({ mainRef, move }: { mainRef: RefObject<HTMLElement | null>; move: Move }) {
  const [state, setState] = useState<Plan | null>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    let raf = 0;
    const run = () => setState(plan(main, move));
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); };
    run();
    const ro = new ResizeObserver(schedule);
    ro.observe(main);
    main.querySelectorAll("[data-rb]").forEach(el => ro.observe(el));
    window.addEventListener("resize", schedule);
    const t = setTimeout(run, 400); // fonts settle a moment after mount
    return () => { ro.disconnect(); window.removeEventListener("resize", schedule); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [mainRef, move]);

  if (!state) return null;
  return (
    <svg aria-hidden width={state.W} height={state.H} viewBox={`0 0 ${state.W} ${state.H}`}
      style={{ position: "absolute", top: 0, left: 0, width: state.W, height: state.H, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {state.paths.map((d, i) => (
        <path key={SECTIONS[i].id} d={d} stroke={SECTIONS[i].color} strokeWidth={state.g.sw}
          fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/** Five thin lines stacked, for the page foot. */
export function LineBand({ thickness = 4 }: { thickness?: number }) {
  return (
    <div aria-hidden style={{ display: "flex", flexDirection: "column" }}>
      {SECTIONS.map(s => <div key={s.id} style={{ height: thickness, background: s.color }} />)}
    </div>
  );
}
