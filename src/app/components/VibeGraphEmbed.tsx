import { useEffect, useRef, useState, useMemo } from "react";
import snapshotData from "../../imports/graph-snapshot.json";

const CLUSTER_COLORS: Record<number, string> = {
  0: "#a4452f", 1: "#5c3a22", 2: "#93d07e",  3: "#cb9a3b", 4: "#b5835a",
  5: "#c8102e", 6: "#176d6d", 7: "#fa2a12",  8: "#8a4fd0", 9: "#5d80a6",
  10: "#f5822e", 11: "#74b9e7", 12: "#ffd21f", 13: "#c3b3e8", 14: "#ec6191",
  15: "#4f7a2a", 16: "#aad8f2",
};
const cc = (id: number) => CLUSTER_COLORS[id] ?? "#888";

function hex(color: string, alpha: number) {
  const c = color.replace("#", "");
  const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type TrackNode = {
  id: string; type: string; name: string; artist: string | null;
  msPlayed: number; community: number; x: number; y: number;
};
type Community = { id: number; label: string; size: number; profile: Record<string,number> };

function trackSizeR(ms: number, lo: number, hi: number) {
  if (hi === lo) return 3;
  const t = (Math.log(ms + 1) - Math.log(lo + 1)) / (Math.log(hi + 1) - Math.log(lo + 1));
  return 2.5 + t * 9;
}

// Sunflower / phyllotaxis jitter — stable per-index position in a unit circle
function sunflowerOffset(idx: number, total: number) {
  const GOLDEN = 2.39996322; // golden angle rad
  const r = Math.sqrt((idx + 0.5) / Math.max(total, 1));
  return { dx: r * Math.cos(idx * GOLDEN), dy: r * Math.sin(idx * GOLDEN) };
}

// ── Scatter map (overview) ────────────────────────────────────────────

interface ClusterHit { id: number; cx: number; cy: number; r: number }

function drawScatterMap(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  communities: Community[],
  allTracks: TrackNode[],
  hoveredId: number | null,
) {
  ctx.fillStyle = "#0a0b12";
  ctx.fillRect(0, 0, W, H);

  const PAD_L = 46, PAD_R = 18, PAD_T = 18, PAD_B = 44;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const px = (e: number) => PAD_L + e * plotW;
  const py = (v: number) => PAD_T + (1 - v) * plotH;

  // Grid lines
  ctx.lineWidth = 0.7;
  for (let v = 0.2; v < 1; v += 0.2) {
    const gx = px(v), gy = py(v);
    ctx.strokeStyle = v === 0.4 || v === 0.6 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.055)";
    ctx.beginPath(); ctx.moveTo(gx, PAD_T); ctx.lineTo(gx, PAD_T + plotH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD_L, gy); ctx.lineTo(PAD_L + plotW, gy); ctx.stroke();
  }

  // Axis frame
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(PAD_L, PAD_T, plotW, plotH);

  // Tick marks + numeric labels on axes
  ctx.font = "8.5px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  for (let v = 0; v <= 1.01; v += 0.25) {
    const gx = px(v);
    const gy = py(v);
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = 1;
    // X ticks
    ctx.beginPath(); ctx.moveTo(gx, PAD_T + plotH); ctx.lineTo(gx, PAD_T + plotH + 4); ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillText(v.toFixed(2), gx, PAD_T + plotH + 13);
    // Y ticks
    ctx.beginPath(); ctx.moveTo(PAD_L - 4, gy); ctx.lineTo(PAD_L, gy); ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(v.toFixed(2), PAD_L - 7, gy + 3);
  }

  // Axis labels
  ctx.font = "10px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  ctx.textAlign = "center";
  ctx.fillText("ENERGY →", PAD_L + plotW / 2, H - 6);
  ctx.save();
  ctx.translate(10, PAD_T + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("← DARK   POSITIVE →", 0, 0);
  ctx.restore();

  // Quadrant corner hints
  ctx.font = "8.5px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.textAlign = "left";  ctx.fillText("calm · happy",    PAD_L + 5, PAD_T + 14);
  ctx.textAlign = "right"; ctx.fillText("hype · happy",    PAD_L + plotW - 5, PAD_T + 14);
  ctx.textAlign = "right"; ctx.fillText("hype · dark",     PAD_L + plotW - 5, PAD_T + plotH - 6);
  ctx.textAlign = "left";  ctx.fillText("slow · dark",     PAD_L + 5, PAD_T + plotH - 6);

  // Build track positions using sunflower jitter around cluster centroid
  const JITTER = 0.055; // radius in energy/valence space
  const clusterTrackMap = new Map<number, TrackNode[]>();
  for (const t of allTracks) {
    const arr = clusterTrackMap.get(t.community) ?? [];
    arr.push(t);
    clusterTrackMap.set(t.community, arr);
  }

  const hits: ClusterHit[] = [];

  // Draw dim pass (non-hovered clusters)
  for (const [cid, tracks] of clusterTrackMap) {
    const c = communities.find(x => x.id === cid);
    if (!c) continue;
    const ce = c.profile.energy  ?? 0.5;
    const cv = c.profile.valence ?? 0.5;
    const isHov = hoveredId === cid;
    if (isHov) continue; // draw hovered last

    for (let i = 0; i < tracks.length; i++) {
      const off = sunflowerOffset(i, tracks.length);
      const ex = ce + off.dx * JITTER;
      const vy = cv + off.dy * JITTER;
      ctx.beginPath();
      ctx.arc(px(ex), py(vy), 2, 0, Math.PI * 2);
      ctx.fillStyle = hoveredId === null ? hex(cc(cid), 0.72) : hex(cc(cid), 0.14);
      ctx.fill();
    }
  }

  // Cluster hit areas and centroid labels (non-hovered)
  ctx.font = "9px 'Plus Jakarta Sans', system-ui, sans-serif";
  for (const c of communities) {
    const isHov = hoveredId === c.id;
    const ce = c.profile.energy  ?? 0.5;
    const cv = c.profile.valence ?? 0.5;
    const cpx = px(ce), cpy = py(cv);
    const hoverR = JITTER * Math.max(plotW, plotH) + 18;
    hits.push({ id: c.id, cx: cpx, cy: cpy, r: hoverR });

    if (!isHov) {
      ctx.textAlign = "center";
      ctx.fillStyle = hoveredId === null ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.12)";
      ctx.fillText(c.label, cpx, cpy - 10);
    }
  }

  // Draw hovered cluster on top
  if (hoveredId !== null) {
    const c = communities.find(x => x.id === hoveredId);
    const tracks = clusterTrackMap.get(hoveredId) ?? [];
    if (c) {
      const ce = c.profile.energy  ?? 0.5;
      const cv = c.profile.valence ?? 0.5;

      // Glow behind cluster
      const gx = px(ce), gy = py(cv);
      const grad = ctx.createRadialGradient(gx, gy, 5, gx, gy, 60);
      grad.addColorStop(0, hex(cc(hoveredId), 0.18));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(gx, gy, 60, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();

      for (let i = 0; i < tracks.length; i++) {
        const off = sunflowerOffset(i, tracks.length);
        const ex = ce + off.dx * JITTER;
        const vy = cv + off.dy * JITTER;
        ctx.beginPath();
        ctx.arc(px(ex), py(vy), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = cc(hoveredId);
        ctx.fill();
      }

      // Prominent label
      ctx.font = "bold 10.5px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(c.label, gx, gy - 14);
      ctx.font = "9px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(`${c.size} tracks`, gx, gy - 4);
    }
  }

  return hits;
}

// ── Cluster detail view ────────────────────────────────────────────────

function drawDetail(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  tracks: TrackNode[],
  edges: { source: string; target: string }[],
  clusterId: number,
  clusterLabel: string,
  hoveredTrack: string | null,
) {
  ctx.fillStyle = "#0d0e14";
  ctx.fillRect(0, 0, W, H);

  // Very subtle cluster color tint
  ctx.fillStyle = hex(cc(clusterId), 0.04);
  ctx.fillRect(0, 0, W, H);

  if (!tracks.length) return;

  const PAD = 40;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const t of tracks) {
    minX = Math.min(minX, t.x); maxX = Math.max(maxX, t.x);
    minY = Math.min(minY, t.y); maxY = Math.max(maxY, t.y);
  }
  const rangeX = Math.max(maxX - minX, 0.01);
  const rangeY = Math.max(maxY - minY, 0.01);

  const tx = (x: number) => PAD + ((x - minX) / rangeX) * (W - 2 * PAD);
  const ty = (y: number) => PAD + ((1 - (y - minY) / rangeY)) * (H - 2 * PAD);

  const allMs = tracks.map(t => t.msPlayed);
  const lo = Math.min(...allMs), hi = Math.max(...allMs);

  // Track id set for fast lookup
  const trackIds = new Set(tracks.map(t => t.id));

  // Edges (within-cluster only)
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = hex(cc(clusterId), 0.18);
  for (const e of edges) {
    if (!trackIds.has(e.source) || !trackIds.has(e.target)) continue;
    const a = tracks.find(t => t.id === e.source);
    const b = tracks.find(t => t.id === e.target);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(tx(a.x), ty(a.y));
    ctx.lineTo(tx(b.x), ty(b.y));
    ctx.stroke();
  }

  // Nodes
  const sorted = [...tracks].sort((a, b) => b.msPlayed - a.msPlayed);
  const labelSet = new Set(sorted.slice(0, 8).map(t => t.id));

  for (const t of tracks) {
    const x = tx(t.x), y = ty(t.y);
    const r = trackSizeR(t.msPlayed, lo, hi);
    const isHov = hoveredTrack === t.id;

    if (isHov) {
      ctx.beginPath();
      ctx.arc(x, y, r + 5, 0, Math.PI * 2);
      ctx.fillStyle = hex(cc(clusterId), 0.2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isHov ? cc(clusterId) : hex(cc(clusterId), 0.85);
    ctx.fill();
  }

  // Labels for top tracks
  ctx.font = "10.5px 'Plus Jakarta Sans', system-ui, sans-serif";
  for (const t of tracks) {
    if (!labelSet.has(t.id)) continue;
    const x = tx(t.x), y = ty(t.y);
    const r = trackSizeR(t.msPlayed, lo, hi);
    const label = t.artist ? `${t.artist} — ${t.name}` : (t.name ?? "");
    const short = label.length > 28 ? label.slice(0, 26) + "…" : label;

    // Backdrop
    const tw = ctx.measureText(short).width;
    ctx.fillStyle = "rgba(8,8,18,0.75)";
    ctx.fillRect(x + r + 4, y - 8, tw + 6, 14);
    ctx.fillStyle = "rgba(245,240,232,0.82)";
    ctx.textAlign = "left";
    ctx.fillText(short, x + r + 7, y + 3);
  }

  // Cluster title
  ctx.font = "bold 13px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillStyle = hex(cc(clusterId), 0.9);
  ctx.textAlign = "left";
  ctx.fillText(clusterLabel, 14, H - 14);
  ctx.font = "10px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText(`${tracks.length} tracks`, 14 + ctx.measureText(clusterLabel).width + 10, H - 14);
}

// ── Main component ─────────────────────────────────────────────────────

export default function VibeGraphEmbed() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  const [activeCluster, setActiveCluster] = useState<number | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; lines: string[] } | null>(null);

  const communities = useMemo(() =>
    (snapshotData.communities as Community[]).sort((a, b) => b.size - a.size),
    []
  );

  const tracks = useMemo(() =>
    (snapshotData.nodes as TrackNode[]).filter(n => n.type === "track"),
    []
  );

  const edges = useMemo(() =>
    snapshotData.edges as { source: string; target: string; weight: number }[],
    []
  );

  const clusterTracks = useMemo(() =>
    activeCluster !== null ? tracks.filter(t => t.community === activeCluster) : [],
    [tracks, activeCluster]
  );

  // Top artists per cluster for tooltip
  const topArtistsByCluster = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const c of communities) {
      const clTracks = tracks.filter(t => t.community === c.id);
      const artistMs = new Map<string, number>();
      for (const t of clTracks) {
        if (t.artist) artistMs.set(t.artist, (artistMs.get(t.artist) ?? 0) + t.msPlayed);
      }
      const top = [...artistMs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(a => a[0]);
      map.set(c.id, top);
    }
    return map;
  }, [communities, tracks]);

  const hitsRef = useRef<ClusterHit[]>([]);

  const redraw = () => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const W = wrap.offsetWidth, H = wrap.offsetHeight;
    if (W < 10 || H < 10) { requestAnimationFrame(redraw); return; }
    const dpr = window.devicePixelRatio ?? 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    if (activeCluster === null) {
      hitsRef.current = drawScatterMap(ctx, W, H, communities, tracks, hoveredCluster);
    } else {
      const label = communities.find(c => c.id === activeCluster)?.label ?? "";
      drawDetail(ctx, W, H, clusterTracks, edges, activeCluster, label, hoveredTrack);
    }
  };

  useEffect(() => { redraw(); });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(redraw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [activeCluster, hoveredCluster, hoveredTrack, communities, clusterTracks, edges]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (activeCluster === null) {
      // Check cluster bubbles
      let found: number | null = null;
      for (const hit of hitsRef.current) {
        const dx = mx - hit.cx, dy = my - hit.cy;
        if (dx * dx + dy * dy <= hit.r * hit.r) { found = hit.id; break; }
      }
      setHoveredCluster(found);
      if (found !== null) {
        const c = communities.find(c => c.id === found)!;
        const artists = topArtistsByCluster.get(found) ?? [];
        setTooltip({
          x: mx + 12, y: my + 12,
          lines: [c.label, `${c.size} tracks`, artists.length ? artists.join(", ") : ""],
        });
      } else {
        setTooltip(null);
      }
    } else {
      // Check track dots
      const W = wrap.offsetWidth, H = wrap.offsetHeight;
      const PAD = 40;
      if (!clusterTracks.length) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const t of clusterTracks) {
        minX = Math.min(minX, t.x); maxX = Math.max(maxX, t.x);
        minY = Math.min(minY, t.y); maxY = Math.max(maxY, t.y);
      }
      const rangeX = Math.max(maxX - minX, 0.01), rangeY = Math.max(maxY - minY, 0.01);
      const tx = (x: number) => PAD + ((x - minX) / rangeX) * (W - 2 * PAD);
      const ty = (y: number) => PAD + ((1 - (y - minY) / rangeY)) * (H - 2 * PAD);
      const allMs = clusterTracks.map(t => t.msPlayed);
      const lo = Math.min(...allMs), hi = Math.max(...allMs);

      let found: TrackNode | null = null;
      for (const t of clusterTracks) {
        const r = trackSizeR(t.msPlayed, lo, hi) + 4;
        const dx = mx - tx(t.x), dy = my - ty(t.y);
        if (dx * dx + dy * dy <= r * r) { found = t; break; }
      }
      setHoveredTrack(found?.id ?? null);
      if (found) {
        const hrs = (found.msPlayed / 3_600_000).toFixed(1);
        const label = found.artist ? `${found.artist} — ${found.name}` : (found.name ?? "");
        setTooltip({ x: mx + 12, y: my + 12, lines: [label, `${hrs}h listened`] });
      } else {
        setTooltip(null);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCluster === null && hoveredCluster !== null) {
      setActiveCluster(hoveredCluster);
      setHoveredCluster(null);
      setTooltip(null);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCluster(null);
    setHoveredTrack(null);
    setTooltip(null);
  };

  const activeLabel = activeCluster !== null
    ? communities.find(c => c.id === activeCluster)?.label
    : null;

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setHoveredCluster(null); setHoveredTrack(null); setTooltip(null); }}
      onClick={handleClick}
      style={{
        position: "relative", width: "100%", height: "100%",
        borderRadius: 8, overflow: "hidden", background: "#0d0e14",
        cursor: activeCluster === null && hoveredCluster !== null ? "pointer" : "default",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      {/* Top-left label */}
      <div style={{
        position: "absolute", top: 10, left: 13, zIndex: 2,
        fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.22)",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        pointerEvents: "none",
      }}>
        {activeCluster === null ? "energy · valence · 630 tracks" : activeLabel}
      </div>

      {/* Back button */}
      {activeCluster !== null && (
        <button onClick={handleBack} style={{
          position: "absolute", top: 8, right: 10, zIndex: 3,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.5)", borderRadius: 5,
          padding: "4px 10px", fontSize: 10.5, cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          letterSpacing: "0.02em",
        }}>
          ← all clusters
        </button>
      )}

      {/* Hint */}
      {activeCluster === null && hoveredCluster === null && (
        <div style={{
          position: "absolute", bottom: 10, right: 12, zIndex: 2,
          fontSize: 9.5, color: "rgba(255,255,255,0.18)",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          letterSpacing: "0.05em", textTransform: "uppercase",
          pointerEvents: "none",
        }}>
          click a cluster to explore
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y, zIndex: 10,
          background: "rgba(4,4,14,0.92)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "#f5f0e8", borderRadius: 7,
          padding: "7px 11px", fontSize: 11.5,
          pointerEvents: "none", maxWidth: 220,
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          backdropFilter: "blur(4px)",
        }}>
          {tooltip.lines.map((l, i) => l && (
            <div key={i} style={{
              fontWeight: i === 0 ? 600 : 400,
              opacity: i === 0 ? 1 : 0.55,
              marginTop: i > 0 ? 2 : 0,
              fontSize: i === 0 ? 11.5 : 10.5,
            }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
