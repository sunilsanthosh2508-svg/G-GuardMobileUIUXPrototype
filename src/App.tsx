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
  bg: "#07090d",
  panel: "#10141b",
  white: "#ffffff",
  mute: "#8b96a5",
  cyan: "#00e5ff",
  green: "#00ff9d",
  yellow: "#ffd600",
  red: "#ff3d71",
  purple: "#9d4edd",
  orange: "#ff6b35",
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
  opacity,
  size,
  top,
  right,
}: {
  color: string;
  opacity: number;
  size: number;
  top: number;
  right: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        top,
        right,
        borderRadius: "50%",
        background: color,
        opacity,
        filter: "blur(45px)",
        pointerEvents: "none",
      }}
    />
  );
}

/* =========================================================
   CARD
========================================================= */

function Card({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, rgba(20,24,32,0.96), rgba(9,12,17,0.96))",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
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
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 9px",
        borderRadius: 7,
        background: `${color}12`,
        border: `1px solid ${color}35`,
        color,
        fontFamily: F.mono,
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: "0.08em",
      }}
    >
      {label}
    </div>
  );
}

/* =========================================================
   BAR
========================================================= */

function Bar({
  pct,
  color,
  height = 6,
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
        borderRadius: height,
        background: "rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: height,
          background: color,
          boxShadow: `0 0 10px ${color}66`,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
  on,
  color,
  onClick,
}: {
  on: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 50,
        height: 28,
        borderRadius: 20,
        border: `1px solid ${
          on ? color : "rgba(255,255,255,0.14)"
        }`,
        background: on
          ? `${color}22`
          : "rgba(255,255,255,0.05)",
        padding: 3,
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s ease",
        boxShadow: on
          ? `0 0 14px ${color}30`
          : "none",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: on ? color : "#555d68",
          transform: on
            ? "translateX(21px)"
            : "translateX(0)",
          transition: "all 0.2s ease",
          boxShadow: on
            ? `0 0 9px ${color}`
            : "none",
        }}
      />
    </button>
  );
}

/* =========================================================
   DASHBOARD SCREEN
========================================================= */

function ScreenDash({
  go,
}: {
  go: (screen: Screen) => void;
}) {
  const quickStats = [
    { label: "Avg FPS", value: "116", color: C.green },
    { label: "Sessions", value: "24", color: C.cyan },
    { label: "Thermal Events", value: "2", color: C.yellow },
    { label: "Optimizations", value: "18", color: C.purple },
  ];

  return (
    <div
      className="anim-slide"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 30px",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: C.mute,
            margin: 0,
            letterSpacing: "0.12em",
          }}
        >
          GAMING PERFORMANCE SYSTEM
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 4,
          }}
        >
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 27,
              fontWeight: 900,
              color: C.white,
              margin: 0,
              letterSpacing: "0.1em",
              textShadow: `0 0 20px ${C.cyan}25`,
            }}
          >
            VMAX
          </h1>

          <Tag label="AI POWERED" color={C.cyan} />
        </div>

        <p
          style={{
            fontFamily: F.body,
            fontSize: 10,
            color: C.mute,
            margin: "4px 0 0",
          }}
        >
          AI-POWERED GAMING PERFORMANCE
        </p>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.cyan,
            marginTop: 6,
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.18)",
            borderRadius: 6,
            padding: "6px 10px",
            display: "inline-block",
          }}
        >
          🔥 Powered by iQOO 7K Ultra VC · V-Gaming Engine Pro
        </div>
      </div>

      <Card style={{ padding: 16, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          QUICK STATS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 22,
                  fontWeight: 800,
                  color: stat.color,
                  textShadow: `0 0 12px ${stat.color}44`,
                }}
              >
                {stat.value}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 8,
                  color: C.mute,
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={() => go("setup")}
          style={{
            padding: "18px 14px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(0,122,153,0.15) 100%)",
            border: `1px solid ${C.cyan}44`,
            color: C.white,
            fontFamily: F.display,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          🎮 SETUP
        </button>

        <button
          type="button"
          onClick={() => go("monitor")}
          style={{
            padding: "18px 14px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(0,255,157,0.15) 0%, rgba(0,136,84,0.15) 100%)",
            border: `1px solid ${C.green}44`,
            color: C.white,
            fontFamily: F.display,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          📊 MONITOR
        </button>

        <button
          type="button"
          onClick={() => go("alert")}
          style={{
            padding: "18px 14px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(255,61,113,0.15) 0%, rgba(204,0,51,0.15) 100%)",
            border: `1px solid ${C.red}44`,
            color: C.white,
            fontFamily: F.display,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          ⚠️ ALERTS
        </button>

        <button
          type="button"
          onClick={() => go("optimize")}
          style={{
            padding: "18px 14px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(255,214,0,0.15) 0%, rgba(204,171,0,0.15) 100%)",
            border: `1px solid ${C.yellow}44`,
            color: C.white,
            fontFamily: F.display,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          ⚡ OPTIMIZE
        </button>

        <button
          type="button"
          onClick={() => go("analytics")}
          style={{
            padding: "18px 14px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(157,78,221,0.15) 0%, rgba(126,62,177,0.15) 100%)",
            border: `1px solid ${C.purple}44`,
            color: C.white,
            fontFamily: F.display,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          📈 ANALYTICS
        </button>

        <button
          type="button"
          onClick={() => go("ai")}
          style={{
            padding: "18px 14px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(0,122,153,0.15) 100%)",
            border: `1px solid ${C.cyan}44`,
            color: C.white,
            fontFamily: F.display,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          🤖 AI
        </button>

        <button
          type="button"
          onClick={() => go("summary")}
          style={{
            padding: "18px 14px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(204,86,42,0.15) 100%)",
            border: `1px solid ${C.orange}44`,
            color: C.white,
            fontFamily: F.display,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textAlign: "center",
            gridColumn: "1 / -1",
          }}
        >
          📋 SESSION SUMMARY
        </button>
      </div>

      <div
        style={{
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.mute,
          marginTop: 16,
          letterSpacing: "0.08em",
        }}
      >
        VMAX · AI-POWERED GAMING PERFORMANCE
      </div>
    </div>
  );
}

/* =========================================================
   SETUP SCREEN
========================================================= */

function ScreenSetup({
  go,
}: {
  go: (screen: Screen) => void;
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
      enabledText: "NPU accelerated",
      disabledText: "Prediction disabled",
      color: C.cyan,
    },
    {
      key: "autoOptimization" as const,
      label: "Auto-Optimization",
      enabledText: "Trigger at 91% confidence",
      disabledText: "Automatic optimization disabled",
      color: C.green,
    },
    {
      key: "fpsGuard" as const,
      label: "FPS Guard",
      enabledText: "Min 90 FPS threshold",
      disabledText: "FPS protection disabled",
      color: C.yellow,
    },
  ];

  const activeCount =
    Object.values(settings).filter(Boolean).length;

  return (
    <div
      className="anim-slide"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ marginBottom: 4 }}>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: C.mute,
            margin: 0,
            letterSpacing: "0.12em",
          }}
        >
          GAMING PERFORMANCE SYSTEM
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 27,
              fontWeight: 900,
              color: C.white,
              margin: "4px 0 0",
              letterSpacing: "0.1em",
              textShadow: `0 0 20px ${C.cyan}25`,
            }}
          >
            VMAX
          </h1>

          <Tag label="AI POWERED" color={C.cyan} />
        </div>

        <p
          style={{
            fontFamily: F.body,
            fontSize: 10,
            color: C.mute,
            margin: "4px 0 0",
          }}
        >
          AI-POWERED GAMING PERFORMANCE
        </p>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.cyan,
            marginTop: 6,
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.18)",
            borderRadius: 6,
            padding: "6px 10px",
            display: "inline-block",
          }}
        >
          🔥 Powered by iQOO 7K Ultra VC · V-Gaming Engine Pro
        </div>
      </div>

      <div
        style={{
          borderRadius: 18,
          height: 150,
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #08051b 0%, #13102d 50%, #070b18 100%)",
          border: "1px solid rgba(0,229,255,0.18)",
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

        <Glow color={C.cyan} opacity={0.13} size={170} top={-55} right={-35} />
        <Glow color={C.purple} opacity={0.11} size={130} top={30} right={-15} />

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
                gap: 6,
              }}
            >
              <div
                className="anim-pulse"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.green,
                  boxShadow: `0 0 8px ${C.green}`,
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
                SYSTEM READY
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 21,
                fontWeight: 800,
                color: C.white,
                letterSpacing: "0.08em",
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
              Pro Mode · Competitive Performance
            </div>
          </div>
        </div>
      </div>

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
            { label: "SoC Temp", value: "41°C", color: C.cyan },
            { label: "Headroom", value: "18%", color: C.green },
            { label: "Risk Level", value: "LOW", color: C.green },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "center", flex: 1 }}>
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
            marginTop: 5,
          }}
        >
          System thermal readiness · 82%
        </div>
      </Card>

      <Card style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 7,
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

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.cyan,
            }}
          >
            {activeCount}/3 ACTIVE
          </div>
        </div>

        {config.map(({ key, label, enabledText, disabledText, color }) => {
          const on = settings[key];

          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
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
                    color: on ? color : "rgba(255,255,255,0.25)",
                    marginTop: 2,
                    transition: "color 0.2s ease",
                  }}
                >
                  {on ? enabledText : disabledText}
                </div>
              </div>

              <Toggle on={on} color={color} onClick={() => toggleSetting(key)} />
            </div>
          );
        })}
      </Card>

      <Card style={{ padding: "11px 14px", borderColor: `${C.cyan}22` }}>
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
              fontSize: 12,
              fontWeight: 700,
              color:
                activeCount === 3
                  ? C.green
                  : activeCount > 0
                  ? C.yellow
                  : C.red,
            }}
          >
            {activeCount}/3
          </span>
        </div>

        <div style={{ marginTop: 8 }}>
          <Bar
            pct={(activeCount / 3) * 100}
            color={
              activeCount === 3
                ? C.green
                : activeCount > 0
                ? C.yellow
                : C.red
            }
            height={5}
          />
        </div>
      </Card>

      <button
        type="button"
        onClick={() => go("monitor")}
        style={{
          width: "100%",
          padding: "16px 0",
          marginTop: 2,
          borderRadius: 16,
          background: "linear-gradient(135deg, #00e5ff 0%, #007a99 100%)",
          border: `1px solid ${C.cyan}66`,
          boxShadow: `0 0 26px ${C.cyan}30`,
          fontFamily: F.display,
          fontSize: 12,
          fontWeight: 800,
          color: "#001014",
          letterSpacing: "0.18em",
          cursor: "pointer",
        }}
      >
        LAUNCH GAME
      </button>

      <div
        style={{
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.mute,
          letterSpacing: "0.08em",
        }}
      >
        VMAX · AI-POWERED GAMING PERFORMANCE
      </div>
    </div>
  );
}

/* =========================================================
   MONITOR SCREEN
========================================================= */

function ScreenMonitor({
  go,
}: {
  go: (screen: Screen) => void;
}) {
  const [temperature, setTemperature] = useState(42);
  const [fps, setFps] = useState(118);

  useEffect(() => {
    const timer = setInterval(() => {
      setTemperature((old) => {
        const next = old + (Math.random() > 0.5 ? 1 : -1);
        return Math.max(39, Math.min(49, next));
      });

      setFps((old) => {
        const next = old + (Math.random() > 0.5 ? 1 : -1);
        return Math.max(108, Math.min(120, next));
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const thermalRisk =
    temperature >= 48 ? "HIGH" : temperature >= 45 ? "MEDIUM" : "LOW";

  const riskColor =
    thermalRisk === "HIGH"
      ? C.red
      : thermalRisk === "MEDIUM"
      ? C.yellow
      : C.green;

  return (
    <div
      className="anim-slide"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          onClick={() => go("dash")}
          style={{
            background: "transparent",
            border: "none",
            color: C.cyan,
            fontFamily: F.mono,
            fontSize: 9,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← DASH
        </button>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 800,
            color: C.white,
            letterSpacing: "0.1em",
          }}
        >
          VMAX
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <Tag label="NPU: Phi-3-mini" color={C.purple} />
          <Tag label="LIVE" color={C.green} />
        </div>
      </div>

      <Card style={{ padding: 16, borderColor: `${C.green}25` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 10,
          }}
        >
          <div
            className="anim-pulse"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 10px ${C.green}`,
            }}
          />

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.green,
              letterSpacing: "0.1em",
            }}
          >
            PERFORMANCE MONITOR ACTIVE
          </span>
        </div>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 20,
            color: C.white,
            fontWeight: 800,
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
          Real-time gaming performance protection
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginTop: 10,
        }}
      >
        <Card style={{ padding: 15 }}>
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
              fontSize: 27,
              fontWeight: 800,
              color: C.green,
              marginTop: 6,
              textShadow: `0 0 12px ${C.green}55`,
            }}
          >
            {fps}
          </div>

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
              marginTop: 2,
            }}
          >
            TARGET ≥ 90
          </div>
        </Card>

        <Card style={{ padding: 15 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
            }}
          >
            SoC TEMP
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 27,
              fontWeight: 800,
              color: C.cyan,
              marginTop: 6,
            }}
          >
            {temperature}°C
          </div>

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: riskColor,
              marginTop: 2,
            }}
          >
            {thermalRisk} RISK
          </div>
        </Card>
      </div>

      <Card style={{ padding: 15, marginTop: 10, borderColor: `${C.cyan}25` }}>
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
                letterSpacing: "0.1em",
              }}
            >
              AI THERMAL PREDICTION
            </div>

            <div
              style={{
                fontFamily: F.display,
                fontSize: 16,
                fontWeight: 700,
                color: C.cyan,
                marginTop: 5,
              }}
            >
              NPU ACTIVE
            </div>
          </div>

          <div
            className="anim-pulse"
            style={{
              width: 45,
              height: 45,
              borderRadius: "50%",
              border: `2px solid ${C.cyan}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${C.cyan}20`,
            }}
          >
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.cyan,
              }}
            >
              AI
            </span>
          </div>
        </div>

        <div style={{ marginTop: 13 }}>
          <Bar pct={91} color={C.cyan} height={6} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
            }}
          >
            Prediction confidence
          </span>

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.cyan,
              fontWeight: 700,
            }}
          >
            91%
          </span>
        </div>
      </Card>

      <Card style={{ padding: 15, marginTop: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          PROTECTION STATUS
        </div>

        {[
          { name: "AI Thermal Prediction", status: "ACTIVE", color: C.cyan },
          { name: "Auto-Optimization", status: "READY", color: C.green },
          { name: "FPS Guard", status: "PROTECTED", color: C.yellow },
        ].map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.white,
              }}
            >
              {item.name}
            </span>

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: item.color,
                fontWeight: 700,
              }}
            >
              ● {item.status}
            </span>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 15, marginTop: 10, borderColor: `${C.green}25` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
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
              SYSTEM OPTIMIZATION
            </div>

            <div
              style={{
                fontFamily: F.display,
                fontSize: 15,
                fontWeight: 700,
                color: C.green,
                marginTop: 5,
              }}
            >
              PERFORMANCE STABLE
            </div>
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontSize: 19,
              fontWeight: 800,
              color: C.green,
            }}
          >
            98%
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Bar pct={98} color={C.green} height={5} />
        </div>
      </Card>

      <Card
        style={{
          padding: 10,
          marginTop: 10,
          borderColor: `${C.cyan}22`,
          background: "rgba(0,229,255,0.05)",
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 7,
            color: C.mute,
            lineHeight: 1.6,
          }}
        >
          📊 <strong>HackTracker:</strong> Thermal API Active · NPU Inference: 23ms · ADPF Enabled · Device Telemetry: ON
        </div>
      </Card>

      <button
        type="button"
        onClick={() => go("dash")}
        style={{
          width: "100%",
          padding: "15px 0",
          marginTop: 12,
          borderRadius: 15,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: C.white,
          fontFamily: F.display,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.15em",
          cursor: "pointer",
        }}
      >
        END SESSION
      </button>

      <div
        style={{
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.mute,
          marginTop: 12,
        }}
      >
        VMAX · AI-POWERED GAMING PERFORMANCE
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "rgba(157,78,221,0.12)",
          border: "1px solid rgba(157,78,221,0.25)",
          borderRadius: 8,
          padding: "6px 10px",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.purple,
          zIndex: 1000,
        }}
      >
        📱 Built with Office Kit · Phone-First Dev
      </div>
    </div>
  );
}

/* =========================================================
   ALERT SCREEN
========================================================= */

function ScreenAlert({
  go,
}: {
  go: (screen: Screen) => void;
}) {
  const alerts = [
    {
      id: 1,
      type: "THERMAL",
      message: "SoC temperature exceeded 48°C",
      time: "2 min ago",
      severity: "HIGH",
      color: C.red,
    },
    {
      id: 2,
      type: "FPS",
      message: "FPS dropped below 90 threshold",
      time: "5 min ago",
      severity: "MEDIUM",
      color: C.yellow,
    },
    {
      id: 3,
      type: "OPTIMIZATION",
      message: "Auto-optimization triggered",
      time: "8 min ago",
      severity: "INFO",
      color: C.cyan,
    },
  ];

  return (
    <div
      className="anim-slide"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => go("dash")}
          style={{
            background: "transparent",
            border: "none",
            color: C.cyan,
            fontFamily: F.mono,
            fontSize: 9,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← DASH
        </button>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 800,
            color: C.white,
            letterSpacing: "0.1em",
          }}
        >
          ALERTS
        </div>

        <Tag label="3 ACTIVE" color={C.red} />
      </div>

      <Card style={{ padding: 14, marginBottom: 10, borderColor: `${C.red}33` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            className="anim-pulse"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.red,
              boxShadow: `0 0 12px ${C.red}`,
            }}
          />

          <div
            style={{
              fontFamily: F.display,
              fontSize: 16,
              fontWeight: 800,
              color: C.red,
            }}
          >
            CRITICAL ALERTS
          </div>
        </div>

        <div
          style={{
            fontFamily: F.body,
            fontSize: 10,
            color: C.mute,
          }}
        >
          Real-time thermal and performance warnings
        </div>
      </Card>

      {alerts.map((alert) => (
        <Card
          key={alert.id}
          style={{
            padding: 14,
            marginBottom: 10,
            borderLeft: `3px solid ${alert.color}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <Tag label={alert.type} color={alert.color} />

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
              }}
            >
              {alert.time}
            </span>
          </div>

          <div
            style={{
              fontFamily: F.body,
              fontSize: 11,
              color: C.white,
              marginBottom: 6,
            }}
          >
            {alert.message}
          </div>

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: alert.color,
              fontWeight: 700,
            }}
          >
            SEVERITY: {alert.severity}
          </div>
        </Card>
      ))}

      <Card style={{ padding: 14, marginTop: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          ALERT SETTINGS
        </div>

        {[
          { label: "Thermal Alerts", enabled: true, color: C.red },
          { label: "FPS Alerts", enabled: true, color: C.yellow },
          { label: "Optimization Alerts", enabled: false, color: C.cyan },
        ].map((item, idx) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: idx < 2 ? "10px 0" : "10px 0 0",
              borderBottom: idx < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <span
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.white,
              }}
            >
              {item.label}
            </span>

            <Toggle on={item.enabled} color={item.color} onClick={() => {}} />
          </div>
        ))}
      </Card>

      <div
        style={{
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.mute,
          marginTop: 16,
        }}
      >
        VMAX · AI-POWERED GAMING PERFORMANCE
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "rgba(157,78,221,0.12)",
          border: "1px solid rgba(157,78,221,0.25)",
          borderRadius: 8,
          padding: "6px 10px",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.purple,
          zIndex: 1000,
        }}
      >
        📱 Built with Office Kit · Phone-First Dev
      </div>
    </div>
  );
}

/* =========================================================
   OPTIMIZE SCREEN
========================================================= */

function ScreenOptimize({
  go,
}: {
  go: (screen: Screen) => void;
}) {
  const optimizations = [
    {
      name: "CPU Frequency",
      current: "2.4 GHz",
      optimized: "2.8 GHz",
      improvement: "+16%",
      color: C.cyan,
    },
    {
      name: "GPU Boost",
      current: "650 MHz",
      optimized: "720 MHz",
      improvement: "+10%",
      color: C.green,
    },
    {
      name: "Memory Clock",
      current: "3200 MHz",
      optimized: "3600 MHz",
      improvement: "+12%",
      color: C.purple,
    },
    {
      name: "Thermal Profile",
      current: "Balanced",
      optimized: "Performance",
      improvement: "Active",
      color: C.yellow,
    },
  ];

  return (
    <div
      className="anim-slide"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => go("dash")}
          style={{
            background: "transparent",
            border: "none",
            color: C.cyan,
            fontFamily: F.mono,
            fontSize: 9,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← DASH
        </button>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 800,
            color: C.white,
            letterSpacing: "0.1em",
          }}
        >
          OPTIMIZE
        </div>

        <Tag label="AI ACTIVE" color={C.green} />
      </div>

      <Card style={{ padding: 16, marginBottom: 10, borderColor: `${C.green}33` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            className="anim-pulse"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 12px ${C.green}`,
            }}
          />

          <div
            style={{
              fontFamily: F.display,
              fontSize: 16,
              fontWeight: 800,
              color: C.green,
            }}
          >
            AUTO-OPTIMIZATION
          </div>
        </div>

        <div
          style={{
            fontFamily: F.body,
            fontSize: 10,
            color: C.mute,
          }}
        >
          AI-powered system tuning for maximum performance
        </div>

        <div style={{ marginTop: 14 }}>
          <Bar pct={91} color={C.green} height={6} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
              }}
            >
              Optimization confidence
            </span>

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.green,
                fontWeight: 700,
              }}
            >
              91%
            </span>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          PERFORMANCE IMPROVEMENTS
        </div>

        {optimizations.map((opt, idx) => (
          <div
            key={opt.name}
            style={{
              padding: idx < optimizations.length - 1 ? "12px 0" : "12px 0 0",
              borderBottom: idx < optimizations.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: F.body,
                  fontSize: 11,
                  color: C.white,
                }}
              >
                {opt.name}
              </span>

              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 9,
                  color: opt.color,
                  fontWeight: 700,
                }}
              >
                {opt.improvement}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: F.mono,
                fontSize: 8,
              }}
            >
              <span style={{ color: C.mute }}>
                {opt.current} →{" "}
                <span style={{ color: opt.color }}>{opt.optimized}</span>
              </span>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          QUICK ACTIONS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {[
            { label: "Boost Now", color: C.green },
            { label: "Reset Profile", color: C.cyan },
            { label: "View History", color: C.purple },
            { label: "Export Log", color: C.yellow },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              style={{
                padding: "12px 0",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${action.color}33`,
                color: C.white,
                fontFamily: F.mono,
                fontSize: 8,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </Card>

      <button
        type="button"
        style={{
          width: "100%",
          padding: "15px 0",
          borderRadius: 15,
          background: "linear-gradient(135deg, #00ff9d 0%, #00b871 100%)",
          border: `1px solid ${C.green}66`,
          boxShadow: `0 0 20px ${C.green}30`,
          fontFamily: F.display,
          fontSize: 11,
          fontWeight: 800,
          color: "#001014",
          letterSpacing: "0.15em",
          cursor: "pointer",
        }}
      >
        APPLY OPTIMIZATIONS
      </button>

      <div
        style={{
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.mute,
          marginTop: 16,
        }}
      >
        VMAX · AI-POWERED GAMING PERFORMANCE
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "rgba(157,78,221,0.12)",
          border: "1px solid rgba(157,78,221,0.25)",
          borderRadius: 8,
          padding: "6px 10px",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.purple,
          zIndex: 1000,
        }}
      >
        📱 Built with Office Kit · Phone-First Dev
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS SCREEN
========================================================= */

function ScreenAnalytics({
  go,
}: {
  go: (screen: Screen) => void;
}) {
  const stats = [
    { label: "Total Sessions", value: "127", change: "+12%", color: C.cyan },
    { label: "Avg Session", value: "42 min", change: "+8%", color: C.green },
    { label: "Peak FPS", value: "120", change: "Stable", color: C.yellow },
    { label: "Thermal Events", value: "8", change: "-15%", color: C.purple },
  ];

  return (
    <div
      className="anim-slide"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => go("dash")}
          style={{
            background: "transparent",
            border: "none",
            color: C.cyan,
            fontFamily: F.mono,
            fontSize: 9,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← DASH
        </button>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 800,
            color: C.white,
            letterSpacing: "0.1em",
          }}
        >
          ANALYTICS
        </div>

        <Tag label="7 DAYS" color={C.purple} />
      </div>

      <Card style={{ padding: 16, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          PERFORMANCE OVERVIEW
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 7,
                  color: C.mute,
                  marginBottom: 4,
                }}
              >
                {stat.label}
              </div>

              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 20,
                  fontWeight: 800,
                  color: stat.color,
                  textShadow: `0 0 12px ${stat.color}44`,
                }}
              >
                {stat.value}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 8,
                  color: stat.change.startsWith("+") || stat.change === "Stable"
                    ? C.green
                    : C.red,
                  marginTop: 4,
                }}
              >
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          FPS DISTRIBUTION
        </div>

        {[
          { range: "110-120 FPS", pct: 68, color: C.green },
          { range: "90-109 FPS", pct: 24, color: C.yellow },
          { range: "Below 90 FPS", pct: 8, color: C.red },
        ].map((item) => (
          <div key={item.range} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontFamily: F.body,
                  fontSize: 10,
                  color: C.white,
                }}
              >
                {item.range}
              </span>

              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 8,
                  color: item.color,
                  fontWeight: 700,
                }}
              >
                {item.pct}%
              </span>
            </div>

            <Bar pct={item.pct} color={item.color} height={5} />
          </div>
        ))}
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          THERMAL HISTORY
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: F.body,
              fontSize: 10,
              color: C.white,
            }}
          >
            Avg Temperature
          </span>

          <span
            style={{
              fontFamily: F.display,
              fontSize: 18,
              fontWeight: 800,
              color: C.cyan,
            }}
          >
            43°C
          </span>
        </div>

        <Bar pct={72} color={C.cyan} height={6} />

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginTop: 5,
          }}
        >
          Optimal range: 35-45°C
        </div>
      </Card>

      <button
        type="button"
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: C.white,
          fontFamily: F.display,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          cursor: "pointer",
        }}
      >
        EXPORT REPORT
      </button>

      <div
        style={{
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.mute,
          marginTop: 16,
        }}
      >
        VMAX · AI-POWERED GAMING PERFORMANCE
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "rgba(157,78,221,0.12)",
          border: "1px solid rgba(157,78,221,0.25)",
          borderRadius: 8,
          padding: "6px 10px",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.purple,
          zIndex: 1000,
        }}
      >
        📱 Built with Office Kit · Phone-First Dev
      </div>
    </div>
  );
}

/* =========================================================
   AI SCREEN
========================================================= */

function ScreenAI({
  go,
}: {
  go: (screen: Screen) => void;
}) {
  const aiFeatures = [
    {
      name: "Thermal Prediction",
      status: "ACTIVE",
      model: "Phi-3-mini",
      accuracy: "94%",
      color: C.cyan,
    },
    {
      name: "FPS Forecasting",
      status: "ACTIVE",
      model: "Custom LSTM",
      accuracy: "91%",
      color: C.green,
    },
    {
      name: "Auto-Optimization",
      status: "READY",
      model: "Reinforcement Learning",
      accuracy: "89%",
      color: C.yellow,
    },
  ];

  return (
    <div
      className="anim-slide"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => go("dash")}
          style={{
            background: "transparent",
            border: "none",
            color: C.cyan,
            fontFamily: F.mono,
            fontSize: 9,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← DASH
        </button>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 800,
            color: C.white,
            letterSpacing: "0.1em",
          }}
        >
          AI ENGINE
        </div>

        <Tag label="NPU ACTIVE" color={C.purple} />
      </div>

      <Card style={{ padding: 16, marginBottom: 10, borderColor: `${C.purple}33` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            className="anim-pulse"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.purple,
              boxShadow: `0 0 12px ${C.purple}`,
            }}
          />

          <div
            style={{
              fontFamily: F.display,
              fontSize: 16,
              fontWeight: 800,
              color: C.purple,
            }}
          >
            SNAPDRAGON NPU
          </div>
        </div>

        <div
          style={{
            fontFamily: F.body,
            fontSize: 10,
            color: C.mute,
            marginBottom: 12,
          }}
        >
          On-device AI inference for thermal prediction and optimization
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {[
            { label: "Model", value: "Phi-3-mini" },
            { label: "Inference Time", value: "23ms" },
            { label: "Memory", value: "128 MB" },
            { label: "Accuracy", value: "94%" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "rgba(157,78,221,0.08)",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 7,
                  color: C.mute,
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.purple,
                  marginTop: 2,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          AI FEATURES
        </div>

        {aiFeatures.map((feature, idx) => (
          <div
            key={feature.name}
            style={{
              padding: idx < aiFeatures.length - 1 ? "12px 0" : "12px 0 0",
              borderBottom: idx < aiFeatures.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: F.body,
                  fontSize: 11,
                  color: C.white,
                }}
              >
                {feature.name}
              </span>

              <Tag label={feature.status} color={feature.color} />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: F.mono,
                fontSize: 8,
              }}
            >
              <span style={{ color: C.mute }}>Model: {feature.model}</span>
              <span style={{ color: feature.color }}>Accuracy: {feature.accuracy}</span>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          NPU SETTINGS
        </div>

        {[
          { label: "Enable NPU Inference", enabled: true, color: C.purple },
          { label: "Background Processing", enabled: false, color: C.cyan },
          { label: "Power Saving Mode", enabled: true, color: C.green },
        ].map((item, idx) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: idx < 2 ? "10px 0" : "10px 0 0",
              borderBottom: idx < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <span
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.white,
              }}
            >
              {item.label}
            </span>

            <Toggle on={item.enabled} color={item.color} onClick={() => {}} />
          </div>
        ))}
      </Card>

      <div
        style={{
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.mute,
          marginTop: 16,
        }}
      >
        VMAX · AI-POWERED GAMING PERFORMANCE
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "rgba(157,78,221,0.12)",
          border: "1px solid rgba(157,78,221,0.25)",
          borderRadius: 8,
          padding: "6px 10px",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.purple,
          zIndex: 1000,
        }}
      >
        📱 Built with Office Kit · Phone-First Dev
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY SCREEN
========================================================= */

function ScreenSummary({
  go,
}: {
  go: (screen: Screen) => void;
}) {
  const sessionStats = [
    { label: "Duration", value: "2h 18m", color: C.cyan },
    { label: "Avg FPS", value: "116", color: C.green },
    { label: "Peak Temp", value: "47°C", color: C.yellow },
    { label: "Optimizations", value: "12", color: C.purple },
  ];

  return (
    <div
      className="anim-slide"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => go("dash")}
          style={{
            background: "transparent",
            border: "none",
            color: C.cyan,
            fontFamily: F.mono,
            fontSize: 9,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← DASH
        </button>

        <div
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 800,
            color: C.white,
            letterSpacing: "0.1em",
          }}
        >
          SESSION SUMMARY
        </div>

        <Tag label="COMPLETED" color={C.green} />
      </div>

      <Card style={{ padding: 16, marginBottom: 10, borderColor: `${C.green}33` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            className="anim-pulse"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 12px ${C.green}`,
            }}
          />

          <div
            style={{
              fontFamily: F.display,
              fontSize: 16,
              fontWeight: 800,
              color: C.green,
            }}
          >
            SESSION COMPLETE
          </div>
        </div>

        <div
          style={{
            fontFamily: F.body,
            fontSize: 10,
            color: C.mute,
          }}
        >
          BATTLE ARENA · Pro Mode
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginTop: 6,
          }}
        >
          August 28, 2026 · 10:26 AM
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          KEY METRICS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {sessionStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 7,
                  color: C.mute,
                  marginBottom: 6,
                }}
              >
                {stat.label}
              </div>

              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 22,
                  fontWeight: 800,
                  color: stat.color,
                  textShadow: `0 0 12px ${stat.color}44`,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          PERFORMANCE HIGHLIGHTS
        </div>

        {[
          {
            icon: "🎯",
            text: "Maintained 90+ FPS for 94% of session",
            color: C.green,
          },
          {
            icon: "🌡️",
            text: "Thermal throttling prevented 3 times",
            color: C.cyan,
          },
          {
            icon: "⚡",
            text: "Auto-optimization improved performance by 12%",
            color: C.yellow,
          },
          {
            icon: "🤖",
            text: "NPU prediction accuracy: 94%",
            color: C.purple,
          },
        ].map((item) => (
          <div
            key={item.text}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>

            <span
              style={{
                fontFamily: F.body,
                fontSize: 10,
                color: C.white,
                flex: 1,
              }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          style={{
            padding: "14px 0",
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: C.white,
            fontFamily: F.display,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          SHARE
        </button>

        <button
          type="button"
          style={{
            padding: "14px 0",
            borderRadius: 14,
            background: "linear-gradient(135deg, #00e5ff 0%, #007a99 100%)",
            border: `1px solid ${C.cyan}66`,
            color: "#001014",
            fontFamily: F.display,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          NEW SESSION
        </button>
      </div>

      <div
        style={{
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.mute,
          marginTop: 16,
        }}
      >
        VMAX · AI-POWERED GAMING PERFORMANCE
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          background: "rgba(157,78,221,0.12)",
          border: "1px solid rgba(157,78,221,0.25)",
          borderRadius: 8,
          padding: "6px 10px",
          fontFamily: F.mono,
          fontSize: 7,
          color: C.purple,
          zIndex: 1000,
        }}
      >
        📱 Built with Office Kit · Phone-First Dev
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [screen, setScreen] = useState<Screen>("dash");

  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      * {
        box-sizing: border-box;
      }

      html,
      body,
      #root {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 100%;
        background: #07090d;
      }

      body {
        font-family: 'Exo 2', sans-serif;
        overflow-x: hidden;
      }

      button {
        -webkit-tap-highlight-color: transparent;
      }

      *::-webkit-scrollbar {
        display: none;
      }

      * {
        scrollbar-width: none;
      }

      @keyframes pulse-glow {
        0%, 100% {
          opacity: 1;
        }

        50% {
          opacity: 0.4;
        }
      }

      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateY(16px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .anim-pulse {
        animation: pulse-glow 2s ease-in-out infinite;
      }

      .anim-slide {
        animation: slide-in 0.35s ease-out both;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case "dash":
        return <ScreenDash go={setScreen} />;
      case "setup":
        return <ScreenSetup go={setScreen} />;
      case "monitor":
        return <ScreenMonitor go={setScreen} />;
      case "alert":
        return <ScreenAlert go={setScreen} />;
      case "optimize":
        return <ScreenOptimize go={setScreen} />;
      case "analytics":
        return <ScreenAnalytics go={setScreen} />;
      case "ai":
        return <ScreenAI go={setScreen} />;
      case "summary":
        return <ScreenSummary go={setScreen} />;
      default:
        return <ScreenDash go={setScreen} />;
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(circle at top, #101725 0%, #07090d 45%, #050609 100%)",
        color: C.white,
      }}
    >
      {renderScreen()}
    </main>
  );
}
