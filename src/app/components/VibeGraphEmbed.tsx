import { useEffect, useRef, useState, useMemo } from "react";
import snapshotData from "../../imports/graph-snapshot.json";

// ── Palette ─────────────────────────────────────────────────────────────
function toRgb(color: string) {
  const c = color.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)] as const;
}
function hex(color: string, alpha: number) {
  const [r, g, b] = toRgb(color);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Sequential ramp (magma) - legible on a dark ground. Used for the calm→hype
// spectrum and per-dimension colouring.
const MAGMA = ["#3b0f70", "#8c2981", "#de4968", "#fe9f6d", "#fcfdbf"].map(toRgb);
function rampRGB(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, t)) * (MAGMA.length - 1);
  const i = Math.min(MAGMA.length - 2, Math.floor(x));
  const f = x - i;
  const a = MAGMA[i], b = MAGMA[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}
function ramp(t: number, alpha: number) {
  const [r, g, b] = rampRGB(t);
  return `rgba(${r},${g},${b},${alpha})`;
}
function rampHex(t: number) {
  return "#" + rampRGB(t).map((v) => v.toString(16).padStart(2, "0")).join("");
}

// ── Vibe dimensions (all stored normalised 0..1 in the snapshot) ─────────
const DIMS = [
  "energy", "valence", "danceability", "acousticness", "instrumentalness",
  "liveness", "speechiness", "tempo", "loudness",
] as const;
type Dim = (typeof DIMS)[number];
type ColorBy = "spectrum" | Dim;
const DIM_SHORT: Record<Dim, string> = {
  energy: "energy", valence: "valence", danceability: "dance", acousticness: "acoustic",
  instrumentalness: "instrum.", liveness: "live", speechiness: "speech", tempo: "tempo", loudness: "loud",
};

type TrackNode = {
  id: string; type: string; name: string; artist: string | null;
  msPlayed: number; community: number; x: number; y: number;
  vibe: Record<string, number>;
};
type Edge = { source: string; target: string; weight: number };
type Pt = { x: number; y: number };

function trackSizeR(ms: number, lo: number, hi: number) {
  if (hi === lo) return 3;
  const t = (Math.log(ms + 1) - Math.log(lo + 1)) / (Math.log(hi + 1) - Math.log(lo + 1));
  return 2.6 + t * 8.5;
}

// ── Radar (SVG) ──────────────────────────────────────────────────────────
function Radar({ vibe, color, size = 128 }: { vibe: Record<string, number>; color: string; size?: number }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 16;
  const pt = (i: number, r: number) => {
    const ang = -Math.PI / 2 + (i / DIMS.length) * Math.PI * 2;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r] as const;
  };
  const poly = DIMS.map((d, i) => pt(i, R * Math.max(0, Math.min(1, vibe[d] ?? 0))).join(",")).join(" ");
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon key={g}
          points={DIMS.map((_, i) => pt(i, R * g).join(",")).join(" ")}
          fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={0.6} />
      ))}
      {DIMS.map((d, i) => {
        const [ex, ey] = pt(i, R);
        const [lx, ly] = pt(i, R + 9);
        return (
          <g key={d}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.07)" strokeWidth={0.6} />
            <text x={lx} y={ly} fontSize={6.5} fill="rgba(255,255,255,0.4)"
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">{DIM_SHORT[d]}</text>
          </g>
        );
      })}
      <polygon points={poly} fill={hex(color, 0.28)} stroke={color} strokeWidth={1.3} />
    </svg>
  );
}

// ── Vibe compass ─────────────────────────────────────────────────────────
// A biplot overlay: each arrow points the direction a feature *increases*
// across the UMAP map (from its correlation with the x/y coordinates), so
// position is readable without pretending the axes are single features.
type Loading = { dim: Dim; vx: number; vy: number; mag: number };

function Compass({ loadings, size = 150 }: { loadings: Loading[]; size?: number }) {
  const c = size / 2, R = size / 2 - 30;
  const maxMag = loadings[0]?.mag || 1;

  // Arrow tips + provisional label anchors.
  const arrows = loadings.map((l) => {
    const len = (l.mag / maxMag) * R;
    const ux = l.vx / l.mag, uy = l.vy / l.mag;
    return {
      dim: l.dim,
      ex: c + ux * len, ey: c - uy * len,      // data-y up → screen-y down
      lx: c + ux * (len + 6), ly: c - uy * (len + 6),
      side: (ux >= 0 ? "R" : "L") as "L" | "R",
    };
  });

  // De-collide labels vertically within each side (traits often near-collinear).
  const GAP = 10.5;
  for (const side of ["L", "R"] as const) {
    const group = arrows.filter((a) => a.side === side).sort((a, b) => a.ly - b.ly);
    for (let i = 1; i < group.length; i++) {
      if (group[i].ly - group[i - 1].ly < GAP) group[i].ly = group[i - 1].ly + GAP;
    }
  }

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle cx={c} cy={c} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.6} />
      <circle cx={c} cy={c} r={R / 2} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.6} />
      {arrows.map((a) => {
        const labelX = a.side === "R" ? Math.min(a.lx, size - 2) : Math.max(a.lx, 2);
        return (
          <g key={a.dim}>
            <line x1={c} y1={c} x2={a.ex} y2={a.ey} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
            <circle cx={a.ex} cy={a.ey} r={1.6} fill="rgba(255,255,255,0.6)" />
            {/* leader from tip to displaced label */}
            <line x1={a.ex} y1={a.ey} x2={labelX} y2={a.ly} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
            <text x={labelX} y={a.ly} fontSize={7.5} fill="rgba(255,255,255,0.65)"
              textAnchor={a.side === "R" ? "start" : "end"} dominantBaseline="middle"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">{DIM_SHORT[a.dim]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────
export default function VibeGraphEmbed() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [colorBy, setColorBy] = useState<ColorBy>("spectrum");
  const [showEdges, setShowEdges] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; lines: string[] } | null>(null);

  const tracks = useMemo(
    () => (snapshotData.nodes as TrackNode[]).filter((n) => n.type === "track" && n.vibe),
    []
  );
  const trackIds = useMemo(() => new Set(tracks.map((t) => t.id)), [tracks]);
  const edges = useMemo(
    () => (snapshotData.edges as Edge[]).filter((e) => trackIds.has(e.source) && trackIds.has(e.target)),
    [trackIds]
  );

  // Adjacency for neighbour drill-in.
  const adjacency = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const e of edges) {
      (m.get(e.source) ?? m.set(e.source, []).get(e.source)!).push(e.target);
      (m.get(e.target) ?? m.set(e.target, []).get(e.target)!).push(e.source);
    }
    return m;
  }, [edges]);

  const byId = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);

  // UMAP position (distance = audio-feature similarity).
  const pos = (t: TrackNode): Pt => ({ x: t.x, y: t.y });

  // Vibe spectrum: project each track onto the principal axis (PC1) of the 9-D
  // features — the dominant calm→hype gradient — normalised to 0..1. This is the
  // honest continuous replacement for the (statistically weak) discrete clusters.
  const spectrum = useMemo(() => {
    const map = new Map<string, number>();
    const n = tracks.length, D = DIMS.length;
    if (n === 0) return map;
    const vecs = tracks.map((t) => DIMS.map((d) => t.vibe[d] ?? 0));
    const mean = DIMS.map((_, j) => vecs.reduce((s, v) => s + v[j], 0) / n);
    const cov = DIMS.map(() => new Array(D).fill(0));
    for (const v of vecs) {
      const c = v.map((x, j) => x - mean[j]);
      for (let a = 0; a < D; a++) for (let b = 0; b < D; b++) cov[a][b] += (c[a] * c[b]) / n;
    }
    // Power iteration for the leading eigenvector.
    let vec = DIMS.map((_, i) => (i === 0 ? 1 : 0.1));
    for (let it = 0; it < 100; it++) {
      const nx = new Array(D).fill(0);
      for (let a = 0; a < D; a++) for (let b = 0; b < D; b++) nx[a] += cov[a][b] * vec[b];
      const norm = Math.hypot(...nx) || 1;
      vec = nx.map((x) => x / norm);
    }
    // Orient so higher = more energetic (hype end).
    const eIdx = DIMS.indexOf("energy");
    if (vec[eIdx] < 0) vec = vec.map((x) => -x);
    const proj = vecs.map((v) => v.reduce((s, x, j) => s + (x - mean[j]) * vec[j], 0));
    const lo = Math.min(...proj), hi = Math.max(...proj);
    tracks.forEach((t, i) => map.set(t.id, hi > lo ? (proj[i] - lo) / (hi - lo) : 0.5));
    return map;
  }, [tracks]);

  const colorVal = (t: TrackNode) => (colorBy === "spectrum" ? spectrum.get(t.id) ?? 0.5 : t.vibe[colorBy] ?? 0);

  const msLo = useMemo(() => Math.min(...tracks.map((t) => t.msPlayed)), [tracks]);
  const msHi = useMemo(() => Math.max(...tracks.map((t) => t.msPlayed)), [tracks]);

  // Biplot loadings: correlate each feature with the x/y coords → the direction
  // it increases across the map. Top few (by strength) drive the vibe compass.
  const loadings = useMemo<Loading[]>(() => {
    const n = tracks.length;
    if (n === 0) return [];
    const xs = tracks.map((t) => t.x), ys = tracks.map((t) => t.y);
    const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
    const mx = mean(xs), my = mean(ys);
    const sd = (a: number[], m: number) => Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0)) || 1;
    const sx = sd(xs, mx), sy = sd(ys, my);
    const corr = (v: number[], other: number[], mo: number, so: number) => {
      const mv = mean(v), sv = sd(v, mv);
      let c = 0;
      for (let i = 0; i < n; i++) c += (v[i] - mv) * (other[i] - mo);
      return c / (sv * so);
    };
    return DIMS.map((dim) => {
      const v = tracks.map((t) => t.vibe[dim] ?? 0);
      const vx = corr(v, xs, mx, sx), vy = corr(v, ys, my, sy);
      return { dim, vx, vy, mag: Math.hypot(vx, vy) };
    })
      .sort((a, b) => b.mag - a.mag)
      .slice(0, 5);
  }, [tracks]);

  // Screen-space transform, recomputed each draw and reused for hit-testing.
  const viewRef = useRef<{ X: (x: number) => number; Y: (y: number) => number } | null>(null);

  const redraw = () => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const W = wrap.offsetWidth, H = wrap.offsetHeight;
    if (W < 10 || H < 10) { requestAnimationFrame(redraw); return; }
    const dpr = window.devicePixelRatio ?? 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "#0a0b12";
    ctx.fillRect(0, 0, W, H);

    const PAD = 26;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;
    const scale = Math.min(plotW, plotH) / 2;
    const cx0 = PAD + plotW / 2, cy0 = PAD + plotH / 2;
    const X = (x: number) => cx0 + x * scale;
    const Y = (y: number) => cy0 - y * scale;
    viewRef.current = { X, Y };

    const neighborSet = selected ? new Set(adjacency.get(selected) ?? []) : null;
    const isActive = (t: TrackNode) =>
      selected ? t.id === selected || (neighborSet?.has(t.id) ?? false) : true;
    const anyFocus = selected !== null;

    // Edges
    const drawEdges = showEdges || selected !== null;
    if (drawEdges) {
      for (const e of edges) {
        const a = byId.get(e.source), b = byId.get(e.target);
        if (!a || !b) continue;
        const pa = pos(a), pb = pos(b);
        let col = "rgba(255,255,255,0.05)";
        let w = 0.5;
        if (selected) {
          if (e.source !== selected && e.target !== selected) continue;
          col = "rgba(255,255,255,0.4)"; w = 0.9;
        }
        ctx.strokeStyle = col; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(X(pa.x), Y(pa.y)); ctx.lineTo(X(pb.x), Y(pb.y)); ctx.stroke();
      }
    }

    // Nodes - dimmed pass first, focused pass on top
    const nodeColor = (t: TrackNode, alpha: number) => ramp(colorVal(t), alpha);

    for (const pass of [0, 1]) {
      for (const t of tracks) {
        const active = isActive(t);
        if (anyFocus && (pass === 0) === active) continue;
        if (!anyFocus && pass === 1) continue;
        const p = pos(t);
        const r = trackSizeR(t.msPlayed, msLo, msHi);
        const alpha = anyFocus ? (active ? 0.95 : 0.1) : 0.82;
        ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), r, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor(t, alpha); ctx.fill();
      }
    }

    // Selected node ring + its label
    if (selected) {
      const t = byId.get(selected);
      if (t) {
        const p = pos(t), r = trackSizeR(t.msPlayed, msLo, msHi);
        ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4; ctx.stroke();
      }
    }

  };

  useEffect(redraw);
  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const ro = new ResizeObserver(redraw); ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorBy, showEdges, selected]);

  // Nearest-node hit test in screen space.
  const nodeAt = (mx: number, my: number): TrackNode | null => {
    const v = viewRef.current; if (!v) return null;
    let best: TrackNode | null = null, bestD = Infinity;
    for (const t of tracks) {
      const p = pos(t);
      const r = trackSizeR(t.msPlayed, msLo, msHi) + 4;
      const dx = mx - v.X(p.x), dy = my - v.Y(p.y);
      const d = dx * dx + dy * dy;
      if (d <= r * r && d < bestD) { bestD = d; best = t; }
    }
    return best;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const wrap = wrapRef.current; if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const t = nodeAt(mx, my);
    setHoveredTrack(t?.id ?? null);
    if (t) {
      const hrs = (t.msPlayed / 3_600_000).toFixed(1);
      const label = t.artist ? `${t.artist} · ${t.name}` : t.name ?? "";
      const val = colorVal(t).toFixed(2);
      const metric = colorBy === "spectrum" ? `calm→hype: ${val}` : `${DIM_SHORT[colorBy]}: ${val}`;
      setTooltip({ x: mx + 12, y: my + 12, lines: [label, `${hrs}h listened`, metric] });
    } else {
      setTooltip(null);
    }
  };

  const handleClick = () => {
    const t = hoveredTrack;
    setSelected((prev) => (t && t !== prev ? t : null));
    setTooltip(null);
  };

  const selTrack = selected ? byId.get(selected) ?? null : null;
  const panelVibe = selTrack ? selTrack.vibe : null;
  const panelColor = selTrack ? rampHex(spectrum.get(selTrack.id) ?? 0.5) : "#fff";
  const panelTitle = selTrack ? (selTrack.artist ? `${selTrack.artist} · ${selTrack.name}` : selTrack.name ?? "") : "";
  const neighbors = selected
    ? (adjacency.get(selected) ?? []).map((id) => byId.get(id)).filter(Boolean).slice(0, 6) as TrackNode[]
    : [];

  return (
    <div ref={wrapRef} onMouseMove={handleMouseMove}
      onMouseLeave={() => { setHoveredTrack(null); setTooltip(null); }}
      onClick={handleClick}
      style={{
        position: "relative", width: "100%", height: "100%",
        borderRadius: 8, overflow: "hidden", background: "#0a0b12",
        cursor: hoveredTrack ? "pointer" : "default",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      {/* Controls - top-left */}
      <div onClick={(e) => e.stopPropagation()} style={{
        position: "absolute", top: 9, left: 10, zIndex: 4, display: "flex",
        gap: 6, alignItems: "center", flexWrap: "wrap", maxWidth: "calc(100% - 20px)",
      }}>
        <select value={colorBy} onChange={(e) => setColorBy(e.target.value as ColorBy)} style={selectStyle}>
          <option value="spectrum">colour: calm→hype</option>
          {DIMS.map((d) => <option key={d} value={d}>colour: {DIM_SHORT[d]}</option>)}
        </select>
        <button onClick={() => setShowEdges((s) => !s)}
          style={{ ...chip, opacity: showEdges ? 1 : 0.55 }}>edges</button>
      </div>

      {/* Title - top-right */}
      <div style={{
        position: "absolute", top: 11, right: 12, zIndex: 2, textAlign: "right",
        fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.28)", pointerEvents: "none",
      }}>
        vibe similarity map · {tracks.length} tracks
      </div>

      {/* Legend - continuous gradient scale */}
      <div style={{ ...legendBox, width: 124, cursor: "default", maxHeight: "none" }}>
        <div style={{ marginBottom: 4, color: "rgba(255,255,255,0.55)" }}>
          {colorBy === "spectrum" ? "vibe spectrum" : DIM_SHORT[colorBy]}
        </div>
        <div style={{ height: 8, borderRadius: 3, background: `linear-gradient(90deg, ${MAGMA.map((m, i) => `rgb(${m[0]},${m[1]},${m[2]}) ${(i / (MAGMA.length - 1)) * 100}%`).join(",")})` }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, color: "rgba(255,255,255,0.35)" }}>
          <span>{colorBy === "spectrum" ? "calm" : "low"}</span>
          <span>{colorBy === "spectrum" ? "hype" : "high"}</span>
        </div>
      </div>

      {/* Radar panel - selected track */}
      {panelVibe && (
        <div onClick={(e) => e.stopPropagation()} style={radarBox}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: "#f5f0e8", marginBottom: 2, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{panelTitle}</div>
          <Radar vibe={panelVibe} color={panelColor} />
          {selTrack && (
            <>
              <div style={{ fontSize: 8.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "2px 0 3px" }}>
                nearest vibes
              </div>
              {neighbors.length === 0 && <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)" }}>-</div>}
              {neighbors.map((nb) => (
                <div key={nb.id} onClick={(e) => { e.stopPropagation(); setSelected(nb.id); }}
                  style={{ fontSize: 9.5, color: "rgba(245,240,232,0.75)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "1px 0" }}>
                  <span style={{ color: rampHex(spectrum.get(nb.id) ?? 0.5) }}>•</span> {nb.artist ? `${nb.artist} · ${nb.name}` : nb.name}
                </div>
              ))}
              <button onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                style={{ ...chip, marginTop: 5 }}>clear</button>
            </>
          )}
        </div>
      )}

      {/* Vibe compass - which direction each feature grows (biplot loadings) */}
      {!panelVibe && loadings.length > 0 && (
        <div onClick={(e) => e.stopPropagation()} style={compassBox}>
          <div style={{ fontSize: 8.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>
            vibe compass
          </div>
          <Compass loadings={loadings} />
          <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.28)", lineHeight: 1.3, marginTop: 1 }}>
            arrows point where each trait rises
          </div>
        </div>
      )}

      {/* Hint */}
      {!selected && !hoveredTrack && (
        <div style={{
          position: "absolute", bottom: 10, right: 12, zIndex: 2,
          fontSize: 9.5, color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.05em", textTransform: "uppercase", pointerEvents: "none",
        }}>
          click a track for its neighbours
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y, zIndex: 10,
          background: "rgba(4,4,14,0.92)", border: "1px solid rgba(255,255,255,0.07)",
          color: "#f5f0e8", borderRadius: 7, padding: "7px 11px",
          pointerEvents: "none", maxWidth: 230, boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}>
          {tooltip.lines.map((l, i) => l && (
            <div key={i} style={{ fontWeight: i === 0 ? 600 : 400, opacity: i === 0 ? 1 : 0.55, marginTop: i > 0 ? 2 : 0, fontSize: i === 0 ? 11.5 : 10.5 }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Small UI atoms ───────────────────────────────────────────────────────
const chip: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "3px 9px",
  fontSize: 10.5, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em",
};
const selectStyle: React.CSSProperties = {
  ...chip, appearance: "none", paddingRight: 9,
};
const legendBox: React.CSSProperties = {
  position: "absolute", top: 40, right: 12, zIndex: 3, width: 128,
  maxHeight: "calc(100% - 96px)", overflowY: "auto",
  background: "rgba(4,4,14,0.5)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 7, padding: "7px 9px", fontSize: 10, color: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(3px)",
};
const radarBox: React.CSSProperties = {
  position: "absolute", bottom: 10, left: 10, zIndex: 5, width: 168,
  background: "rgba(4,4,14,0.78)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 9, padding: "9px 11px", boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
  backdropFilter: "blur(5px)",
};
const compassBox: React.CSSProperties = {
  position: "absolute", bottom: 10, left: 10, zIndex: 4, width: 166,
  background: "rgba(4,4,14,0.6)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 9, padding: "8px 10px", backdropFilter: "blur(4px)",
};
