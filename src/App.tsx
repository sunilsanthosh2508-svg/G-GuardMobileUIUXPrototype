import { useState, useEffect, useRef } from "react";

// ── types ──────────────────────────────────────────────────────────────────────
type Screen = "dash" | "setup" | "monitor" | "alert" | "optimize" | "analytics" | "ai" | "summary";

// ── design tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:      "#000000",
  surface: "#0c0c14",
  card:    "#10101c",
  card2:   "#14142200",
  border:  "rgba(0,229,255,0.10)",
  borderO: "rgba(255,107,26,0.28)",
  borderR: "rgba(255,45,85,0.28)",
  borderG: "rgba(0,255,136,0.22)",
  cyan:    "#00e5ff",
  orange:  "#ff6b1a",
  green:   "#00ff88",
  red:     "#ff2d55",
  yellow:  "#ffd60a",
  purple:  "#bf5fff",
  white:   "#ffffff",
  dim:     "rgba(255,255,255,0.38)",
  mute:    "rgba(255,255,255,0.18)",
};

const F = {
  display: "'Orbitron', sans-serif",
  body:    "'Exo 2', sans-serif",
  mono:    "'JetBrains Mono', monospace",
};

// ── tiny helpers ───────────────────────────────────────────────────────────────
function cx(...args: (string | false | undefined)[]) { return args.filter(Boolean).join(" "); }

function Glow({ color, opacity = 0.18, size = 160, top = -40, right = -40 }: {
  color: string; opacity?: number; size?: number; top?: number; right?: number;
}) {
  return (
    <div style={{
      position: "absolute", top, right,
      width: size, height: size, borderRadius: "50%", pointerEvents: "none",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity,
    }} />
  );
}

// ── SVG Arc Gauge ──────────────────────────────────────────────────────────────
function ArcGauge({ pct, color, size = 96, thick = 7 }: {
  pct: number; color: string; size?: number; thick?: number;
}) {
  const r = (size - thick) / 2;
  const cx2 = size / 2, cy2 = size / 2;
  const startDeg = 220, spanDeg = 280;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const pt = (deg: number) => ({
    x: cx2 + r * Math.cos(toRad(deg)),
    y: cy2 + r * Math.sin(toRad(deg)),
  });
  const arcPath = (start: number, end: number) => {
    const s = pt(start), e = pt(end);
    const large = end - start > 180 ? 1 : 0;
    return `M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y}`;
  };
  const filled = (pct / 100) * spanDeg;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={arcPath(startDeg, startDeg + spanDeg)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={thick} strokeLinecap="round" />
      <path
        d={arcPath(startDeg, startDeg + filled)}
        fill="none" stroke={color} strokeWidth={thick} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    </svg>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────────
function Spark({ data, color, h = 44, animate }: {
  data: number[]; color: string; h?: number; animate?: boolean;
}) {
  const W = 100;
  const mn = Math.min(...data), mx = Math.max(...data), range = mx - mn || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${h - 2 - ((v - mn) / range) * (h - 6)}`
  ).join(" ");
  const fill = `0,${h} ${pts} ${W},${h}`;
  const id = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#${id})`} />
      <polyline
        points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        className={animate ? "anim-draw" : ""}
      />
    </svg>
  );
}

// ── Status Bar ─────────────────────────────────────────────────────────────────
function StatusBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 28 }}>
      <span style={{ fontFamily: F.mono, fontSize: 11, color: C.dim }}>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* signal */}
        <svg width="16" height="10" viewBox="0 0 16 10">
          {[0,1,2,3].map((i) => (
            <rect key={i} x={i * 4} y={9 - (i + 1) * 2.2} width="3" height={(i + 1) * 2.2}
              rx="0.5" fill="white" opacity={0.3 + i * 0.2} />
          ))}
        </svg>
        {/* wifi */}
        <svg width="14" height="11" viewBox="0 0 24 18">
          <path d="M12 13.5l2.5-3a4 4 0 0 0-5 0l2.5 3z" fill="white" />
          <path d="M12 13.5l5-6a9 9 0 0 0-10 0l5 6z" fill="white" opacity="0.6" />
          <path d="M12 13.5l8-9.5a15 15 0 0 0-16 0l8 9.5z" fill="white" opacity="0.25" />
        </svg>
        {/* battery */}
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div style={{ width: 22, height: 11, borderRadius: 3, border: "1px solid rgba(255,255,255,0.4)", padding: 1.5, display: "flex" }}>
            <div style={{ width: "78%", height: "100%", borderRadius: 1.5, background: C.green }} />
          </div>
          <div style={{ width: 2, height: 5, borderRadius: "0 1px 1px 0", background: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>
    </div>
  );
}

// ── Bottom Nav ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Screen; label: string; path: string }[] = [
  { id: "dash",      label: "Home",     path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { id: "setup",     label: "Gaming",   path: "M2 6h20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M8 12h4m-2-2v4 M17 10h.01 M20 12h.01" },
  { id: "analytics", label: "Analytics",path: "M18 20V10 M12 20V4 M6 20v-6" },
  { id: "ai",        label: "AI / NPU", path: "M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2v1a1 1 0 0 1-1 1h-1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" },
];

function BottomNav({ active, go }: { active: Screen; go: (s: Screen) => void }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 0 6px",
      borderTop: `1px solid ${C.border}`,
      background: "linear-gradient(180deg, #000000 0%, #060610 100%)",
    }}>
      {NAV_ITEMS.map(({ id, label, path }) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => go(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer", padding: "4px 12px",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={on ? C.cyan : "#444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: on ? `drop-shadow(0 0 4px ${C.cyan})` : "none" }}>
              {path.split(" M").map((seg, i) => (
                <path key={i} d={i === 0 ? seg : "M" + seg} />
              ))}
            </svg>
            <span style={{
              fontFamily: F.body, fontSize: 9, fontWeight: 600, letterSpacing: "0.04em",
              color: on ? C.cyan : "#444",
              textShadow: on ? `0 0 6px ${C.cyan}` : "none",
            }}>{label}</span>
            {on && <div style={{ width: 4, height: 4, borderRadius: 2, background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
function Card({ children, style, accent }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}) {
  return (
    <div style={{
      borderRadius: 16,
      background: "linear-gradient(135deg, #0f0f1c 0%, #0a0a15 100%)",
      border: `1px solid ${accent ?? C.border}`,
      position: "relative", overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Tag / Badge ────────────────────────────────────────────────────────────────
function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontFamily: F.mono, fontSize: 9, fontWeight: 700,
      letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 20,
      background: color + "18", border: `1px solid ${color}44`, color,
    }}>{label}</span>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────────
function Bar({ pct, color, height = 4 }: { pct: number; color: string; height?: number }) {
  return (
    <div style={{ width: "100%", height, borderRadius: 99, background: "rgba(255,255,255,0.07)" }}>
      <div className="anim-bar" style={{
        width: `${pct}%`, height: "100%", borderRadius: 99,
        background: color, boxShadow: `0 0 6px ${color}88`,
      }} />
    </div>
  );
}

// ── Sensor Tile ────────────────────────────────────────────────────────────────
function SensorTile({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div style={{
      flex: 1, borderRadius: 12,
      background: "linear-gradient(135deg, #0f0f1c, #090913)",
      border: `1px solid ${color}22`,
      padding: "10px 6px 8px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    }}>
      {/* chip visual */}
      <div style={{
        width: 40, height: 40, borderRadius: 8, position: "relative",
        background: `radial-gradient(circle at center, ${color}16 0%, transparent 70%)`,
        border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", inset: 6,
          border: `1px dashed ${color}30`, borderRadius: 4,
        }} />
        <span style={{
          fontFamily: F.mono, fontSize: 11, fontWeight: 700,
          color, textShadow: `0 0 6px ${color}`,
        }}>{val}</span>
      </div>
      <span style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.08em" }}>{label}</span>
      <Bar pct={parseInt(val) * 1.4} color={color} height={3} />
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ on, color = C.cyan }: { on: boolean; color?: string }) {
  return (
    <div style={{
      width: 36, height: 20, borderRadius: 10,
      background: on ? `linear-gradient(90deg, ${color}88, ${color}55)` : "rgba(255,255,255,0.08)",
      border: `1px solid ${on ? color + "55" : "rgba(255,255,255,0.1)"}`,
      boxShadow: on ? `0 0 8px ${color}44` : "none",
      display: "flex", alignItems: "center", padding: 2,
      justifyContent: on ? "flex-end" : "flex-start",
      transition: "all 0.2s",
    }}>
      <div style={{ width: 14, height: 14, borderRadius: 7, background: "white" }} />
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SCREEN 1 — Dashboard                                           ║
// ╚══════════════════════════════════════════════════════════════════╝
function ScreenDash({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="anim-slide" style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: "linear-gradient(135deg, #00e5ff22, #00e5ff08)",
            border: `1px solid ${C.cyan}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: C.white, letterSpacing: "0.1em" }}>G-GUARD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="anim-pulse" style={{ width: 6, height: 6, borderRadius: 3, background: C.green }} />
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.green, fontWeight: 700, textShadow: `0 0 6px ${C.green}` }}>ACTIVE</span>
        </div>
      </div>

      {/* tagline */}
      <p style={{ fontFamily: F.body, fontSize: 9, color: "rgba(255,255,255,0.28)", margin: 0, letterSpacing: "0.03em" }}>
        Predict the heat · Prevent the throttle · Protect the FPS
      </p>

      {/* thermal health arc */}
      <Card style={{ padding: 16, overflow: "visible" }}>
        <Glow color={C.cyan} opacity={0.08} size={140} top={-40} right={-30} />
        {/* grid bg */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 16,
          backgroundImage: "linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
          {/* arc */}
          <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
            <ArcGauge pct={72} color={C.cyan} size={96} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.cyan, textShadow: `0 0 10px ${C.cyan}` }}>72%</span>
              <span style={{ fontFamily: F.body, fontSize: 8, color: C.mute, marginTop: 1 }}>Thermal Health</span>
            </div>
          </div>
          {/* right info */}
          <div style={{ flex: 1 }}>
            <Tag label="STABLE" color={C.green} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              {[
                { l: "FPS", v: "120", c: C.cyan },
                { l: "GPU", v: "82%", c: C.green },
              ].map(({ l, v, c }) => (
                <div key={l}>
                  <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, marginBottom: 2, letterSpacing: "0.06em" }}>{l}</div>
                  <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: c, textShadow: `0 0 8px ${c}88` }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* sensor grid */}
      <div style={{ display: "flex", gap: 6 }}>
        <SensorTile label="SoC" val="41°" color={C.cyan} />
        <SensorTile label="CPU" val="39°" color={C.green} />
        <SensorTile label="GPU" val="43°" color={C.yellow} />
        <SensorTile label="Batt" val="36°" color={C.green} />
      </div>

      {/* quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { l: "AI Predictions", v: "47", sub: "0 throttle events", c: C.cyan },
          { l: "Session Time", v: "38:24", sub: "FPS protected", c: C.white },
        ].map(({ l, v, sub, c }) => (
          <Card key={l} style={{ padding: "12px 14px" }}>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.06em", marginBottom: 4 }}>{l}</div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontFamily: F.body, fontSize: 9, color: C.mute, marginTop: 2 }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <button onClick={() => go("setup")} style={{
        width: "100%", padding: "16px 0", borderRadius: 16,
        background: "linear-gradient(135deg, #00bcd4 0%, #006080 100%)",
        border: `1px solid ${C.cyan}55`,
        boxShadow: `0 0 24px ${C.cyan}33, inset 0 1px 0 rgba(255,255,255,0.12)`,
        fontFamily: F.display, fontSize: 12, fontWeight: 700, color: "#000",
        letterSpacing: "0.18em", cursor: "pointer",
      }}>START GAMING</button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SCREEN 2 — Gaming Setup                                        ║
// ╚══════════════════════════════════════════════════════════════════╝
function ScreenSetup({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="anim-slide" style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <p style={{ fontFamily: F.mono, fontSize: 9, color: C.mute, margin: 0, letterSpacing: "0.1em" }}>GAMING SETUP</p>
        <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.white, margin: "2px 0 0", letterSpacing: "0.06em" }}>BATTLE ARENA</h2>
      </div>

      {/* game card hero */}
      <div style={{
        borderRadius: 18, height: 140, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0a0520 0%, #140828 50%, #080a1c 100%)",
        border: "1px solid rgba(139,0,255,0.2)",
      }}>
        {/* hex dots */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,229,255,0.06) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }} />
        <Glow color={C.cyan} opacity={0.12} size={160} top={-50} right={-30} />
        <Glow color={C.purple} opacity={0.1} size={120} top={20} right={-10} />
        <div style={{ position: "relative", zIndex: 1, padding: "14px 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Tag label="120Hz" color={C.cyan} />
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div className="anim-pulse" style={{ width: 6, height: 6, borderRadius: 3, background: C.green }} />
              <span style={{ fontFamily: F.mono, fontSize: 9, color: C.green, fontWeight: 700 }}>READY</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.white, letterSpacing: "0.06em" }}>BATTLE ARENA</div>
            <div style={{ fontFamily: F.body, fontSize: 10, color: C.mute, marginTop: 3 }}>Pro Mode · Competitive</div>
          </div>
        </div>
      </div>

      {/* thermal readiness */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 10 }}>THERMAL READINESS</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          {[
            { l: "SoC Temp", v: "41°C", c: C.cyan },
            { l: "Headroom", v: "18%", c: C.green },
            { l: "Risk Level", v: "LOW", c: C.green },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: c, textShadow: `0 0 8px ${c}88` }}>{v}</div>
              <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <Bar pct={82} color={C.green} height={6} />
        <div style={{ fontFamily: F.body, fontSize: 9, color: C.mute, marginTop: 4 }}>System thermal readiness · 82%</div>
      </Card>

      {/* config toggles */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 10 }}>G-GUARD CONFIG</div>
        {[
          { l: "AI Thermal Prediction", s: "NPU accelerated", on: true, c: C.cyan },
          { l: "Auto-Optimization", s: "Trigger at 91% confidence", on: true, c: C.green },
          { l: "FPS Guard", s: "Min 90 FPS threshold", on: true, c: C.yellow },
        ].map(({ l, s, on, c }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.white }}>{l}</div>
              <div style={{ fontFamily: F.mono, fontSize: 9, color: C.mute, marginTop: 1 }}>{s}</div>
            </div>
            <Toggle on={on} color={c} />
          </div>
        ))}
      </Card>

      <button onClick={() => go("monitor")} style={{
        width: "100%", padding: "16px 0", borderRadius: 16,
        background: "linear-gradient(135deg, #00bcd4 0%, #006080 100%)",
        border: `1px solid ${C.cyan}55`,
        boxShadow: `0 0 24px ${C.cyan}33`,
        fontFamily: F.display, fontSize: 12, fontWeight: 700, color: "#000",
        letterSpacing: "0.18em", cursor: "pointer",
      }}>LAUNCH GAME</button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SCREEN 3 — Live Monitor                                        ║
// ╚══════════════════════════════════════════════════════════════════╝
const tempData  = [38,39,40,41,42,43,44,45,43,42,43,44,43,42,43];
const fpsData   = [120,120,119,120,118,120,120,119,117,120,118,120,119,120,120];

function ScreenMonitor({ go }: { go: (s: Screen) => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1000); return () => clearInterval(t); }, []);

  return (
    <div className="anim-slide" style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: F.mono, fontSize: 9, color: C.mute, margin: 0, letterSpacing: "0.1em" }}>LIVE MONITOR</p>
          <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: C.white, margin: "2px 0 0" }}>REAL-TIME</h2>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20,
          background: "rgba(255,45,85,0.1)", border: "1px solid rgba(255,45,85,0.2)",
        }}>
          <div className="anim-pulse" style={{ width: 5, height: 5, borderRadius: 99, background: C.red }} />
          <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 700, color: C.red }}>LIVE</span>
        </div>
      </div>

      {/* live tiles */}
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { l: "FPS", v: "120", c: C.cyan },
          { l: "TEMP", v: "43°C", c: C.yellow },
          { l: "GPU", v: "82%", c: C.green },
          { l: "CPU", v: "74%", c: C.cyan },
        ].map(({ l, v, c }) => (
          <div key={l} style={{
            flex: 1, borderRadius: 12, padding: "10px 6px", textAlign: "center",
            background: "linear-gradient(135deg, #0e0e1a, #09090f)",
            border: `1px solid ${c}18`,
          }}>
            <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: c, textShadow: `0 0 8px ${c}` }}>{v}</div>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, marginTop: 3, letterSpacing: "0.08em" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* thermal graph */}
      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em" }}>THERMAL TIMELINE</div>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              {[[C.yellow, "SoC Temp"], [C.cyan, "FPS (norm)"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 12, height: 2, borderRadius: 1, background: c }} />
                  <span style={{ fontFamily: F.body, fontSize: 9, color: C.mute }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <span style={{ fontFamily: F.mono, fontSize: 8, color: C.mute }}>last 15s</span>
        </div>
        <div style={{ position: "relative", height: 56 }}>
          <Spark data={tempData} color={C.yellow} h={56} animate />
          <div style={{ position: "absolute", inset: 0, opacity: 0.45, mixBlendMode: "screen" }}>
            <Spark data={fpsData.map(v => (v - 112) * 8)} color={C.cyan} h={56} />
          </div>
        </div>
        {/* threshold */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <div style={{ flex: 1, borderTop: "1px dashed rgba(255,45,85,0.3)" }} />
          <span style={{ fontFamily: F.mono, fontSize: 8, color: "rgba(255,45,85,0.5)" }}>55°C limit</span>
        </div>
      </Card>

      {/* thermal risk */}
      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 4 }}>THERMAL RISK</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: F.display, fontSize: 30, fontWeight: 700, color: C.green, textShadow: `0 0 12px ${C.green}` }}>18%</span>
              <Tag label="LOW" color={C.green} />
            </div>
          </div>
          <div style={{ position: "relative", width: 60, height: 60 }}>
            <ArcGauge pct={18} color={C.green} size={60} thick={5} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <Bar pct={18} color={C.green} height={5} />
        </div>
      </Card>

      {/* sensor breakdown */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 10 }}>SENSOR BREAKDOWN</div>
        {[
          { l: "SoC Temperature", v: 43, max: 70, c: C.yellow, unit: "°C" },
          { l: "GPU Load",        v: 82, max: 100, c: C.cyan, unit: "%" },
          { l: "CPU Utilization", v: 74, max: 100, c: C.green, unit: "%" },
          { l: "Battery Temp",    v: 36, max: 60, c: C.green, unit: "°C" },
        ].map(({ l, v, max, c, unit }) => (
          <div key={l} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontFamily: F.body, fontSize: 11, color: C.dim }}>{l}</span>
              <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: c }}>{v}{unit}</span>
            </div>
            <Bar pct={(v / max) * 100} color={c} height={3} />
          </div>
        ))}
      </Card>

      <button onClick={() => go("alert")} style={{
        width: "100%", padding: "14px 0", borderRadius: 16,
        background: "rgba(255,107,26,0.1)",
        border: `1px solid ${C.orange}44`,
        fontFamily: F.display, fontSize: 11, fontWeight: 700, color: C.orange,
        letterSpacing: "0.16em", cursor: "pointer",
      }}>SIMULATE ALERT →</button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SCREEN 4 — Prediction Alert                                    ║
// ╚══════════════════════════════════════════════════════════════════╝
function ScreenAlert({ go }: { go: (s: Screen) => void }) {
  const [secs, setSecs] = useState(167);
  useEffect(() => { const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  // prediction graph
  const W = 270, H = 76;
  const mn = 36, mx = 62;
  const past = [38, 39, 40, 41, 42, 43, 44, 45];
  const pred = [45, 47, 50, 52, 55, 57];
  const all  = [...past, ...pred];
  const tx = (i: number) => (i / (all.length - 1)) * W;
  const ty = (v: number) => H - 2 - ((v - mn) / (mx - mn)) * (H - 8);
  const pastPts = past.map((v, i) => `${tx(i)},${ty(v)}`).join(" ");
  const pi = past.length - 1;
  const predPts = pred.map((v, i) => `${tx(pi + i)},${ty(v)}`).join(" ");
  const threshY = ty(55);
  const lastX = tx(pi), lastY = ty(past[pi]);
  const fillPred = `${lastX},${H} ${lastX},${lastY} ${predPts} ${tx(all.length - 1)},${H}`;

  return (
    <div className="anim-slide" style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* alert hero */}
      <div className="anim-thermal" style={{
        borderRadius: 18, padding: 16, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #160e06 0%, #0f0a04 100%)",
        border: `1px solid ${C.borderO}`,
      }}>
        <Glow color={C.orange} opacity={0.15} size={180} top={-60} right={-40} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={C.orange}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 700, color: C.orange, letterSpacing: "0.12em" }}>AI PREDICTION</span>
          </div>
          <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 800, color: C.white, lineHeight: 1.2, marginBottom: 6 }}>
            THROTTLING RISK<br />
            <span style={{ color: C.orange, textShadow: `0 0 14px ${C.orange}` }}>DETECTED</span>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
            Thermal threshold breach predicted in
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="anim-blink" style={{
              fontFamily: F.display, fontSize: 40, fontWeight: 800,
              color: C.orange, textShadow: `0 0 20px ${C.orange}, 0 0 40px ${C.orange}66`,
            }}>{mm}:{ss}</div>
            <div>
              <div style={{
                fontFamily: F.mono, fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                background: "rgba(255,107,26,0.15)", border: `1px solid ${C.orange}44`, color: C.orange,
              }}>91% confidence</div>
              <div style={{ fontFamily: F.body, fontSize: 9, color: C.mute, marginTop: 4 }}>NPU ThermalPredictor-int8</div>
            </div>
          </div>
        </div>
      </div>

      {/* prediction graph */}
      <Card accent={C.borderO} style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 8 }}>TEMPERATURE PREDICTION</div>
        <svg width="100%" height={H + 16} viewBox={`0 0 ${W} ${H + 16}`}>
          <defs>
            <linearGradient id="predFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.orange} stopOpacity="0.22" />
              <stop offset="100%" stopColor={C.orange} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* threshold */}
          <line x1="0" y1={threshY} x2={W} y2={threshY} stroke={C.red} strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
          <text x={W - 2} y={threshY - 4} fontSize="8" fill={C.red} textAnchor="end" opacity="0.7">55°C</text>
          {/* past */}
          <polyline points={pastPts} fill="none" stroke={C.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* pred fill */}
          <polygon points={fillPred} fill="url(#predFill)" />
          {/* pred line */}
          <polyline points={`${lastX},${lastY} ${predPts}`} fill="none" stroke={C.orange} strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
          {/* dots */}
          <circle cx={lastX} cy={lastY} r="3.5" fill={C.cyan} style={{ filter: `drop-shadow(0 0 4px ${C.cyan})` }} />
          {/* labels */}
          <text x="2" y={H + 13} fontSize="8" fill={C.cyan} opacity="0.7">Current</text>
          <text x={lastX + 5} y={H + 13} fontSize="8" fill={C.orange} opacity="0.7">→ Predicted</text>
        </svg>
        <div style={{ display: "flex", gap: 16, marginTop: 2 }}>
          {[[C.cyan, "Current"], [C.orange, "Predicted"], [C.red, "Threshold"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 2, background: c, borderRadius: 1 }} />
              <span style={{ fontFamily: F.body, fontSize: 8, color: C.mute }}>{l}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* signals */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 8 }}>TRIGGER SIGNALS</div>
        {[
          { l: "GPU Load Spike", v: "82% → 91%", c: C.orange },
          { l: "SoC Temperature", v: "43°C (+2.1/min)", c: C.yellow },
          { l: "Battery Temperature", v: "36°C climbing", c: C.yellow },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                background: c + "18", border: `1px solid ${c}25`,
                fontFamily: F.mono, fontSize: 10, color: c, fontWeight: 700,
              }}>↑</div>
              <span style={{ fontFamily: F.body, fontSize: 11, color: C.dim }}>{l}</span>
            </div>
            <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: c }}>{v}</span>
          </div>
        ))}
      </Card>

      <button onClick={() => go("optimize")} style={{
        width: "100%", padding: "16px 0", borderRadius: 16,
        background: "linear-gradient(135deg, #ff4d6a 0%, #cc1a33 100%)",
        border: `1px solid ${C.red}55`,
        boxShadow: `0 0 24px ${C.red}33`,
        fontFamily: F.display, fontSize: 12, fontWeight: 700, color: "white",
        letterSpacing: "0.18em", cursor: "pointer",
      }}>⚡ OPTIMIZE NOW</button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SCREEN 5 — Optimization                                        ║
// ╚══════════════════════════════════════════════════════════════════╝
function ScreenOptimize({ go }: { go: (s: Screen) => void }) {
  const [sel, setSel] = useState([0, 1, 2]);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const actions = [
    { icon: "❄", title: "Cool Down Mode",      desc: "Lower CPU/GPU clocks", effect: "−4°C", c: C.cyan },
    { icon: "⚡", title: "Reduce Load",          desc: "Cap background GFX",   effect: "−2°C", c: C.yellow },
    { icon: "◈",  title: "Display Optimization", desc: "90Hz + brightness adj", effect: "−3°C", c: C.green },
  ];

  const apply = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setApplied(true); }, 1400);
  };

  return (
    <div className="anim-slide" style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <p style={{ fontFamily: F.mono, fontSize: 9, color: C.mute, margin: 0, letterSpacing: "0.1em" }}>AI OPTIMIZATION</p>
        <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: C.white, margin: "2px 0 0" }}>THERMAL ACTIONS</h2>
      </div>

      {/* before/after */}
      <div style={{
        borderRadius: 16, padding: 14, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0c0a18, #080610)",
        border: "1px solid rgba(139,0,255,0.2)",
      }}>
        <Glow color={C.purple} opacity={0.08} size={140} top={-30} right={-20} />
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 10 }}>PROJECTED IMPACT</div>
        <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
          <div style={{
            flex: 1, borderRadius: 12, padding: "10px 0", textAlign: "center",
            background: "rgba(255,45,85,0.08)", border: "1px solid rgba(255,45,85,0.2)",
          }}>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: "rgba(255,45,85,0.7)", letterSpacing: "0.1em" }}>BEFORE</div>
            <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.orange, textShadow: `0 0 12px ${C.orange}`, marginTop: 4 }}>45°C</div>
            <div style={{ fontFamily: F.body, fontSize: 9, color: C.mute, marginTop: 2 }}>Risk: 91%</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 18, color: C.mute }}>→</div>
          <div style={{
            flex: 1, borderRadius: 12, padding: "10px 0", textAlign: "center",
            background: "rgba(0,255,136,0.08)", border: `1px solid ${C.borderG}`,
          }}>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: "rgba(0,255,136,0.7)", letterSpacing: "0.1em" }}>AFTER</div>
            <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.green, textShadow: `0 0 12px ${C.green}`, marginTop: 4 }}>41°C</div>
            <div style={{ fontFamily: F.body, fontSize: 9, color: C.mute, marginTop: 2 }}>Risk: 28%</div>
          </div>
        </div>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span style={{ fontFamily: F.display, fontSize: 12, fontWeight: 700, color: C.green }}>−4°C · −63% Risk</span>
        </div>
      </div>

      {/* actions */}
      {actions.map((a, i) => {
        const on = sel.includes(i);
        return (
          <div key={i} onClick={() => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
            style={{
              borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
              background: on ? `linear-gradient(135deg, ${a.c}12, ${a.c}06)` : "linear-gradient(135deg, #0e0e1a, #09090f)",
              border: `1px solid ${on ? a.c + "35" : "rgba(255,255,255,0.07)"}`,
              boxShadow: on ? `0 0 16px ${a.c}12` : "none",
              cursor: "pointer", transition: "all 0.2s",
            }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: a.c + "15", border: `1px solid ${a.c}25`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.white }}>{a.title}</div>
              <div style={{ fontFamily: F.body, fontSize: 10, color: C.mute, marginTop: 2 }}>{a.desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: a.c }}>{a.effect}</span>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: on ? a.c : "rgba(255,255,255,0.07)",
                border: `1px solid ${on ? a.c : "rgba(255,255,255,0.12)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
            </div>
          </div>
        );
      })}

      {applied && (
        <div style={{
          borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,255,136,0.08)", border: `1px solid ${C.borderG}`,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, color: C.green }}>Optimizations applied — FPS protected!</span>
        </div>
      )}

      <button onClick={applied ? () => go("analytics") : apply} style={{
        width: "100%", padding: "16px 0", borderRadius: 16,
        background: applied
          ? "linear-gradient(135deg, #00bcd4, #006080)"
          : "linear-gradient(135deg, #00cc66, #008844)",
        border: `1px solid ${applied ? C.cyan : C.green}55`,
        boxShadow: `0 0 24px ${applied ? C.cyan : C.green}33`,
        fontFamily: F.display, fontSize: 12, fontWeight: 700,
        color: applied ? "#000" : "white",
        letterSpacing: "0.18em", cursor: "pointer",
        opacity: loading ? 0.7 : 1,
      }}>
        {loading ? "APPLYING..." : applied ? "VIEW ANALYTICS →" : "✓  APPLY"}
      </button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SCREEN 6 — Analytics                                           ║
// ╚══════════════════════════════════════════════════════════════════╝
const analyticsData: Record<string, { data: number[]; color: string; label: string; unit: string }> = {
  temp: { data: [38,39,40,41,43,45,44,43,41,40,41,42,43,44,46,45,43,42,41,40], color: C.orange, label: "Temperature", unit: "°C" },
  fps:  { data: [120,120,119,118,120,120,117,116,118,120,119,120,120,119,118,117,120,120,119,120], color: C.cyan, label: "FPS", unit: "" },
  gpu:  { data: [75,78,80,82,85,88,86,84,82,80,81,83,85,84,82,80,78,79,80,82], color: C.green, label: "GPU Load", unit: "%" },
  risk: { data: [10,12,15,18,22,28,25,20,18,15,14,16,20,24,35,30,22,18,15,12], color: C.yellow, label: "Thermal Risk", unit: "%" },
};

function ScreenAnalytics({ go }: { go: (s: Screen) => void }) {
  const [tab, setTab] = useState<"temp" | "fps" | "gpu" | "risk">("temp");
  const g = analyticsData[tab];

  return (
    <div className="anim-slide" style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <p style={{ fontFamily: F.mono, fontSize: 9, color: C.mute, margin: 0, letterSpacing: "0.1em" }}>SESSION ANALYTICS</p>
        <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: C.white, margin: "2px 0 0" }}>PERFORMANCE</h2>
      </div>

      {/* summary */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { l: "Peak Temp", v: "46°C", c: C.orange },
          { l: "Avg FPS", v: "117", c: C.cyan },
          { l: "Throttle Events", v: "0", c: C.green },
        ].map(({ l, v, c }) => (
          <Card key={l} style={{ flex: 1, padding: "10px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: c, textShadow: `0 0 8px ${c}66` }}>{v}</div>
            <div style={{ fontFamily: F.mono, fontSize: 7.5, color: C.mute, marginTop: 3, lineHeight: 1.3 }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* tab bar */}
      <div style={{
        display: "flex", gap: 4, padding: 4, borderRadius: 12,
        background: "#0a0a14", border: "1px solid rgba(255,255,255,0.07)",
      }}>
        {(["temp","fps","gpu","risk"] as const).map(t => {
          const gd = analyticsData[t];
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "7px 0", borderRadius: 8,
              background: tab === t ? gd.color + "22" : "transparent",
              border: `1px solid ${tab === t ? gd.color + "44" : "transparent"}`,
              fontFamily: F.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
              color: tab === t ? gd.color : "#555",
              cursor: "pointer", textTransform: "uppercase",
            }}>{t}</button>
          );
        })}
      </div>

      {/* graph */}
      <Card accent={g.color + "20"} style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 13, fontWeight: 700, color: C.white }}>{g.label}</div>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, marginTop: 2 }}>38 min session</div>
          </div>
          <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: g.color }}>
            {g.data[g.data.length - 1]}{g.unit}
          </div>
        </div>
        <div style={{ height: 72 }}>
          <Spark data={g.data} color={g.color} h={72} animate />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {["0m","10m","20m","30m","38m"].map(l => (
            <span key={l} style={{ fontFamily: F.mono, fontSize: 8, color: C.mute }}>{l}</span>
          ))}
        </div>
      </Card>

      {/* events */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 8 }}>SESSION EVENTS</div>
        {[
          { t: "00:00", e: "Session started — G-Guard active", c: C.green },
          { t: "12:34", e: "Thermal warning detected (43°C)", c: C.yellow },
          { t: "14:22", e: "Auto-optimization applied", c: C.cyan },
          { t: "26:18", e: "Throttling risk predicted & prevented", c: C.orange },
          { t: "38:24", e: "Session complete — 0 throttle events", c: C.green },
        ].map(({ t, e, c }) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, width: 38, flexShrink: 0 }}>{t}</span>
            <div style={{ width: 4, height: 4, borderRadius: 2, background: c, flexShrink: 0, boxShadow: `0 0 4px ${c}` }} />
            <span style={{ fontFamily: F.body, fontSize: 10, color: C.dim, lineHeight: 1.3 }}>{e}</span>
          </div>
        ))}
      </Card>

      <button onClick={() => go("summary")} style={{
        width: "100%", padding: "16px 0", borderRadius: 16,
        background: "linear-gradient(135deg, #00bcd4, #006080)",
        border: `1px solid ${C.cyan}55`,
        boxShadow: `0 0 24px ${C.cyan}33`,
        fontFamily: F.display, fontSize: 12, fontWeight: 700, color: "#000",
        letterSpacing: "0.18em", cursor: "pointer",
      }}>VIEW SUMMARY →</button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SCREEN 7 — AI / NPU Diagnostics                                ║
// ╚══════════════════════════════════════════════════════════════════╝
function ScreenAI({ go }: { go: (s: Screen) => void }) {
  const pipeline = ["Sensors","ML Model","NPU","Prediction","Action"];
  return (
    <div className="anim-slide" style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <p style={{ fontFamily: F.mono, fontSize: 9, color: C.mute, margin: 0, letterSpacing: "0.1em" }}>AI / NPU</p>
        <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: C.white, margin: "2px 0 0" }}>DIAGNOSTICS</h2>
      </div>

      {/* model card */}
      <div style={{
        borderRadius: 16, padding: 16, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #08081a, #050510)",
        border: "1px solid rgba(191,95,255,0.22)",
      }}>
        <Glow color={C.purple} opacity={0.14} size={180} top={-50} right={-30} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 9, color: C.purple, letterSpacing: "0.1em", marginBottom: 3 }}>CORE MODEL</div>
              <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: C.white, letterSpacing: "0.05em" }}>ThermalPredictor-int8</div>
              <div style={{ fontFamily: F.body, fontSize: 10, color: C.mute, marginTop: 2 }}>Quantized Time-Series ML</div>
            </div>
            <Tag label="int8" color={C.purple} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { l: "Prediction Range", v: "~3 min" },
              { l: "Confidence", v: "91%" },
              { l: "Latency", v: "<12ms" },
            ].map(({ l, v }) => (
              <div key={l} style={{
                borderRadius: 10, padding: "8px 10px", textAlign: "center",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div style={{ fontFamily: F.display, fontSize: 13, fontWeight: 700, color: C.white }}>{v}</div>
                <div style={{ fontFamily: F.mono, fontSize: 7.5, color: C.mute, marginTop: 2, lineHeight: 1.3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* npu status */}
      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em" }}>HARDWARE DELEGATE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: C.cyan + "14", border: `1px solid ${C.cyan}25` }}>
            <div className="anim-pulse" style={{ width: 5, height: 5, borderRadius: 99, background: C.cyan }} />
            <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 700, color: C.cyan }}>NPU ACTIVE</span>
          </div>
        </div>
        {[
          { l: "NPU Hardware Delegate", s: "ACTIVE",   c: C.cyan  },
          { l: "CPU Fallback",          s: "READY",    c: C.yellow },
          { l: "TFLite Runtime",        s: "v2.14.1",  c: C.green },
          { l: "Model Signature",       s: "VERIFIED", c: C.green },
        ].map(({ l, s, c }) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontFamily: F.body, fontSize: 11, color: C.dim }}>{l}</span>
            <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: c + "14", border: `1px solid ${c}25`, color: c }}>{s}</span>
          </div>
        ))}
      </Card>

      {/* sensor inputs */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 10 }}>SENSOR INPUTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {["CPU","GPU","Battery","SoC"].map(s => (
            <div key={s} style={{
              borderRadius: 10, padding: "10px 4px", textAlign: "center",
              background: C.cyan + "08", border: `1px solid ${C.cyan}15`,
            }}>
              <div style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 700, color: C.cyan }}>{s}</div>
              <div className="anim-pulse" style={{ width: 4, height: 4, borderRadius: 2, background: C.green, margin: "6px auto 0" }} />
            </div>
          ))}
        </div>
      </Card>

      {/* pipeline */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 10 }}>INFERENCE PIPELINE</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {pipeline.map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i === 2 ? C.cyan + "18" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${i === 2 ? C.cyan + "44" : "rgba(255,255,255,0.09)"}`,
                  boxShadow: i === 2 ? `0 0 14px ${C.cyan}22` : "none",
                  fontFamily: F.mono, fontSize: 8, fontWeight: 700,
                  color: i === 2 ? C.cyan : "rgba(255,255,255,0.55)",
                  textAlign: "center", lineHeight: 1.2,
                }}>{step.slice(0, 3).toUpperCase()}</div>
                <div style={{ fontFamily: F.mono, fontSize: 7, color: C.mute, marginTop: 4, textAlign: "center", maxWidth: 40 }}>{step}</div>
              </div>
              {i < pipeline.length - 1 && (
                <div style={{ width: 10, height: 1, background: `linear-gradient(90deg, ${C.cyan}55, ${C.cyan}15)`, marginBottom: 14 }} />
              )}
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8,
          background: C.yellow + "08", border: `1px solid ${C.yellow}20`,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: 99, background: C.yellow }} />
          <span style={{ fontFamily: F.mono, fontSize: 8, fontWeight: 700, color: C.yellow }}>CPU FALLBACK READY</span>
          <span style={{ fontFamily: F.body, fontSize: 8, color: C.mute }}>— if NPU unavailable</span>
        </div>
      </Card>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SCREEN 8 — Session Summary                                     ║
// ╚══════════════════════════════════════════════════════════════════╝
function ScreenSummary({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="anim-slide" style={{ padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* hero */}
      <div style={{
        borderRadius: 18, padding: 20, position: "relative", overflow: "hidden", textAlign: "center",
        background: "linear-gradient(135deg, #05100a, #031208)",
        border: `1px solid ${C.borderG}`,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <Glow color={C.green} opacity={0.12} size={200} top={-50} right={-30} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* shield */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: `radial-gradient(circle, ${C.green}18 0%, transparent 70%)`,
              border: `1px solid ${C.green}25`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={C.cyan + "10"} />
                <path d="M9 12l2 2 4-4" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 9, color: C.green + "aa", letterSpacing: "0.14em", marginBottom: 4 }}>SESSION COMPLETE</div>
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>
            PERFORMANCE<br />
            <span style={{ color: C.green, textShadow: `0 0 14px ${C.green}` }}>PROTECTED</span>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 9, color: C.mute, marginTop: 6 }}>Session duration: 38:24</div>
        </div>
      </div>

      {/* stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { l: "Session Duration", v: "38:24", c: C.cyan,   icon: "⏱" },
          { l: "Peak Temperature", v: "46°C",  c: C.orange, icon: "🌡" },
          { l: "Average FPS",      v: "117",   c: C.cyan,   icon: "⚡" },
          { l: "Drops Prevented",  v: "2",     c: C.green,  icon: "🛡" },
        ].map(({ l, v, c, icon }, i) => (
          <Card key={i} style={{ padding: "12px 14px", border: `1px solid ${c}18` }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: c, textShadow: `0 0 10px ${c}55` }}>{v}</div>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, marginTop: 3 }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* achievements */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: C.mute, letterSpacing: "0.1em", marginBottom: 10 }}>ACHIEVEMENTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            { icon: "🏆", t: "Zero Throttle", s: "Perfect session" },
            { icon: "🎯", t: "91% Accuracy",  s: "AI prediction" },
            { icon: "🔥", t: "FPS Guardian",  s: "Avg 117 FPS" },
          ].map(({ icon, t, s }) => (
            <div key={t} style={{
              borderRadius: 10, padding: "10px 8px", textAlign: "center",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontFamily: F.mono, fontSize: 8, fontWeight: 700, color: C.white, letterSpacing: "0.04em" }}>{t}</div>
              <div style={{ fontFamily: F.body, fontSize: 8, color: C.mute, marginTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* tagline */}
      <div style={{
        borderRadius: 12, padding: "10px 14px", textAlign: "center",
        background: C.cyan + "06", border: `1px solid ${C.cyan}12`,
      }}>
        <p style={{ fontFamily: F.body, fontSize: 9, fontStyle: "italic", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          "Predict the heat. Prevent the throttle. Protect the FPS."
        </p>
        <p style={{ fontFamily: F.mono, fontSize: 8, color: C.cyan + "77", margin: "4px 0 0", letterSpacing: "0.12em" }}>
          G-GUARD · iQOO HACKATHON 2026
        </p>
      </div>

      <button onClick={() => go("dash")} style={{
        width: "100%", padding: "16px 0", borderRadius: 16,
        background: "linear-gradient(135deg, #00bcd4, #006080)",
        border: `1px solid ${C.cyan}55`,
        boxShadow: `0 0 24px ${C.cyan}33`,
        fontFamily: F.display, fontSize: 12, fontWeight: 700, color: "#000",
        letterSpacing: "0.18em", cursor: "pointer",
      }}>← BACK TO DASHBOARD</button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  APP ROOT                                                       ║
// ╚══════════════════════════════════════════════════════════════════╝
export default function App() {
  const [screen, setScreen] = useState<Screen>("dash");
  const [key, setKey] = useState(0);

  const go = (s: Screen) => { setScreen(s); setKey(k => k + 1); };

  const screens: Record<Screen, React.ReactNode> = {
    dash:      <ScreenDash      go={go} />,
    setup:     <ScreenSetup     go={go} />,
    monitor:   <ScreenMonitor   go={go} />,
    alert:     <ScreenAlert     go={go} />,
    optimize:  <ScreenOptimize  go={go} />,
    analytics: <ScreenAnalytics go={go} />,
    ai:        <ScreenAI        go={go} />,
    summary:   <ScreenSummary   go={go} />,
  };

  const allScreens: Screen[] = ["dash","setup","monitor","alert","optimize","analytics","ai","summary"];

  return (
    <div style={{
      width: "100%", height: "100%", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#0a0a0a",
    }}>
      {/* phone frame */}
      <div style={{
        width: 390, height: 844, display: "flex", flexDirection: "column",
        background: C.bg, borderRadius: 48, overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.8)",
        position: "relative",
      }}>
        {/* notch */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 110, height: 30, background: C.bg,
          borderRadius: "0 0 18px 18px", zIndex: 50,
        }} />
        {/* power button */}
        <div style={{ position: "absolute", right: -3, top: 112, width: 3, height: 52, background: "#1a1a1a", borderRadius: "0 2px 2px 0" }} />
        {/* vol buttons */}
        <div style={{ position: "absolute", left: -3, top: 100, width: 3, height: 32, background: "#1a1a1a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 140, width: 3, height: 32, background: "#1a1a1a", borderRadius: "2px 0 0 2px" }} />

        {/* status bar */}
        <div style={{ paddingTop: 8 }}>
          <StatusBar />
        </div>

        {/* title bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 20px 8px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 7,
              background: C.cyan + "18", border: `1px solid ${C.cyan}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 11, fontWeight: 700, color: C.white, letterSpacing: "0.12em" }}>G-GUARD</span>
          </div>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.mute, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {screen.toUpperCase()}
          </span>
        </div>

        {/* screen content */}
        <div key={key} style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {screens[screen]}
        </div>

        {/* dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, padding: "5px 0 3px" }}>
          {allScreens.map(s => (
            <div key={s} onClick={() => go(s)} style={{
              height: 4, borderRadius: 2,
              width: screen === s ? 16 : 4,
              background: screen === s ? C.cyan : "rgba(255,255,255,0.18)",
              boxShadow: screen === s ? `0 0 6px ${C.cyan}` : "none",
              cursor: "pointer", transition: "all 0.25s",
            }} />
          ))}
        </div>

        {/* bottom nav */}
        <BottomNav active={screen} go={go} />

        {/* home bar */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 6 }}>
          <div style={{ width: 112, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.22)" }} />
        </div>
      </div>
    </div>
  );
}
