import React, { useEffect, useState } from "react";

/* =========================================================
   VMAX
   AI-POWERED GAMING PERFORMANCE
   Full 8-screen frontend prototype
========================================================= */

type Screen =
  | "dash"
  | "setup"
  | "monitor"
  | "alert"
  | "optimize"
  | "analytics"
  | "ai"
  | "summary";

/* =========================================================
   DESIGN TOKENS
========================================================= */

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
   GLOW
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

/* =========================================================
   ARC GAUGE
========================================================= */

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

  const filled = (pct / 100) * spanDeg;

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

/* =========================================================
   SPARKLINE
========================================================= */

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

  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${W} ${h}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon points={fill} fill={`url(#${id})`} />

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

/* =========================================================
   STATUS BAR
========================================================= */

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
        {/* SIGNAL */}
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

        {/* WIFI */}
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

        {/* BATTERY */}
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
   CARD
========================================================= */

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
        background:
          "linear-gradient(135deg, #0f0f1c 0%, #0a0a15 100%)",
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

/* =========================================================
   TAG
========================================================= */

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

/* =========================================================
   PROGRESS BAR
========================================================= */

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
  const numeric = parseInt(val) || 0;

  return (
    <div
      style={{
        flex: 1,
        borderRadius: 12,
        background:
          "linear-gradient(135deg, #0f0f1c, #090913)",
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

      <Bar
        pct={Math.min(100, numeric * 1.4)}
        color={color}
        height={3}
      />
    </div>
  );
}

/* =========================================================
   WORKING TOGGLE
========================================================= */

function Toggle({
  on,
  color = C.cyan,
  onClick,
}: {
  on: boolean;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 42,
        height: 24,
        borderRadius: 14,
        background: on
          ? `linear-gradient(90deg, ${color}88, ${color}55)`
          : "rgba(255,255,255,0.08)",
        border: `1px solid ${
          on ? color + "66" : "rgba(255,255,255,0.1)"
        }`,
        boxShadow: on
          ? `0 0 10px ${color}44`
          : "none",
        display: "flex",
        alignItems: "center",
        padding: 2,
        justifyContent: on ? "flex-end" : "flex-start",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 17,
          height: 17,
          borderRadius: "50%",
          background: on ? "#ffffff" : "#666",
          boxShadow: on
            ? `0 0 5px ${color}`
            : "none",
          transition: "all 0.2s ease",
        }}
      />
    </button>
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
      {/* HEADER */}

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
              background:
                "linear-gradient(135deg, #00e5ff22, #00e5ff08)",
              border: `1px solid ${C.cyan}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.cyan}
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
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
            VMAX
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

      {/* BRAND */}

      <div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 11,
            color: C.cyan,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          AI-POWERED GAMING PERFORMANCE
        </div>

        <p
          style={{
            fontFamily: F.body,
            fontSize: 9,
            color: "rgba(255,255,255,0.28)",
            margin: "3px 0 0",
          }}
        >
          Predict the heat · Prevent the throttle · Protect the FPS
        </p>
      </div>

      {/* THERMAL HEALTH */}

      <Card
        style={{
          padding: 16,
          overflow: "visible",
        }}
      >
        <Glow
          color={C.cyan}
          opacity={0.08}
          size={140}
          top={-40}
          right={-30}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            backgroundImage:
              "linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
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
              flexShrink: 0,
            }}
          >
            <ArcGauge
              pct={72}
              color={C.cyan}
              size={96}
            />

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
                  textShadow: `0 0 10px ${C.cyan}`,
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
            <Tag
              label="STABLE"
              color={C.green}
            />

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
                    fontWeight: 700,
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
                    fontWeight: 700,
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

      {/* SENSOR GRID */}

      <div
        style={{
          display: "flex",
          gap: 6,
        }}
      >
        <SensorTile
          label="SoC"
          val="41°"
          color={C.cyan}
        />

        <SensorTile
          label="CPU"
          val="39°"
          color={C.green}
        />

        <SensorTile
          label="GPU"
          val="43°"
          color={C.yellow}
        />

        <SensorTile
          label="Batt"
          val="36°"
          color={C.green}
        />
      </div>

      {/* QUICK STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <Card style={{ padding: "12px 14px" }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
              marginBottom: 4,
            }}
          >
            AI PREDICTIONS
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 22,
              fontWeight: 700,
              color: C.cyan,
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

        <Card style={{ padding: "12px 14px" }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
              marginBottom: 4,
            }}
          >
            SESSION TIME
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 22,
              fontWeight: 700,
              color: C.white,
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
        type="button"
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
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const config = [
    {
      key: "thermalPrediction" as const,
      label: "AI Thermal Prediction",
      enabled: "NPU accelerated",
      disabled: "Prediction disabled",
      color: C.cyan,
    },
    {
      key: "autoOptimization" as const,
      label: "Auto-Optimization",
      enabled: "Trigger at 91% confidence",
      disabled: "Automatic optimization disabled",
      color: C.green,
    },
    {
      key: "fpsGuard" as const,
      label: "FPS Guard",
      enabled: "Min 90 FPS threshold",
      disabled: "FPS protection disabled",
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
      {/* HEADER */}

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
            }}
          >
            <Tag
              label="120Hz"
              color={C.cyan}
            />

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
          ].map((item) => (
            <div
              key={item.label}
              style={{
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 16,
                  fontWeight: 700,
                  color: item.color,
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 8,
                  color: C.mute,
                  marginTop: 2,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <Bar
          pct={82}
          color={C.green}
          height={6}
        />

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

      {/* VMAX CONFIG */}

      <Card style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
              letterSpacing: "0.1em",
            }}
          >
            VMAX CONTROL
          </div>

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color:
                activeCount === 3
                  ? C.green
                  : C.yellow,
            }}
          >
            {activeCount}/3 ACTIVE
          </span>
        </div>

        {config.map((item) => {
          const on = settings[item.key];

          return (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 0",
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
                  {item.label}
                </div>

                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 9,
                    color: on
                      ? item.color
                      : "rgba(255,255,255,0.2)",
                    marginTop: 1,
                    transition: "color 0.2s",
                  }}
                >
                  {on
                    ? item.enabled
                    : item.disabled}
                </div>
              </div>

              <Toggle
                on={on}
                color={item.color}
                onClick={() =>
                  toggleSetting(item.key)
                }
              />
            </div>
          );
        })}
      </Card>

      {/* ACTIVE PROTECTIONS */}

      <Card
        style={{
          padding: "10px 14px",
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
              fontFamily: F.display,
              fontSize: 11,
              fontWeight: 700,
              color:
                activeCount === 3
                  ? C.green
                  : activeCount === 0
                  ? C.red
                  : C.yellow,
            }}
          >
            {activeCount}/3
          </span>
        </div>
      </Card>

      {/* LAUNCH */}

      <button
        type="button"
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

const tempData = [
  38, 39, 40, 41, 42, 43, 44, 45,
  43, 42, 43, 44, 43, 42, 43,
];

const fpsData = [
  120, 120, 119, 120, 118, 120, 120,
  119, 117, 120, 118, 120, 119, 120, 120,
];

function ScreenMonitor({
  go,
}: {
  go: (s: Screen) => void;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((x) => x + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
              fontWeight: 700,
              color: C.white,
              margin: "2px 0 0",
            }}
          >
            REAL-TIME
          </h2>
        </div>

        <Tag
          label="LIVE"
          color={C.red}
        />
      </div>

      {/* LIVE TILES */}

      <div
        style={{
          display: "flex",
          gap: 6,
        }}
      >
        {[
          {
            label: "FPS",
            value: "120",
            color: C.cyan,
          },
          {
            label: "TEMP",
            value: "43°C",
            color: C.yellow,
          },
          {
            label: "GPU",
            value: "82%",
            color: C.green,
          },
          {
            label: "CPU",
            value: "74%",
            color: C.cyan,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: "10px 6px",
              textAlign: "center",
              background:
                "linear-gradient(135deg, #0e0e1a, #09090f)",
              border: `1px solid ${item.color}18`,
            }}
          >
            <div
              style={{
                fontFamily: F.display,
                fontSize: 14,
                fontWeight: 700,
                color: item.color,
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
                marginTop: 3,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* THERMAL TIMELINE */}

      <Card style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
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
              THERMAL TIMELINE
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 2,
                    background: C.yellow,
                  }}
                />

                <span
                  style={{
                    fontFamily: F.body,
                    fontSize: 9,
                    color: C.mute,
                  }}
                >
                  SoC Temp
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 2,
                    background: C.cyan,
                  }}
                />

                <span
                  style={{
                    fontFamily: F.body,
                    fontSize: 9,
                    color: C.mute,
                  }}
                >
                  FPS
                </span>
              </div>
            </div>
          </div>

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
            }}
          >
            last 15s
          </span>
        </div>

        <div
          style={{
            position: "relative",
            height: 56,
          }}
        >
          <Spark
            data={tempData}
            color={C.yellow}
            h={56}
            animate
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.45,
            }}
          >
            <Spark
              data={fpsData.map(
                (v) => (v - 112) * 8
              )}
              color={C.cyan}
              h={56}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 6,
          }}
        >
          <div
            style={{
              flex: 1,
              borderTop:
                "1px dashed rgba(255,45,85,0.3)",
            }}
          />

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: "rgba(255,45,85,0.5)",
            }}
          >
            55°C limit
          </span>
        </div>
      </Card>

      {/* THERMAL RISK */}

      <Card style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
                marginBottom: 4,
              }}
            >
              THERMAL RISK
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 30,
                  fontWeight: 700,
                  color: C.green,
                }}
              >
                18%
              </span>

              <Tag
                label="LOW"
                color={C.green}
              />
            </div>
          </div>

          <ArcGauge
            pct={18}
            color={C.green}
            size={60}
            thick={5}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <Bar
            pct={18}
            color={C.green}
            height={5}
          />
        </div>
      </Card>

      {/* SENSOR BREAKDOWN */}

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
          {
            label: "SoC Temperature",
            value: 43,
            max: 70,
            color: C.yellow,
            unit: "°C",
          },
          {
            label: "GPU Load",
            value: 82,
            max: 100,
            color: C.cyan,
            unit: "%",
          },
          {
            label: "CPU Utilization",
            value: 74,
            max: 100,
            color: C.green,
            unit: "%",
          },
          {
            label: "Battery Temp",
            value: 36,
            max: 60,
            color: C.green,
            unit: "°C",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{ marginBottom: 8 }}
          >
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
                {item.label}
              </span>

              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color: item.color,
                }}
              >
                {item.value}
                {item.unit}
              </span>
            </div>

            <Bar
              pct={
                (item.value / item.max) * 100
              }
              color={item.color}
              height={3}
            />
          </div>
        ))}
      </Card>

      <button
        type="button"
        onClick={() => go("alert")}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 16,
          background:
            "rgba(255,107,26,0.1)",
          border: `1px solid ${C.orange}44`,
          fontFamily: F.display,
          fontSize: 11,
          fontWeight: 700,
          color: C.orange,
          letterSpacing: "0.16em",
          cursor: "pointer",
        }}
      >
        SIMULATE ALERT →
      </button>
    </div>
  );
}

/* =========================================================
   SCREEN 4 — PREDICTION ALERT
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

  const mm = String(
    Math.floor(secs / 60)
  ).padStart(2, "0");

  const ss = String(
    secs % 60
  ).padStart(2, "0");

  const W = 270;
  const H = 76;

  const mn = 36;
  const mx = 62;

  const past = [
    38, 39, 40, 41, 42, 43, 44, 45,
  ];

  const pred = [
    45, 47, 50, 52, 55, 57,
  ];

  const all = [...past, ...pred];

  const tx = (i: number) =>
    (i / (all.length - 1)) * W;

  const ty = (v: number) =>
    H -
    2 -
    ((v - mn) / (mx - mn)) *
      (H - 8);

  const pastPts = past
    .map(
      (v, i) =>
        `${tx(i)},${ty(v)}`
    )
    .join(" ");

  const pi = past.length - 1;

  const predPts = pred
    .map(
      (v, i) =>
        `${tx(pi + i)},${ty(v)}`
    )
    .join(" ");

  const threshY = ty(55);

  const lastX = tx(pi);
  const lastY = ty(past[pi]);

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
      {/* ALERT HERO */}

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

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 9,
                fontWeight: 700,
                color: C.orange,
                letterSpacing: "0.12em",
              }}
            >
              AI PREDICTION
            </span>
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 18,
              fontWeight: 800,
              color: C.white,
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            THROTTLING RISK
            <br />
            <span
              style={{
                color: C.orange,
                textShadow: `0 0 14px ${C.orange}`,
              }}
            >
              DETECTED
            </span>
          </div>

          <div
            style={{
              fontFamily: F.body,
              fontSize: 10,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 8,
            }}
          >
            Thermal threshold breach predicted in
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              className="anim-blink"
              style={{
                fontFamily: F.display,
                fontSize: 40,
                fontWeight: 800,
                color: C.orange,
                textShadow:
                  `0 0 20px ${C.orange}, 0 0 40px ${C.orange}66`,
              }}
            >
              {mm}:{ss}
            </div>

            <div>
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background:
                    "rgba(255,107,26,0.15)",
                  border:
                    `1px solid ${C.orange}44`,
                  color: C.orange,
                }}
              >
                91% confidence
              </div>

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

      {/* PREDICTION GRAPH */}

      <Card
        accent={C.borderO}
        style={{ padding: 14 }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          TEMPERATURE PREDICTION
        </div>

        <svg
          width="100%"
          height={H + 16}
          viewBox={`0 0 ${W} ${H + 16}`}
        >
          <defs>
            <linearGradient
              id="predFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={C.orange}
                stopOpacity="0.22"
              />

              <stop
                offset="100%"
                stopColor={C.orange}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <line
            x1="0"
            y1={threshY}
            x2={W}
            y2={threshY}
            stroke={C.red}
            strokeWidth="1"
            strokeDasharray="5 3"
            opacity="0.6"
          />

          <text
            x={W - 2}
            y={threshY - 4}
            fontSize="8"
            fill={C.red}
            textAnchor="end"
          >
            55°C
          </text>

          <polyline
            points={pastPts}
            fill="none"
            stroke={C.cyan}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={`${lastX},${lastY} ${predPts}`}
            fill="none"
            stroke={C.orange}
            strokeWidth="2"
            strokeDasharray="5 3"
            strokeLinecap="round"
          />

          <circle
            cx={lastX}
            cy={lastY}
            r="3.5"
            fill={C.cyan}
          />

          <text
            x="2"
            y={H + 13}
            fontSize="8"
            fill={C.cyan}
          >
            Current
          </text>

          <text
            x={lastX + 5}
            y={H + 13}
            fontSize="8"
            fill={C.orange}
          >
            → Predicted
          </text>
        </svg>
      </Card>

      {/* TRIGGER SIGNALS */}

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          TRIGGER SIGNALS
        </div>

        {[
          {
            label: "GPU Load Spike",
            value: "82% → 91%",
            color: C.orange,
          },
          {
            label: "SoC Temperature",
            value: "43°C (+2.1/min)",
            color: C.yellow,
          },
          {
            label: "Battery Temperature",
            value: "36°C climbing",
            color: C.yellow,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 0",
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
              {item.label}
            </span>

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                fontWeight: 700,
                color: item.color,
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </Card>

      <button
        type="button"
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
          letterSpacing: "0.18em",
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
  const [selected, setSelected] =
    useState<number[]>([0, 1, 2]);

  const [applied, setApplied] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const actions = [
    {
      icon: "❄",
      title: "Cool Down Mode",
      desc: "Lower CPU/GPU clocks",
      effect: "−4°C",
      color: C.cyan,
    },
    {
      icon: "⚡",
      title: "Reduce Load",
      desc: "Cap background GFX",
      effect: "−2°C",
      color: C.yellow,
    },
    {
      icon: "◈",
      title: "Display Optimization",
      desc: "90Hz + brightness adj",
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
            fontWeight: 700,
            color: C.white,
            margin: "2px 0 0",
          }}
        >
          THERMAL ACTIONS
        </h2>
      </div>

      {/* PROJECTED IMPACT */}

      <div
        style={{
          borderRadius: 16,
          padding: 14,
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0c0a18, #080610)",
          border:
            "1px solid rgba(139,0,255,0.2)",
        }}
      >
        <Glow
          color={C.purple}
          opacity={0.08}
          size={140}
          top={-30}
          right={-20}
        />

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
              borderRadius: 12,
              padding: "10px 0",
              textAlign: "center",
              background:
                "rgba(255,45,85,0.08)",
              border:
                "1px solid rgba(255,45,85,0.2)",
            }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.orange,
              }}
            >
              BEFORE
            </div>

            <div
              style={{
                fontFamily: F.display,
                fontSize: 24,
                fontWeight: 700,
                color: C.orange,
                marginTop: 4,
              }}
            >
              45°C
            </div>

            <div
              style={{
                fontFamily: F.body,
                fontSize: 9,
                color: C.mute,
              }}
            >
              Risk: 91%
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
              borderRadius: 12,
              padding: "10px 0",
              textAlign: "center",
              background:
                "rgba(0,255,136,0.08)",
              border:
                `1px solid ${C.borderG}`,
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
                fontWeight: 700,
                color: C.green,
                marginTop: 4,
              }}
            >
              41°C
            </div>

            <div
              style={{
                fontFamily: F.body,
                fontSize: 9,
                color: C.mute,
              }}
            >
              Risk: 28%
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: F.display,
              fontSize: 12,
              fontWeight: 700,
              color: C.green,
            }}
          >
            −4°C · −63% Risk
          </span>
        </div>
      </div>

      {/* ACTIONS */}

      {actions.map((action, index) => {
        const on = selected.includes(index);

        return (
          <button
            type="button"
            key={index}
            onClick={() =>
              setSelected((prev) =>
                prev.includes(index)
                  ? prev.filter(
                      (x) => x !== index
                    )
                  : [...prev, index]
              )
            }
            style={{
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: on
                ? `linear-gradient(135deg, ${action.color}12, ${action.color}06)`
                : "linear-gradient(135deg, #0e0e1a, #09090f)",
              border: `1px solid ${
                on
                  ? action.color + "35"
                  : "rgba(255,255,255,0.07)"
              }`,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background:
                  action.color + "15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {action.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 13,
                  fontWeight: 600,
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
                  marginTop: 2,
                }}
              >
                {action.desc}
              </div>
            </div>

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 12,
                fontWeight: 700,
                color: action.color,
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
          </button>
        );
      })}

      {applied && (
        <div
          style={{
            borderRadius: 12,
            padding: "10px 14px",
            background:
              "rgba(0,255,136,0.08)",
            border:
              `1px solid ${C.borderG}`,
            fontFamily: F.body,
            fontSize: 11,
            fontWeight: 600,
            color: C.green,
          }}
        >
          ✓ Optimizations applied — FPS protected!
        </div>
      )}

      <button
        type="button"
        onClick={
          applied
            ? () => go("analytics")
            : apply
        }
        disabled={loading}
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
          boxShadow: `0 0 24px ${
            applied ? C.cyan : C.green
          }33`,
          fontFamily: F.display,
          fontSize: 12,
          fontWeight: 700,
          color: applied ? "#000" : "#fff",
          letterSpacing: "0.18em",
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
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

const analyticsData = {
  temp: {
    data: [
      38, 39, 40, 41, 43, 45, 44,
      43, 41, 40, 41, 42, 43, 44,
      46, 45, 43, 42, 41, 40,
    ],
    color: C.orange,
    label: "Temperature",
    unit: "°C",
  },

  fps: {
    data: [
      120, 120, 119, 118, 120, 120,
      117, 116, 118, 120, 119, 120,
      120, 119, 118, 117, 120, 120,
      119, 120,
    ],
    color: C.cyan,
    label: "FPS",
    unit: "",
  },

  gpu: {
    data: [
      75, 78, 80, 82, 85, 88, 86,
      84, 82, 80, 81, 83, 85, 84,
      82, 80, 78, 79, 80, 82,
    ],
    color: C.green,
    label: "GPU Load",
    unit: "%",
  },

  risk: {
    data: [
      10, 12, 15, 18, 22, 28, 25,
      20, 18, 15, 14, 16, 20, 24,
      35, 30, 22, 18, 15, 12,
    ],
    color: C.yellow,
    label: "Thermal Risk",
    unit: "%",
  },
};

function ScreenAnalytics({
  go,
}: {
  go: (s: Screen) => void;
}) {
  const [tab, setTab] =
    useState<
      "temp" | "fps" | "gpu" | "risk"
    >("temp");

  const graph = analyticsData[tab];

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
            fontWeight: 700,
            color: C.white,
            margin: "2px 0 0",
          }}
        >
          PERFORMANCE
        </h2>
      </div>

      {/* SUMMARY */}

      <div
        style={{
          display: "flex",
          gap: 8,
        }}
      >
        {[
          {
            label: "Peak Temp",
            value: "46°C",
            color: C.orange,
          },
          {
            label: "Avg FPS",
            value: "117",
            color: C.cyan,
          },
          {
            label: "Throttle Events",
            value: "0",
            color: C.green,
          },
        ].map((item) => (
          <Card
            key={item.label}
            style={{
              flex: 1,
              padding: "10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: F.display,
                fontSize: 18,
                fontWeight: 700,
                color: item.color,
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 7.5,
                color: C.mute,
                marginTop: 3,
              }}
            >
              {item.label}
            </div>
          </Card>
        ))}
      </div>

      {/* TABS */}

      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 12,
          background: "#0a0a14",
          border:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {(
          ["temp", "fps", "gpu", "risk"] as const
        ).map((t) => {
          const d = analyticsData[t];

          return (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: 8,
                background:
                  tab === t
                    ? d.color + "22"
                    : "transparent",
                border: `1px solid ${
                  tab === t
                    ? d.color + "44"
                    : "transparent"
                }`,
                fontFamily: F.mono,
                fontSize: 9,
                fontWeight: 700,
                color:
                  tab === t
                    ? d.color
                    : "#555",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* GRAPH */}

      <Card
        accent={graph.color + "20"}
        style={{ padding: 14 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 8,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 13,
                fontWeight: 700,
                color: C.white,
              }}
            >
              {graph.label}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
                marginTop: 2,
              }}
            >
              38 min session
            </div>
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 18,
              fontWeight: 700,
              color: graph.color,
            }}
          >
            {graph.data[
              graph.data.length - 1
            ]}
            {graph.unit}
          </div>
        </div>

        <div style={{ height: 72 }}>
          <Spark
            data={graph.data}
            color={graph.color}
            h={72}
            animate
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          {[
            "0m",
            "10m",
            "20m",
            "30m",
            "38m",
          ].map((label) => (
            <span
              key={label}
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </Card>

      {/* EVENTS */}

      <Card style={{ padding: 14 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          SESSION EVENTS
        </div>

        {[
          {
            time: "00:00",
            event: "Session started — VMAX active",
            color: C.green,
          },
          {
            time: "12:34",
            event: "Thermal warning detected (43°C)",
            color: C.yellow,
          },
          {
            time: "14:22",
            event: "Auto-optimization applied",
            color: C.cyan,
          },
          {
            time: "26:18",
            event:
              "Throttling risk predicted & prevented",
            color: C.orange,
          },
          {
            time: "38:24",
            event:
              "Session complete — 0 throttle events",
            color: C.green,
          },
        ].map((item) => (
          <div
            key={item.time}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 0",
              borderBottom:
                "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
                width: 38,
              }}
            >
              {item.time}
            </span>

            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                background: item.color,
              }}
            />

            <span
              style={{
                fontFamily: F.body,
                fontSize: 10,
                color: C.dim,
              }}
            >
              {item.event}
            </span>
          </div>
        ))}
      </Card>

      <button
        type="button"
        onClick={() => go("summary")}
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #00bcd4, #006080)",
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
        VIEW SUMMARY →
      </button>
    </div>
  );
}

/* =========================================================
   SCREEN 7 — AI / NPU DIAGNOSTICS
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
            fontWeight: 700,
            color: C.white,
            margin: "2px 0 0",
          }}
        >
          DIAGNOSTICS
        </h2>
      </div>

      {/* MODEL CARD */}

      <div
        style={{
          borderRadius: 16,
          padding: 16,
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #08081a, #050510)",
          border:
            "1px solid rgba(191,95,255,0.22)",
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
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 9,
                  color: C.purple,
                  letterSpacing: "0.1em",
                }}
              >
                CORE MODEL
              </div>

              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.white,
                  marginTop: 3,
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
            </div>

            <Tag
              label="int8"
              color={C.purple}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              {
                label: "Prediction Range",
                value: "~3 min",
              },
              {
                label: "Confidence",
                value: "91%",
              },
              {
                label: "Latency",
                value: "<12ms",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  borderRadius: 10,
                  padding: "8px 10px",
                  textAlign: "center",
                  background:
                    "rgba(255,255,255,0.04)",
                  border:
                    "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.white,
                  }}
                >
                  {item.value}
                </div>

                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 7.5,
                    color: C.mute,
                    marginTop: 2,
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HARDWARE DELEGATE */}

      <Card style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
              letterSpacing: "0.1em",
            }}
          >
            HARDWARE DELEGATE
          </div>

          <Tag
            label="NPU ACTIVE"
            color={C.cyan}
          />
        </div>

        {[
          {
            label: "NPU Hardware Delegate",
            value: "ACTIVE",
            color: C.cyan,
          },
          {
            label: "CPU Fallback",
            value: "READY",
            color: C.yellow,
          },
          {
            label: "TFLite Runtime",
            value: "v2.14.1",
            color: C.green,
          },
          {
            label: "Model Signature",
            value: "VERIFIED",
            color: C.green,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0",
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
              {item.label}
            </span>

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
                background:
                  item.color + "14",
                border:
                  `1px solid ${item.color}25`,
                color: item.color,
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </Card>

      {/* SENSOR INPUTS */}

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
          SENSOR INPUTS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: 8,
          }}
        >
          {[
            "CPU",
            "GPU",
            "Battery",
            "SoC",
          ].map((sensor) => (
            <div
              key={sensor}
              style={{
                borderRadius: 10,
                padding: "10px 4px",
                textAlign: "center",
                background:
                  C.cyan + "08",
                border:
                  `1px solid ${C.cyan}15`,
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.cyan,
                }}
              >
                {sensor}
              </div>

              <div
                className="anim-pulse"
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  background: C.green,
                  margin:
                    "6px auto 0",
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* INFERENCE PIPELINE */}

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
          INFERENCE PIPELINE
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {pipeline.map((step, index) => (
            <React.Fragment key={step}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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
                    border:
                      `1px solid ${
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
                        : "rgba(255,255,255,0.55)",
                  }}
                >
                  {step
                    .slice(0, 3)
                    .toUpperCase()}
                </div>

                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 7,
                    color: C.mute,
                    marginTop: 4,
                    textAlign: "center",
                    maxWidth: 40,
                  }}
                >
                  {step}
                </div>
              </div>

              {index <
                pipeline.length - 1 && (
                <div
                  style={{
                    width: 10,
                    height: 1,
                    background:
                      `linear-gradient(90deg, ${C.cyan}55, ${C.cyan}15)`,
                    marginBottom: 14,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 8,
            background:
              C.yellow + "08",
            border:
              `1px solid ${C.yellow}20`,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              fontWeight: 700,
              color: C.yellow,
            }}
          >
            CPU FALLBACK READY
          </span>

          <span
            style={{
              fontFamily: F.body,
              fontSize: 8,
              color: C.mute,
            }}
          >
            — if NPU unavailable
          </span>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   SCREEN 8 — SESSION SUMMARY
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
      {/* HERO */}

      <div
        style={{
          borderRadius: 18,
          padding: 20,
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
          background:
            "linear-gradient(135deg, #05100a, #031208)",
          border:
            `1px solid ${C.borderG}`,
        }}
      >
        <Glow
          color={C.green}
          opacity={0.12}
          size={200}
          top={-50}
          right={-30}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background:
                  `radial-gradient(circle, ${C.green}18 0%, transparent 70%)`,
                border:
                  `1px solid ${C.green}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.cyan}
                strokeWidth="1.5"
              >
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6-8 10-8 10z"
                  fill={C.cyan + "10"}
                />

                <path
                  d="M9 12l2 2 4-4"
                  stroke={C.green}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: C.green,
              letterSpacing: "0.14em",
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
              lineHeight: 1.2,
              marginTop: 4,
            }}
          >
            PERFORMANCE
            <br />

            <span
              style={{
                color: C.green,
                textShadow:
                  `0 0 14px ${C.green}`,
              }}
            >
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
      </div>

      {/* STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {[
          {
            label: "Session Duration",
            value: "38:24",
            color: C.cyan,
            icon: "⏱",
          },
          {
            label: "Peak Temperature",
            value: "46°C",
            color: C.orange,
            icon: "🌡",
          },
          {
            label: "Average FPS",
            value: "117",
            color: C.cyan,
            icon: "⚡",
          },
          {
            label: "Drops Prevented",
            value: "2",
            color: C.green,
            icon: "🛡",
          },
        ].map((item) => (
          <Card
            key={item.label}
            style={{
              padding: "12px 14px",
              border:
                `1px solid ${item.color}18`,
            }}
          >
            <div
              style={{
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              {item.icon}
            </div>

            <div
              style={{
                fontFamily: F.display,
                fontSize: 22,
                fontWeight: 700,
                color: item.color,
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
                marginTop: 3,
              }}
            >
              {item.label}
            </div>
          </Card>
        ))}
      </div>

      {/* ACHIEVEMENTS */}

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
          ACHIEVEMENTS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3,1fr)",
            gap: 8,
          }}
        >
          {[
            {
              icon: "🏆",
              title: "Zero Throttle",
              sub: "Perfect session",
            },
            {
              icon: "🎯",
              title: "91% Accuracy",
              sub: "AI prediction",
            },
            {
              icon: "🔥",
              title: "FPS Guardian",
              sub: "Avg 117 FPS",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                borderRadius: 10,
                padding: "10px 8px",
                textAlign: "center",
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  marginBottom: 5,
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 8,
                  fontWeight: 700,
                  color: C.white,
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  fontFamily: F.body,
                  fontSize: 8,
                  color: C.mute,
                  marginTop: 2,
                }}
              >
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* VMAX BRAND */}

      <div
        style={{
          borderRadius: 12,
          padding: "10px 14px",
          textAlign: "center",
          background: C.cyan + "06",
          border:
            `1px solid ${C.cyan}12`,
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
            color: C.cyan + "77",
            margin: "4px 0 0",
            letterSpacing: "0.12em",
          }}
        >
          VMAX · AI-POWERED GAMING PERFORMANCE
        </p>
      </div>

      <button
        type="button"
        onClick={() => go("dash")}
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #00bcd4, #006080)",
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
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
}

/* =========================================================
   BOTTOM NAV
========================================================= */

const NAV_ITEMS: {
  id: Screen;
  label: string;
}[] = [
  {
    id: "dash",
    label: "Home",
  },
  {
    id: "setup",
    label: "Gaming",
  },
  {
    id: "analytics",
    label: "Analytics",
  },
  {
    id: "ai",
    label: "AI / NPU",
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
        borderTop:
          `1px solid ${C.border}`,
        background:
          "linear-gradient(180deg, #000000 0%, #060610 100%)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const activeState =
          active === item.id;

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => go(item.id)}
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
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activeState
                  ? C.cyan
                  : "#444",
                fontFamily: F.mono,
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              {item.label === "Home"
                ? "⌂"
                : item.label === "Gaming"
                ? "⌁"
                : item.label === "Analytics"
                ? "▥"
                : "AI"}
            </div>

            <span
              style={{
                fontFamily: F.body,
                fontSize: 9,
                fontWeight: 600,
                color: activeState
                  ? C.cyan
                  : "#444",
              }}
            >
              {item.label}
            </span>

            {activeState && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  background: C.cyan,
                  boxShadow:
                    `0 0 6px ${C.cyan}`,
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
   APP ROOT
========================================================= */

export default function App() {
  const [screen, setScreen] =
    useState<Screen>("dash");

  const [screenKey, setScreenKey] =
    useState(0);

  const go = (next: Screen) => {
    setScreen(next);
    setScreenKey((k) => k + 1);
  };

  const screens: Record<
    Screen,
    React.ReactNode
  > = {
    dash: (
      <ScreenDash go={go} />
    ),

    setup: (
      <ScreenSetup go={go} />
    ),

    monitor: (
      <ScreenMonitor go={go} />
    ),

    alert: (
      <ScreenAlert go={go} />
    ),

    optimize: (
      <ScreenOptimize go={go} />
    ),

    analytics: (
      <ScreenAnalytics go={go} />
    ),

    ai: (
      <ScreenAI go={go} />
    ),

    summary: (
      <ScreenSummary go={go} />
    ),
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      {/* =====================================================
          PHONE FRAME
      ===================================================== */}

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
            transform:
              "translateX(-50%)",
            width: 110,
            height: 30,
            background: C.bg,
            borderRadius:
              "0 0 18px 18px",
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
            borderRadius:
              "0 2px 2px 0",
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
            borderRadius:
              "2px 0 0 2px",
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
            borderRadius:
              "2px 0 0 2px",
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
            borderBottom:
              `1px solid ${C.border}`,
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
                background:
                  C.cyan + "18",
                border:
                  `1px solid ${C.cyan}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.cyan}
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
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
              VMAX
            </span>
          </div>

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: C.mute,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {screen}
          </span>
        </div>

        {/* SCREEN CONTENT */}

        <div
          key={screenKey}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {screens[screen]}
        </div>

        {/* SCREEN DOTS */}

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
            <button
              type="button"
              key={item}
              aria-label={`Go to ${item}`}
              onClick={() => go(item)}
              style={{
                height: 4,
                width:
                  screen === item
                    ? 16
                    : 4,
                borderRadius: 2,
                background:
                  screen === item
                    ? C.cyan
                    : "rgba(255,255,255,0.18)",
                border: "none",
                padding: 0,
                boxShadow:
                  screen === item
                    ? `0 0 6px ${C.cyan}`
                    : "none",
                cursor: "pointer",
                transition:
                  "all 0.25s",
              }}
            />
          ))}
        </div>

        {/* BOTTOM NAV */}

        <BottomNav
          active={screen}
          go={go}
        />

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
              background:
                "rgba(255,255,255,0.22)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
