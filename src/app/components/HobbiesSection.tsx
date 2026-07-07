import { useEffect, useRef } from "react";
import { geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";

// ── Static content ────────────────────────────────────────────────────────────

const BASKETBALL_ESSAY = [
  "As I slip my feet into my shoes, I grab the red and blue striped basketball and place it comfortably in my left arm. I stretch my hamstrings, do a couple of lunges, and dribble up and down my driveway to get ready for my performance. I click \"play\" on my Spotify favorite and, as the first beat drops, take my first jumpshot. The coordination of the swish and the beat of my music encourages me to continue.",
  "Every day my show is different, consisting of a different mix of moves — layups, threes, and crossovers — all based on the music playing in my ear.",
  "Although my knee has restricted me from playing competitively, I have not given up the delight I get from basketball. I've come to think of it as the one place where I can express every part of myself — not to be seen, just to be felt.",
];

// Placeholder pins — swap [lat, lon] for real destinations
const TRAVEL_PINS: { name: string; lat: number; lon: number }[] = [
  { name: "add a place →", lat: 40.7, lon: -74.0 },
  { name: "add a place →", lat: 51.5, lon: -0.1 },
  { name: "add a place →", lat: 28.6, lon: 77.2 },
];

const READING: { title: string; author: string }[] = [
  { title: "Add title", author: "Author" },
  { title: "Add title", author: "Author" },
];

const ALBUMS: { title: string; artist: string }[] = [
  { title: "Add album", artist: "Artist" },
  { title: "Add album", artist: "Artist" },
  { title: "Add album", artist: "Artist" },
  { title: "Add album", artist: "Artist" },
  { title: "Add album", artist: "Artist" },
];

// ── Globe ─────────────────────────────────────────────────────────────────────

function Globe({ ink }: { ink: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a ref so ResizeObserver can access world without re-registering
  const worldRef  = useRef<ReturnType<typeof feature> | null>(null);
  const rotRef    = useRef<[number, number]>([0, -20]);
  const dragRef   = useRef<{ x: number; y: number; rot: [number, number] } | null>(null);
  const rafRef    = useRef<number>(0);

  // Always-fresh paint function stored in a ref — safe to call from ResizeObserver / rAF
  const paintRef = useRef<() => void>(null!);
  paintRef.current = () => {
    const canvas = canvasRef.current;
    const world  = worldRef.current;
    if (!canvas || !world) return;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (!W || !H) return; // not laid out yet — ResizeObserver will fire again

    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const R = Math.min(W, H) / 2 - 6;

    const proj = geoOrthographic()
      .scale(R)
      .translate([W / 2, H / 2])
      .rotate(rotRef.current)
      .clipAngle(90);

    const path = geoPath(proj, ctx);

    // Ocean sphere
    ctx.beginPath();
    path({ type: "Sphere" });
      ctx.fillStyle = rgba(ink, 0.1);
      ctx.fill();

      // Graticule (subtle grid)
      const gratCoords: number[][][] = [];
      for (let lon = -180; lon <= 180; lon += 30) {
        const line: number[][] = [];
        for (let lat = -90; lat <= 90; lat += 5) line.push([lon, lat]);
        gratCoords.push(line);
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const line: number[][] = [];
        for (let lon = -180; lon <= 180; lon += 5) line.push([lon, lat]);
        gratCoords.push(line);
      }
      ctx.beginPath();
      gratCoords.forEach(coords => {
        path({ type: "LineString", coordinates: coords } as GeoJSON.LineString);
      });
      ctx.strokeStyle = rgba(ink, 0.08);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Countries
      ctx.beginPath();
      path(world as GeoJSON.FeatureCollection);
      ctx.fillStyle   = rgba(ink, 0.22);
      ctx.strokeStyle = rgba(ink, 0.45);
      ctx.lineWidth   = 0.6;
      ctx.fill();
      ctx.stroke();

      // Globe outline
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = rgba(ink, 0.35);
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Travel pins
      TRAVEL_PINS.forEach(pin => {
        const pt = proj([pin.lon, pin.lat]);
        if (!pt) return;
        const [px, py] = pt;
        const λ = (pin.lon - rotRef.current[0]) * Math.PI / 180;
        const φ = pin.lat * Math.PI / 180;
        if (Math.cos(φ) * Math.cos(λ) < 0) return;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = ink;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ink, 0.4);
        ctx.lineWidth = 1;
        ctx.stroke();
      });
  };

  // Fetch topology; store in ref so ResizeObserver can access it without re-registering
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((topo: Topology) => {
        worldRef.current = feature(topo, topo.objects.countries as Parameters<typeof feature>[1]);
        paintRef.current();
      });
  }, []);

  // ResizeObserver — redraws whenever canvas gets real dimensions (e.g. during section-open animation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => paintRef.current());
    });
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Drag to rotate
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, rot: [...rotRef.current] as [number, number] };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    rotRef.current = [
      dragRef.current.rot[0] + dx * 0.4,
      Math.max(-90, Math.min(90, dragRef.current.rot[1] - dy * 0.4)),
    ];
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => paintRef.current());
  };

  const onPointerUp = () => { dragRef.current = null; };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ width: "100%", height: "100%", cursor: "grab", display: "block", touchAction: "none" }}
    />
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export default function HobbiesSection({ ink }: { ink: string }) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2rem" }}
    >
      {/* Basketball essay */}
      <div>
        <ColLabel ink={ink}>basketball</ColLabel>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontStyle: "italic",
          fontSize: "clamp(1.05rem,2vw,1.3rem)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          color: ink,
          opacity: 0.9,
          marginBottom: "0.75rem",
        }}>
          a few words about basketball
        </div>
        <div style={{
          borderLeft: `2.5px solid ${rgba(ink, 0.35)}`,
          paddingLeft: "1.1rem",
          display: "flex", flexDirection: "column", gap: "0.85rem",
        }}>
          {BASKETBALL_ESSAY.map((para, i) => (
            <p key={i} style={{
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontStyle: "italic",
              fontSize: "clamp(0.88rem,1.55vw,1rem)",
              lineHeight: 1.75,
              color: ink,
              opacity: 1,
            }}>
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Globe + sidebar */}
      <div style={{ display: "flex", gap: "2rem", minHeight: "320px" }}>

        {/* Globe */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
          <ColLabel ink={ink}>travel — drag to explore</ColLabel>
          <div style={{ flex: 1, borderRadius: "12px", overflow: "hidden", background: rgba(ink, 0.05), border: `1px solid ${rgba(ink, 0.15)}` }}>
            <Globe ink={ink} />
          </div>
        </div>

        {/* Reading + Albums */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.8rem" }}>

          <div>
            <ColLabel ink={ink}>currently reading</ColLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {READING.map((book, i) => (
                <div key={i} style={{ opacity: 0.4 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontStyle: "italic", fontSize: "clamp(0.84rem,1.45vw,0.96rem)", color: ink, lineHeight: 1.3 }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: "clamp(0.74rem,1.25vw,0.84rem)", color: ink, marginTop: "0.15rem" }}>
                    {book.author}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <ColLabel ink={ink}>top 5 albums</ColLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {ALBUMS.map((album, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", opacity: 0.4 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "0.65rem", color: ink, opacity: 0.45, minWidth: "0.9rem" }}>
                    {i + 1}
                  </span>
                  <div>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontStyle: "italic", fontSize: "clamp(0.82rem,1.4vw,0.94rem)", color: ink }}>
                      {album.title}
                    </span>
                    <span style={{ fontSize: "clamp(0.72rem,1.2vw,0.82rem)", color: ink, marginLeft: "0.4rem" }}>
                      {album.artist}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ColLabel({ ink, children }: { ink: string; children: string }) {
  return (
    <div style={{
      fontSize: "0.65rem", fontFamily: "'Plus Jakarta Sans',sans-serif",
      fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
      color: ink, opacity: 0.55, marginBottom: "0.6rem",
    }}>
      {children}
    </div>
  );
}

function rgba(hex: string, a: number) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
