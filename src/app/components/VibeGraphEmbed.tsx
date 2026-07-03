import { useEffect, useRef, useState } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import snapshotData from "../../imports/graph-snapshot.json";

const CLUSTER_COLORS: Record<number, string> = {
  0: "#a4452f", 1: "#5c3a22", 2: "#93d07e",  3: "#cb9a3b", 4: "#b5835a",
  5: "#c8102e", 6: "#176d6d", 7: "#fa2a12",  8: "#8a4fd0", 9: "#5d80a6",
  10: "#f5822e", 11: "#74b9e7", 12: "#ffd21f", 13: "#c3b3e8", 14: "#ec6191",
  15: "#4f7a2a", 16: "#aad8f2",
};
function clusterColor(c: number): string {
  return CLUSTER_COLORS[c] ?? "#888";
}

function sizeScale(ms: number, lo: number, hi: number): number {
  if (hi === lo) return 4;
  const t = (Math.log(ms + 1) - Math.log(lo + 1)) / (Math.log(hi + 1) - Math.log(lo + 1));
  return 3 + t * 11; // 3–14px
}

interface Tip { x: number; y: number; label: string; sub: string }

export default function VibeGraphEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef     = useRef<Sigma | null>(null);
  const [tip, setTip]   = useState<Tip | null>(null);

  const communities = (snapshotData.communities as { id: number; label: string; size: number }[])
    .sort((a, b) => b.size - a.size);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const trackNodes = (snapshotData.nodes as {
      id: string; type: string; name: string; artist: string | null;
      msPlayed: number; community: number; x: number; y: number;
    }[]).filter(n => n.type === "track");

    const allMs = trackNodes.map(n => n.msPlayed);
    const lo = Math.min(...allMs), hi = Math.max(...allMs);

    let sigma: Sigma | null = null;
    let hoverComm: number | null = null;
    let resizeTimer = 0;
    let initialized = false;

    function buildGraph(): Graph {
      const g = new Graph({ type: "undirected", multi: false, allowSelfLoops: false });
      trackNodes.forEach(n => {
        g.addNode(n.id, {
          label: n.artist ? `${n.artist} — ${n.name}` : n.name,
          x: n.x, y: n.y,
          size: sizeScale(n.msPlayed, lo, hi),
          color: clusterColor(n.community),
          community: n.community,
          msPlayed: n.msPlayed,
        });
      });
      for (const e of snapshotData.edges as { source: string; target: string; weight: number }[]) {
        if (g.hasNode(e.source) && g.hasNode(e.target) && !g.hasEdge(e.source, e.target))
          g.addEdge(e.source, e.target, { weight: e.weight });
      }
      return g;
    }

    function initSigma() {
      if (initialized) return;
      if ((el.offsetWidth ?? 0) < 120 || (el.offsetHeight ?? 0) < 120) return;
      initialized = true;

      const graph = buildGraph();
      const labelById = new Map<number, string>(communities.map(c => [c.id, c.label]));
      const commOf = (node: string) => Number(graph.getNodeAttribute(node, "community"));

      sigma = new Sigma(graph, el, {
        defaultEdgeColor: "rgba(255,255,255,0.06)",
        renderEdgeLabels: false,
        labelRenderedSizeThreshold: 12,
        labelSize: 11,
        labelColor: { color: "#f5f0e8" },
      });
      sigmaRef.current = sigma;

      sigma.setSetting("nodeReducer", (node, data) => {
        if (hoverComm !== null && commOf(node) !== hoverComm)
          return { ...data, color: "#1e1e2a", label: "", zIndex: 0 };
        return data;
      });
      sigma.setSetting("edgeReducer", (edge, data) => {
        if (hoverComm !== null &&
            (commOf(graph.source(edge)) !== hoverComm || commOf(graph.target(edge)) !== hoverComm))
          return { ...data, hidden: true };
        return data;
      });

      sigma.on("enterNode", ({ node }) => {
        const attr = graph.getNodeAttributes(node);
        const disp = sigma!.getNodeDisplayData(node);
        const vp   = disp ? sigma!.graphToViewport(disp) : { x: 0, y: 0 };
        hoverComm = commOf(node);
        sigma!.refresh();
        const hrs = (Number(attr.msPlayed) / 3_600_000).toFixed(1);
        setTip({ x: vp.x, y: vp.y,
          label: String(attr.label),
          sub: `${labelById.get(hoverComm) ?? "cluster"} · ${hrs}h listened` });
      });
      sigma.on("leaveNode", () => { hoverComm = null; sigma!.refresh(); setTip(null); });

      sigma.on("clickNode", ({ node }) => {
        const comm = commOf(node);
        const pts: { x: number; y: number }[] = [];
        for (const n of graph.filterNodes(n => commOf(n) === comm)) {
          const d = sigma!.getNodeDisplayData(n);
          if (d) pts.push({ x: d.x, y: d.y });
        }
        if (!pts.length) return;
        let mnX = Infinity, mnY = Infinity, mxX = -Infinity, mxY = -Infinity;
        for (const p of pts) { mnX = Math.min(mnX, p.x); mnY = Math.min(mnY, p.y); mxX = Math.max(mxX, p.x); mxY = Math.max(mxY, p.y); }
        const span = Math.max(mxX - mnX, mxY - mnY, 0.01);
        const ratio = Math.min(1, Math.max(0.05, span / 0.7));
        sigma!.getCamera().animate({ x: (mnX + mxX) / 2, y: (mnY + mxY) / 2, ratio }, { duration: 600 });
      });
      sigma.on("clickStage", () => {
        hoverComm = null; sigma!.refresh();
        sigma!.getCamera().animatedReset({ duration: 500 });
      });
    }

    // Wait for the column to finish expanding before initializing Sigma.
    // The ResizeObserver fires as the flex animation runs; once the container
    // is large enough we init once, then just call resize() on subsequent changes.
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!initialized) { initSigma(); return; }
        sigma?.resize();
      }, 30);
    });
    ro.observe(el);
    initSigma(); // also try immediately

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimer);
      sigma?.kill();
      sigmaRef.current = null;
      setTip(null);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 8, overflow: "hidden", background: "#0d0e14" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* cluster legend */}
      <div style={{
        position: "absolute", top: 8, right: 8, bottom: 8,
        width: 148, overflowY: "auto",
        background: "rgba(10,10,20,0.72)", borderRadius: 6,
        padding: "8px 10px", zIndex: 2,
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>
          Vibe clusters
        </div>
        {communities.map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, padding: "1px 0", cursor: "default" }}>
            <span style={{ width: 8, height: 8, flexShrink: 0, borderRadius: 2, background: clusterColor(c.id) }} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#ddd" }}>{c.label}</span>
            <span style={{ color: "#666", fontSize: 10 }}>{c.size}</span>
          </div>
        ))}
      </div>

      {/* reset button */}
      <button
        onClick={() => sigmaRef.current?.getCamera().animatedReset({ duration: 500 })}
        style={{
          position: "absolute", bottom: 10, left: 10, zIndex: 2,
          background: "rgba(10,10,20,0.72)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#bbb", borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer",
        }}
      >
        Reset view
      </button>

      <div style={{
        position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
        color: "rgba(255,255,255,0.3)", fontSize: 10, pointerEvents: "none",
        zIndex: 2, whiteSpace: "nowrap",
      }}>
        hover to highlight · click to zoom cluster
      </div>

      {tip && (
        <div style={{
          position: "absolute", left: tip.x + 12, top: tip.y + 12,
          background: "rgba(5,5,12,0.90)", color: "#f5f0e8",
          padding: "6px 10px", borderRadius: 5, fontSize: 11.5,
          lineHeight: 1.5, pointerEvents: "none", zIndex: 3, maxWidth: 240,
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontWeight: 500 }}>{tip.label}</div>
          <div style={{ opacity: 0.65, marginTop: 1 }}>{tip.sub}</div>
        </div>
      )}
    </div>
  );
}
