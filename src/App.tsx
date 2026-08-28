import React, { useEffect, useState } from "react";

type Screen =
  | "dash"
  | "setup"
  | "monitor"
  | "alert"
  | "optimize"
  | "analytics"
  | "ai"
  | "summary";

const C = {
  bg: "#000000",
  surface: "#0c0c14",
  card: "#10101c",
  border: "rgba(0,229,255,0.10)",
  borderO: "rgba(255,107,26,0.28)",
  borderR: "rgba(255,45,85,0.28)",
  borderG: "rgba(0,255,136,0.22)",
  cyan: "#00e5ff",
  orange: "#ff6b1a",
  green: "#00ff88",
  red: "#ff2d55",
  yellow: "#ffd60a",
  purple: "#bf5fff",
  white: "#ffffff",
  dim: "rgba(255,255,255,0.38)",
  mute: "rgba(255,255,255,0.18)",
};

const F = {
  display: "'Orbitron', sans-serif",
  body: "'Exo 2', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

/* =========================================================
   HELPERS
========================================================= */

function Glow({
  color,
  opacity = 0.18,
  size = 160,
  top = -40,
  right = -40,
}: {
  color: string;
  opacity?: number;
  size?: number;
  top?: number;
  right?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        width: size,
        height: size,
        borderRadius: "50%",
        pointerEvents: "none",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
      }}
    />
  );
}

function Card({
  children,
  style,
  accent,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        background: "linear-gradient(135deg, #0f0f1c 0%, #0a0a15 100%)",
        border: `1px solid ${accent ?? C.border}`,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Tag({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      style={{
        fontFamily: F.mono,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        padding: "3px 8px",
        borderRadius: 20,
        background: color + "18",
        border: `1px solid ${color}44`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function Bar({
  pct,
  color,
  height = 4,
}: {
  pct: number;
  color: string;
  height?: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 99,
        background: "rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      <div
        className="anim-bar"
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: "100%",
          borderRadius: 99,
          background: color,
          boxShadow: `0 0 6px ${color}88`,
        }}
      />
    </div>
  );
}

function ArcGauge({
  pct,
  color,
  size = 96,
  thick = 7,
}: {
  pct: number;
  color: string;
  size?: number;
  thick?: number;
}) {
  const r = (size - thick) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startDeg = 220;
  const spanDeg = 280;

  const toRad = (d: number) => (d * Math.PI) / 180;

  const point = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  const arcPath = (start: number, end: number) => {
    const s = point(start);
    const e = point(end);
    const large = end - start > 180 ? 1 : 0;

    return `M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y}`;
  };

  const filled = (Math.max(0, Math.min(100, pct)) / 100) * spanDeg;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path
        d={arcPath(startDeg, startDeg + spanDeg)}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={thick}
        strokeLinecap="round"
      />

      <path
        d={arcPath(startDeg, startDeg + filled)}
        fill="none"
        stroke={color}
        strokeWidth={thick}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 5px ${color})`,
        }}
      />
    </svg>
  );
}

function Spark({
  data,
  color,
  h = 44,
  animate = false,
}: {
  data: number[];
  color: string;
  h?: number;
  animate?: boolean;
}) {
  const W = 100;

  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const range = mx - mn || 1;

  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * W},${
          h - 2 - ((v - mn) / range) * (h - 6)
        }`
    )
    .join(" ");

  const fill = `0,${h} ${pts} ${W},${h}`;

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${W} ${h}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`spark-${color.replace(/[^a-z0-9]/gi, "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon
        points={fill}
        fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, "")})`}
      />

      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "anim-draw" : ""}
      />
    </svg>
  );
}

function StatusBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: 28,
      }}
    >
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          color: C.dim,
        }}
      >
        9:41
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <svg width="16" height="10" viewBox="0 0 16 10">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 4}
              y={9 - (i + 1) * 2.2}
              width="3"
              height={(i + 1) * 2.2}
              rx="0.5"
              fill="white"
              opacity={0.3 + i * 0.2}
            />
          ))}
        </svg>

        <svg width="14" height="11" viewBox="0 0 24 18">
          <path
            d="M12 13.5l2.5-3a4 4 0 0 0-5 0l2.5 3z"
            fill="white"
          />
          <path
            d="M12 13.5l5-6a9 9 0 0 0-10 0l5 6z"
            fill="white"
            opacity="0.6"
          />
          <path
            d="M12 13.5l8-9.5a15 15 0 0 0-16 0l8 9.5z"
            fill="white"
            opacity="0.25"
          />
        </svg>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <div
            style={{
              width: 22,
              height: 11,
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.4)",
              padding: 1.5,
              display: "flex",
            }}
          >
            <div
              style={{
                width: "78%",
                height: "100%",
                borderRadius: 1.5,
                background: C.green,
              }}
            />
          </div>

          <div
            style={{
              width: 2,
              height: 5,
              borderRadius: "0 1px 1px 0",
              background: "rgba(255,255,255,0.4)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FIXED TOGGLE
========================================================= */

function Toggle({
  on,
  color = C.cyan,
  onClick,
}: {
  on: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        background: on
          ? `linear-gradient(90deg, ${color}88, ${color}55)`
          : "rgba(255,255,255,0.08)",
        border: `1px solid ${
          on ? color + "55" : "rgba(255,255,255,0.1)"
        }`,
        boxShadow: on ? `0 0 8px ${color}44` : "none",
        display: "flex",
        alignItems: "center",
        padding: 3,
        justifyContent: on ? "flex-end" : "flex-start",
        transition: "all 0.2s",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: C.white,
          transition: "all 0.2s",
          boxShadow: on ? `0 0 6px ${color}` : "none",
        }}
      />
    </button>
  );
}

/* =========================================================
   SENSOR TILE
========================================================= */

function SensorTile({
  label,
  val,
  color,
}: {
  label: string;
  val: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 12,
        background: "linear-gradient(135deg, #0f0f1c, #090913)",
        border: `1px solid ${color}22`,
        padding: "10px 6px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          position: "relative",
          background: `radial-gradient(circle at center, ${color}16 0%, transparent 70%)`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 6,
            border: `1px dashed ${color}30`,
            borderRadius: 4,
          }}
        />

        <span
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            fontWeight: 700,
            color,
            textShadow: `0 0 6px ${color}`,
          }}
        >
          {val}
        </span>
      </div>

      <span
        style={{
          fontFamily: F.mono,
          fontSize: 8,
          color: C.mute,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>

      <Bar pct={parseInt(val) * 1.4} color={color} height={3} />
    </div>
  );
}

/* =========================================================
   BOTTOM NAV
========================================================= */

const NAV_ITEMS: {
  id: Screen;
  label: string;
  path: string;
}[] = [
  {
    id: "dash",
    label: "Home",
    path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  },
  {
    id: "setup",
    label: "Gaming",
    path: "M2 6h20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M8 12h4m-2-2v4 M17 10h.01 M20 12h.01",
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "M18 20V10 M12 20V4 M6 20v-6",
  },
  {
    id: "ai",
    label: "AI / NPU",
    path: "M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2v1a1 1 0 0 1-1 1h-1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z",
  },
];

function BottomNav({
  active,
  go,
}: {
  active: Screen;
  go: (s: Screen) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "8px 0 6px",
        borderTop: `1px solid ${C.border}`,
        background:
          "linear-gradient(180deg, #000000 0%, #060610 100%)",
      }}
    >
      {NAV_ITEMS.map(({ id, label, path }) => {
        const activeNow = active === id;

        return (
          <button
            key={id}
            onClick={() => go(id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 12px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={activeNow ? C.cyan : "#444"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: activeNow
                  ? `drop-shadow(0 0 4px ${C.cyan})`
                  : "none",
              }}
            >
              {path.split(" M").map((seg, i) => (
                <path key={i} d={i === 0 ? seg : "M" + seg} />
              ))}
            </svg>

            <span
              style={{
                fontFamily: F.body,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: activeNow ? C.cyan : "#444",
              }}
            >
              {label}
            </span>

            {activeNow && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  background: C.cyan,
                  boxShadow: `0 0 6px ${C.cyan}`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   SCREEN 1 — DASHBOARD
========================================================= */

function ScreenDash({
  go,
}: {
  go: (s: Screen) => void;
}) {
  return (
    <div
      className="anim-slide"
      style={{
        padding: "4px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "linear-gradient(135deg, #00e5ff22, #00e5ff08)",
              border: `1px solid ${C.cyan}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🛡
          </div>

          <span
            style={{
              fontFamily: F.display,
              fontSize: 15,
              fontWeight: 700,
              color: C.white,
              letterSpacing: "0.1em",
            }}
          >
            G-GUARD
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            className="anim-pulse"
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: C.green,
            }}
          />

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: C.green,
              fontWeight: 700,
            }}
          >
            ACTIVE
          </span>
        </div>
      </div>

      <p
        style={{
          fontFamily: F.body,
          fontSize: 9,
          color: "rgba(255,255,255,0.28)",
          margin: 0,
        }}
      >
        Predict the heat · Prevent the throttle · Protect the FPS
      </p>

      <Card style={{ padding: 16, overflow: "visible" }}>
        <Glow
          color={C.cyan}
          opacity={0.08}
          size={140}
          top={-40}
          right={-30}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 96,
              height: 96,
            }}
          >
            <ArcGauge pct={72} color={C.cyan} />

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.cyan,
                }}
              >
                72%
              </span>

              <span
                style={{
                  fontFamily: F.body,
                  fontSize: 8,
                  color: C.mute,
                }}
              >
                Thermal Health
              </span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <Tag label="STABLE" color={C.green} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 8,
                    color: C.mute,
                  }}
                >
                  FPS
                </div>

                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 20,
                    color: C.cyan,
                  }}
                >
                  120
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 8,
                    color: C.mute,
                  }}
                >
                  GPU
                </div>

                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 20,
                    color: C.green,
                  }}
                >
                  82%
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 6 }}>
        <SensorTile label="SoC" val="41°" color={C.cyan} />
        <SensorTile label="CPU" val="39°" color={C.green} />
        <SensorTile label="GPU" val="43°" color={C.yellow} />
        <SensorTile label="Batt" val="36°" color={C.green} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <Card style={{ padding: 12 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
            }}
          >
            AI PREDICTIONS
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 22,
              color: C.cyan,
              marginTop: 4,
            }}
          >
            47
          </div>

          <div
            style={{
              fontFamily: F.body,
              fontSize: 9,
              color: C.mute,
            }}
          >
            0 throttle events
          </div>
        </Card>

        <Card style={{ padding: 12 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
            }}
          >
            SESSION TIME
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 22,
              color: C.white,
              marginTop: 4,
            }}
          >
            38:24
          </div>

          <div
            style={{
              fontFamily: F.body,
              fontSize: 9,
              color: C.mute,
            }}
          >
            FPS protected
          </div>
        </Card>
      </div>

      <button
        onClick={() => go("setup")}
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #00bcd4 0%, #006080 100%)",
          border: `1px solid ${C.cyan}55`,
          boxShadow: `0 0 24px ${C.cyan}33`,
          fontFamily: F.display,
          fontSize: 12,
          fontWeight: 700,
          color: "#000",
          letterSpacing: "0.18em",
          cursor: "pointer",
        }}
      >
        START GAMING
      </button>
    </div>
  );
}

/* =========================================================
   SCREEN 2 — GAMING SETUP
   THE THREE TOGGLES ARE FULLY FUNCTIONAL
========================================================= */

function ScreenSetup({
  go,
}: {
  go: (s: Screen) => void;
}) {
  const [settings, setSettings] = useState({
    thermalPrediction: true,
    autoOptimization: true,
    fpsGuard: true,
  });

  const toggleSetting = (
    key:
      | "thermalPrediction"
      | "autoOptimization"
      | "fpsGuard"
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const config = [
    {
      key: "thermalPrediction" as const,
      label: "AI Thermal Prediction",
      onText: "NPU accelerated",
      offText: "Prediction disabled",
      color: C.cyan,
    },
    {
      key: "autoOptimization" as const,
      label: "Auto-Optimization",
      onText: "Trigger at 91% confidence",
      offText: "Automatic optimization disabled",
      color: C.green,
    },
    {
      key: "fpsGuard" as const,
      label: "FPS Guard",
      onText: "Min 90 FPS threshold",
      offText: "FPS protection disabled",
      color: C.yellow,
    },
  ];

  const activeCount =
    Object.values(settings).filter(Boolean).length;

  return (
    <div
      className="anim-slide"
      style={{
        padding: "4px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: C.mute,
            margin: 0,
            letterSpacing: "0.1em",
          }}
        >
          GAMING SETUP
        </p>

        <h2
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 700,
            color: C.white,
            margin: "2px 0 0",
            letterSpacing: "0.06em",
          }}
        >
          BATTLE ARENA
        </h2>
      </div>

      {/* GAME CARD */}

      <div
        style={{
          borderRadius: 18,
          height: 140,
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0a0520 0%, #140828 50%, #080a1c 100%)",
          border: "1px solid rgba(139,0,255,0.2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,229,255,0.06) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />

        <Glow
          color={C.cyan}
          opacity={0.12}
          size={160}
          top={-50}
          right={-30}
        />

        <Glow
          color={C.purple}
          opacity={0.1}
          size={120}
          top={20}
          right={-10}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "14px 16px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Tag label="120Hz" color={C.cyan} />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                className="anim-pulse"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: C.green,
                }}
              />

              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 9,
                  color: C.green,
                  fontWeight: 700,
                }}
              >
                READY
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 20,
                fontWeight: 700,
                color: C.white,
                letterSpacing: "0.06em",
              }}
            >
              BATTLE ARENA
            </div>

            <div
              style={{
                fontFamily: F.body,
                fontSize: 10,
                color: C.mute,
                marginTop: 3,
              }}
            >
              Pro Mode · Competitive
            </div>
          </div>
        </div>
      </div>

      {/* THERMAL READINESS */}

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          THERMAL READINESS
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          {[
            {
              label: "SoC Temp",
              value: "41°C",
              color: C.cyan,
            },
            {
              label: "Headroom",
              value: "18%",
              color: C.green,
            },
            {
              label: "Risk Level",
              value: "LOW",
              color: C.green,
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 16,
                  fontWeight: 700,
                  color,
                  textShadow: `0 0 8px ${color}88`,
                }}
              >
                {value}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 8,
                  color: C.mute,
                  marginTop: 2,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        <Bar pct={82} color={C.green} height={6} />

        <div
          style={{
            fontFamily: F.body,
            fontSize: 9,
            color: C.mute,
            marginTop: 4,
          }}
        >
          System thermal readiness · 82%
        </div>
      </Card>

      {/* G-GUARD CONFIG */}

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          G-GUARD CONFIG
        </div>

        {config.map(
          ({
            key,
            label,
            onText,
            offText,
            color,
          }) => {
            const enabled = settings[key];

            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom:
                    "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: F.body,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.white,
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 9,
                      color: enabled
                        ? C.mute
                        : "rgba(255,255,255,0.2)",
                      marginTop: 1,
                    }}
                  >
                    {enabled ? onText : offText}
                  </div>
                </div>

                <Toggle
                  on={enabled}
                  color={color}
                  onClick={() => toggleSetting(key)}
                />
              </div>
            );
          }
        )}
      </Card>

      {/* ACTIVE PROTECTIONS */}

      <Card
        style={{
          padding: "10px 14px",
          borderColor: C.cyan + "18",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
              letterSpacing: "0.08em",
            }}
          >
            ACTIVE PROTECTIONS
          </span>

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              fontWeight: 700,
              color:
                activeCount === 0
                  ? C.red
                  : C.cyan,
            }}
          >
            {activeCount}/3
          </span>
        </div>
      </Card>

      {/* LAUNCH */}

      <button
        onClick={() => go("monitor")}
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #00bcd4 0%, #006080 100%)",
          border: `1px solid ${C.cyan}55`,
          boxShadow: `0 0 24px ${C.cyan}33`,
          fontFamily: F.display,
          fontSize: 12,
          fontWeight: 700,
          color: "#000",
          letterSpacing: "0.18em",
          cursor: "pointer",
        }}
      >
        LAUNCH GAME
      </button>
    </div>
  );
}

/* =========================================================
   SCREEN 3 — LIVE MONITOR
========================================================= */

function ScreenMonitor({
  go,
}: {
  go: (s: Screen) => void;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((x) => x + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const tempData = [
    38, 39, 40, 41, 42, 43, 44, 45, 43, 42, 43, 44, 43, 42, 43,
  ];

  const fpsData = [
    120, 120, 119, 120, 118, 120, 120, 119, 117, 120, 118, 120,
    119, 120, 120,
  ];

  return (
    <div
      className="anim-slide"
      style={{
        padding: "4px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: C.mute,
              margin: 0,
            }}
          >
            LIVE MONITOR
          </p>

          <h2
            style={{
              fontFamily: F.display,
              fontSize: 17,
              color: C.white,
              margin: "2px 0 0",
            }}
          >
            REAL-TIME
          </h2>
        </div>

        <Tag label="LIVE" color={C.red} />
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {[
          ["FPS", "120", C.cyan],
          ["TEMP", "43°C", C.yellow],
          ["GPU", "82%", C.green],
          ["CPU", "74%", C.cyan],
        ].map(([label, value, color]) => (
          <div
            key={label}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: "10px 6px",
              textAlign: "center",
              background:
                "linear-gradient(135deg, #0e0e1a, #09090f)",
              border: `1px solid ${color}18`,
            }}
          >
            <div
              style={{
                fontFamily: F.display,
                fontSize: 14,
                fontWeight: 700,
                color,
              }}
            >
              {value}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
                marginTop: 3,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 8,
          }}
        >
          THERMAL TIMELINE
        </div>

        <Spark
          data={tempData}
          color={C.yellow}
          h={56}
          animate
        />

        <div
          style={{
            marginTop: 8,
            borderTop: "1px dashed rgba(255,45,85,0.3)",
            paddingTop: 6,
            fontFamily: F.mono,
            fontSize: 8,
            color: C.red,
          }}
        >
          55°C thermal limit
        </div>
      </Card>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 8,
          }}
        >
          THERMAL RISK
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 30,
                color: C.green,
              }}
            >
              18%
            </div>

            <Tag label="LOW" color={C.green} />
          </div>

          <ArcGauge
            pct={18}
            color={C.green}
            size={60}
            thick={5}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <Bar pct={18} color={C.green} height={5} />
        </div>
      </Card>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          SENSOR BREAKDOWN
        </div>

        {[
          ["SoC Temperature", 43, 70, C.yellow, "°C"],
          ["GPU Load", 82, 100, C.cyan, "%"],
          ["CPU Utilization", 74, 100, C.green, "%"],
          ["Battery Temp", 36, 60, C.green, "°C"],
        ].map(([label, value, max, color, unit]) => (
          <div key={label as string} style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  fontFamily: F.body,
                  fontSize: 11,
                  color: C.dim,
                }}
              >
                {label}
              </span>

              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color,
                }}
              >
                {value}
                {unit}
              </span>
            </div>

            <Bar
              pct={
                ((value as number) /
                  (max as number)) *
                100
              }
              color={color as string}
              height={3}
            />
          </div>
        ))}
      </Card>

      <button
        onClick={() => go("alert")}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 16,
          background: "rgba(255,107,26,0.1)",
          border: `1px solid ${C.orange}44`,
          fontFamily: F.display,
          fontSize: 11,
          fontWeight: 700,
          color: C.orange,
          cursor: "pointer",
        }}
      >
        SIMULATE ALERT →
      </button>
    </div>
  );
}

/* =========================================================
   SCREEN 4 — ALERT
========================================================= */

function ScreenAlert({
  go,
}: {
  go: (s: Screen) => void;
}) {
  const [secs, setSecs] = useState(167);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecs((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div
      className="anim-slide"
      style={{
        padding: "4px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        className="anim-thermal"
        style={{
          borderRadius: 18,
          padding: 16,
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #160e06 0%, #0f0a04 100%)",
          border: `1px solid ${C.borderO}`,
        }}
      >
        <Glow
          color={C.orange}
          opacity={0.15}
          size={180}
          top={-60}
          right={-40}
        />

        <div style={{ position: "relative" }}>
          <Tag label="AI PREDICTION" color={C.orange} />

          <div
            style={{
              fontFamily: F.display,
              fontSize: 18,
              fontWeight: 800,
              color: C.white,
              lineHeight: 1.2,
              marginTop: 8,
            }}
          >
            THROTTLING RISK
            <br />
            <span style={{ color: C.orange }}>
              DETECTED
            </span>
          </div>

          <div
            style={{
              fontFamily: F.body,
              fontSize: 10,
              color: C.mute,
              marginTop: 8,
            }}
          >
            Thermal threshold breach predicted in
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            <div
              className="anim-blink"
              style={{
                fontFamily: F.display,
                fontSize: 40,
                fontWeight: 800,
                color: C.orange,
              }}
            >
              {mm}:{ss}
            </div>

            <div>
              <Tag
                label="91% confidence"
                color={C.orange}
              />

              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 9,
                  color: C.mute,
                  marginTop: 4,
                }}
              >
                NPU ThermalPredictor-int8
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card accent={C.borderO} style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 8,
          }}
        >
          TEMPERATURE PREDICTION
        </div>

        <Spark
          data={[38, 39, 40, 41, 43, 45, 48, 50, 53, 55]}
          color={C.orange}
          h={80}
          animate
        />

        <div
          style={{
            marginTop: 8,
            fontFamily: F.mono,
            fontSize: 8,
            color: C.red,
          }}
        >
          55°C threshold
        </div>
      </Card>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 8,
          }}
        >
          TRIGGER SIGNALS
        </div>

        {[
          ["GPU Load Spike", "82% → 91%", C.orange],
          ["SoC Temperature", "43°C (+2.1/min)", C.yellow],
          ["Battery Temperature", "36°C climbing", C.yellow],
        ].map(([label, value, color]) => (
          <div
            key={label as string}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom:
                "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.dim,
              }}
            >
              {label}
            </span>

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 9,
                fontWeight: 700,
                color,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </Card>

      <button
        onClick={() => go("optimize")}
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #ff4d6a 0%, #cc1a33 100%)",
          border: `1px solid ${C.red}55`,
          boxShadow: `0 0 24px ${C.red}33`,
          fontFamily: F.display,
          fontSize: 12,
          fontWeight: 700,
          color: "white",
          cursor: "pointer",
        }}
      >
        ⚡ OPTIMIZE NOW
      </button>
    </div>
  );
}

/* =========================================================
   SCREEN 5 — OPTIMIZATION
========================================================= */

function ScreenOptimize({
  go,
}: {
  go: (s: Screen) => void;
}) {
  const [selected, setSelected] = useState([0, 1, 2]);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const actions = [
    {
      title: "Cool Down Mode",
      desc: "Lower CPU/GPU clocks",
      effect: "−4°C",
      color: C.cyan,
    },
    {
      title: "Reduce Load",
      desc: "Cap background GFX",
      effect: "−2°C",
      color: C.yellow,
    },
    {
      title: "Display Optimization",
      desc: "90Hz + brightness adjustment",
      effect: "−3°C",
      color: C.green,
    },
  ];

  const apply = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setApplied(true);
    }, 1400);
  };

  return (
    <div
      className="anim-slide"
      style={{
        padding: "4px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: C.mute,
            margin: 0,
          }}
        >
          AI OPTIMIZATION
        </p>

        <h2
          style={{
            fontFamily: F.display,
            fontSize: 17,
            color: C.white,
            margin: "2px 0 0",
          }}
        >
          THERMAL ACTIONS
        </h2>
      </div>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          PROJECTED IMPACT
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,45,85,0.08)",
            }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.red,
              }}
            >
              BEFORE
            </div>

            <div
              style={{
                fontFamily: F.display,
                fontSize: 24,
                color: C.orange,
                marginTop: 4,
              }}
            >
              45°C
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: C.mute,
            }}
          >
            →
          </div>

          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: 12,
              borderRadius: 12,
              background: "rgba(0,255,136,0.08)",
            }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.green,
              }}
            >
              AFTER
            </div>

            <div
              style={{
                fontFamily: F.display,
                fontSize: 24,
                color: C.green,
                marginTop: 4,
              }}
            >
              41°C
            </div>
          </div>
        </div>
      </Card>

      {actions.map((action, index) => {
        const on = selected.includes(index);

        return (
          <div
            key={action.title}
            onClick={() =>
              setSelected((current) =>
                current.includes(index)
                  ? current.filter((x) => x !== index)
                  : [...current, index]
              )
            }
            style={{
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: on
                ? `${action.color}12`
                : "#09090f",
              border: `1px solid ${
                on
                  ? action.color + "35"
                  : "rgba(255,255,255,0.07)"
              }`,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 13,
                  color: C.white,
                }}
              >
                {action.title}
              </div>

              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 10,
                  color: C.mute,
                }}
              >
                {action.desc}
              </div>
            </div>

            <span
              style={{
                fontFamily: F.mono,
                color: action.color,
                fontWeight: 700,
              }}
            >
              {action.effect}
            </span>

            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                background: on
                  ? action.color
                  : "rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {on && "✓"}
            </div>
          </div>
        );
      })}

      {applied && (
        <Card
          style={{
            padding: 12,
            borderColor: C.borderG,
          }}
        >
          <span
            style={{
              fontFamily: F.body,
              fontSize: 11,
              color: C.green,
            }}
          >
            ✓ Optimizations applied — FPS protected!
          </span>
        </Card>
      )}

      <button
        onClick={
          applied ? () => go("analytics") : apply
        }
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 16,
          background: applied
            ? "linear-gradient(135deg, #00bcd4, #006080)"
            : "linear-gradient(135deg, #00cc66, #008844)",
          border: `1px solid ${
            applied ? C.cyan : C.green
          }55`,
          fontFamily: F.display,
          fontSize: 12,
          fontWeight: 700,
          color: applied ? "#000" : "#fff",
          cursor: "pointer",
        }}
      >
        {loading
          ? "APPLYING..."
          : applied
          ? "VIEW ANALYTICS →"
          : "✓ APPLY"}
      </button>
    </div>
  );
}

/* =========================================================
   SCREEN 6 — ANALYTICS
========================================================= */

function ScreenAnalytics({
  go,
}: {
  go: (s: Screen) => void;
}) {
  const [tab, setTab] = useState<
    "temp" | "fps" | "gpu" | "risk"
  >("temp");

  const data = {
    temp: {
      values: [
        38, 39, 40, 41, 43, 45, 44, 43, 41, 40, 41, 42,
        43, 44, 46,
      ],
      color: C.orange,
      label: "Temperature",
      unit: "°C",
    },
    fps: {
      values: [
        120, 120, 119, 118, 120, 120, 117, 116, 118, 120,
        119, 120,
      ],
      color: C.cyan,
      label: "FPS",
      unit: "",
    },
    gpu: {
      values: [
        75, 78, 80, 82, 85, 88, 86, 84, 82, 80, 81, 83,
      ],
      color: C.green,
      label: "GPU Load",
      unit: "%",
    },
    risk: {
      values: [
        10, 12, 15, 18, 22, 28, 25, 20, 18, 15, 14, 16,
      ],
      color: C.yellow,
      label: "Thermal Risk",
      unit: "%",
    },
  };

  const current = data[tab];

  return (
    <div
      className="anim-slide"
      style={{
        padding: "4px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: C.mute,
            margin: 0,
          }}
        >
          SESSION ANALYTICS
        </p>

        <h2
          style={{
            fontFamily: F.display,
            fontSize: 17,
            color: C.white,
            margin: "2px 0 0",
          }}
        >
          PERFORMANCE
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
        }}
      >
        {[
          ["Peak Temp", "46°C", C.orange],
          ["Avg FPS", "117", C.cyan],
          ["Throttle Events", "0", C.green],
        ].map(([label, value, color]) => (
          <Card
            key={label as string}
            style={{
              flex: 1,
              padding: 10,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: F.display,
                fontSize: 18,
                color,
              }}
            >
              {value}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 7,
                color: C.mute,
              }}
            >
              {label}
            </div>
          </Card>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 12,
          background: "#0a0a14",
        }}
      >
        {(["temp", "fps", "gpu", "risk"] as const).map(
          (item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: 8,
                background:
                  tab === item
                    ? data[item].color + "22"
                    : "transparent",
                border: "none",
                fontFamily: F.mono,
                fontSize: 9,
                fontWeight: 700,
                color:
                  tab === item
                    ? data[item].color
                    : "#555",
                cursor: "pointer",
              }}
            >
              {item.toUpperCase()}
            </button>
          )
        )}
      </div>

      <Card
        accent={current.color + "20"}
        style={{ padding: 14 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontFamily: F.display,
              fontSize: 13,
              color: C.white,
            }}
          >
            {current.label}
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 18,
              color: current.color,
            }}
          >
            {current.values[
              current.values.length - 1
            ]}
            {current.unit}
          </div>
        </div>

        <Spark
          data={current.values}
          color={current.color}
          h={72}
          animate
        />
      </Card>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 8,
          }}
        >
          SESSION EVENTS
        </div>

        {[
          "Session started — G-Guard active",
          "Thermal warning detected",
          "Auto-optimization applied",
          "Throttling risk predicted & prevented",
          "Session complete — 0 throttle events",
        ].map((event, index) => (
          <div
            key={event}
            style={{
              padding: "6px 0",
              fontFamily: F.body,
              fontSize: 10,
              color: C.dim,
              borderBottom:
                "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {index + 1}. {event}
          </div>
        ))}
      </Card>

      <button
        onClick={() => go("summary")}
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #00bcd4, #006080)",
          border: `1px solid ${C.cyan}55`,
          fontFamily: F.display,
          fontSize: 12,
          fontWeight: 700,
          color: "#000",
          cursor: "pointer",
        }}
      >
        VIEW SUMMARY →
      </button>
    </div>
  );
}

/* =========================================================
   SCREEN 7 — AI / NPU
========================================================= */

function ScreenAI({
  go,
}: {
  go: (s: Screen) => void;
}) {
  const pipeline = [
    "Sensors",
    "ML Model",
    "NPU",
    "Prediction",
    "Action",
  ];

  return (
    <div
      className="anim-slide"
      style={{
        padding: "4px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: C.mute,
            margin: 0,
          }}
        >
          AI / NPU
        </p>

        <h2
          style={{
            fontFamily: F.display,
            fontSize: 17,
            color: C.white,
            margin: "2px 0 0",
          }}
        >
          DIAGNOSTICS
        </h2>
      </div>

      <Card
        style={{
          padding: 16,
          borderColor: C.purple + "35",
        }}
      >
        <Glow
          color={C.purple}
          opacity={0.14}
          size={180}
          top={-50}
          right={-30}
        />

        <div
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: C.purple,
            }}
          >
            CORE MODEL
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 15,
              color: C.white,
              marginTop: 4,
            }}
          >
            ThermalPredictor-int8
          </div>

          <div
            style={{
              fontFamily: F.body,
              fontSize: 10,
              color: C.mute,
              marginTop: 2,
            }}
          >
            Quantized Time-Series ML
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginTop: 12,
            }}
          >
            {[
              ["Range", "~3 min"],
              ["Confidence", "91%"],
              ["Latency", "<12ms"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  borderRadius: 10,
                  padding: 8,
                  textAlign: "center",
                  background:
                    "rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 13,
                    color: C.white,
                  }}
                >
                  {value}
                </div>

                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 7,
                    color: C.mute,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
            }}
          >
            HARDWARE DELEGATE
          </span>

          <Tag label="NPU ACTIVE" color={C.cyan} />
        </div>

        {[
          ["NPU Hardware Delegate", "ACTIVE", C.cyan],
          ["CPU Fallback", "READY", C.yellow],
          ["TFLite Runtime", "v2.14.1", C.green],
          ["Model Signature", "VERIFIED", C.green],
        ].map(([label, value, color]) => (
          <div
            key={label as string}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "7px 0",
              borderBottom:
                "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontFamily: F.body,
                fontSize: 10,
                color: C.dim,
              }}
            >
              {label}
            </span>

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                fontWeight: 700,
                color,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          INFERENCE PIPELINE
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {pipeline.map((step, index) => (
            <div
              key={step}
              style={{
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    index === 2
                      ? C.cyan + "18"
                      : "rgba(255,255,255,0.05)",
                  border: `1px solid ${
                    index === 2
                      ? C.cyan + "44"
                      : "rgba(255,255,255,0.09)"
                  }`,
                  fontFamily: F.mono,
                  fontSize: 8,
                  fontWeight: 700,
                  color:
                    index === 2
                      ? C.cyan
                      : C.dim,
                }}
              >
                {step.slice(0, 3).toUpperCase()}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 7,
                  color: C.mute,
                  marginTop: 4,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   SCREEN 8 — SUMMARY
========================================================= */

function ScreenSummary({
  go,
}: {
  go: (s: Screen) => void;
}) {
  return (
    <div
      className="anim-slide"
      style={{
        padding: "4px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          borderRadius: 18,
          padding: 20,
          textAlign: "center",
          background:
            "linear-gradient(135deg, #05100a, #031208)",
          border: `1px solid ${C.borderG}`,
        }}
      >
        <div
          style={{
            fontSize: 42,
            marginBottom: 10,
          }}
        >
          🛡️
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: C.green,
            marginBottom: 5,
          }}
        >
          SESSION COMPLETE
        </div>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 20,
            fontWeight: 800,
            color: C.white,
          }}
        >
          PERFORMANCE
          <br />
          <span style={{ color: C.green }}>
            PROTECTED
          </span>
        </div>

        <div
          style={{
            fontFamily: F.body,
            fontSize: 9,
            color: C.mute,
            marginTop: 6,
          }}
        >
          Session duration: 38:24
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {[
          ["38:24", "Session Duration", C.cyan],
          ["46°C", "Peak Temperature", C.orange],
          ["117", "Average FPS", C.cyan],
          ["2", "Drops Prevented", C.green],
        ].map(([value, label, color]) => (
          <Card
            key={label as string}
            style={{
              padding: 14,
            }}
          >
            <div
              style={{
                fontFamily: F.display,
                fontSize: 22,
                fontWeight: 700,
                color,
              }}
            >
              {value}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
                marginTop: 3,
              }}
            >
              {label}
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          ACHIEVEMENTS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {[
            ["🏆", "Zero Throttle"],
            ["🎯", "91% Accuracy"],
            ["🔥", "FPS Guardian"],
          ].map(([icon, title]) => (
            <div
              key={title}
              style={{
                borderRadius: 10,
                padding: 10,
                textAlign: "center",
                background:
                  "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 20 }}>
                {icon}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 8,
                  color: C.white,
                  marginTop: 5,
                }}
              >
                {title}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div
        style={{
          borderRadius: 12,
          padding: 12,
          textAlign: "center",
          background: C.cyan + "06",
          border: `1px solid ${C.cyan}12`,
        }}
      >
        <p
          style={{
            fontFamily: F.body,
            fontSize: 9,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}
        >
          "Predict the heat. Prevent the throttle. Protect the FPS."
        </p>

        <p
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.cyan,
            margin: "4px 0 0",
          }}
        >
          G-GUARD · iQOO HACKATHON 2026
        </p>
      </div>

      <button
        onClick={() => go("dash")}
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #00bcd4, #006080)",
          border: `1px solid ${C.cyan}55`,
          fontFamily: F.display,
          fontSize: 12,
          fontWeight: 700,
          color: "#000",
          cursor: "pointer",
        }}
      >
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
}

/* =========================================================
   APP ROOT
========================================================= */

export default function App() {
  const [screen, setScreen] =
    useState<Screen>("dash");

  const [key, setKey] = useState(0);

  const go = (nextScreen: Screen) => {
    setScreen(nextScreen);
    setKey((previous) => previous + 1);
  };

  const screens: Record<
    Screen,
    React.ReactNode
  > = {
    dash: <ScreenDash go={go} />,
    setup: <ScreenSetup go={go} />,
    monitor: <ScreenMonitor go={go} />,
    alert: <ScreenAlert go={go} />,
    optimize: <ScreenOptimize go={go} />,
    analytics: <ScreenAnalytics go={go} />,
    ai: <ScreenAI go={go} />,
    summary: <ScreenSummary go={go} />,
  };

  const allScreens: Screen[] = [
    "dash",
    "setup",
    "monitor",
    "alert",
    "optimize",
    "analytics",
    "ai",
    "summary",
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      {/* PHONE FRAME */}

      <div
        style={{
          width: 390,
          height: 844,
          display: "flex",
          flexDirection: "column",
          background: C.bg,
          borderRadius: 48,
          overflow: "hidden",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.8)",
          position: "relative",
        }}
      >
        {/* NOTCH */}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 30,
            background: C.bg,
            borderRadius: "0 0 18px 18px",
            zIndex: 50,
          }}
        />

        {/* POWER BUTTON */}

        <div
          style={{
            position: "absolute",
            right: -3,
            top: 112,
            width: 3,
            height: 52,
            background: "#1a1a1a",
          }}
        />

        {/* VOLUME BUTTONS */}

        <div
          style={{
            position: "absolute",
            left: -3,
            top: 100,
            width: 3,
            height: 32,
            background: "#1a1a1a",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: -3,
            top: 140,
            width: 3,
            height: 32,
            background: "#1a1a1a",
          }}
        />

        {/* STATUS BAR */}

        <div style={{ paddingTop: 8 }}>
          <StatusBar />
        </div>

        {/* TITLE BAR */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 20px 8px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                background: C.cyan + "18",
                border: `1px solid ${C.cyan}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🛡
            </div>

            <span
              style={{
                fontFamily: F.display,
                fontSize: 11,
                fontWeight: 700,
                color: C.white,
                letterSpacing: "0.12em",
              }}
            >
              G-GUARD
            </span>
          </div>

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: C.mute,
              letterSpacing: "0.08em",
            }}
          >
            {screen.toUpperCase()}
          </span>
        </div>

        {/* SCREEN CONTENT */}

        <div
          key={key}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {screens[screen]}
        </div>

        {/* DOT INDICATORS */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
            padding: "5px 0 3px",
          }}
        >
          {allScreens.map((item) => (
            <div
              key={item}
              onClick={() => go(item)}
              style={{
                height: 4,
                borderRadius: 2,
                width: screen === item ? 16 : 4,
                background:
                  screen === item
                    ? C.cyan
                    : "rgba(255,255,255,0.18)",
                boxShadow:
                  screen === item
                    ? `0 0 6px ${C.cyan}`
                    : "none",
                cursor: "pointer",
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>

        {/* BOTTOM NAV */}

        <BottomNav active={screen} go={go} />

        {/* HOME BAR */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 6,
          }}
        >
          <div
            style={{
              width: 112,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.22)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
