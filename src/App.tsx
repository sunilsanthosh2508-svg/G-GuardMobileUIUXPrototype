import React, { useEffect, useState } from "react";

type Screen = "setup" | "monitor";

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
      {/* =================================================
          HEADER
      ================================================= */}

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

          <Tag
            label="AI POWERED"
            color={C.cyan}
          />
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
      </div>

      {/* =================================================
          GAME CARD
      ================================================= */}

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

        <Glow
          color={C.cyan}
          opacity={0.13}
          size={170}
          top={-55}
          right={-35}
        />

        <Glow
          color={C.purple}
          opacity={0.11}
          size={130}
          top={30}
          right={-15}
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

      {/* =================================================
          THERMAL READINESS
      ================================================= */}

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
                flex: 1,
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
            marginTop: 5,
          }}
        >
          System thermal readiness · 82%
        </div>
      </Card>

      {/* =================================================
          VMAX CONTROL
      ================================================= */}

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

        {config.map(
          ({
            key,
            label,
            enabledText,
            disabledText,
            color,
          }) => {
            const on = settings[key];

            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 0",
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
                      color: on
                        ? color
                        : "rgba(255,255,255,0.25)",
                      marginTop: 2,
                      transition: "color 0.2s ease",
                    }}
                  >
                    {on ? enabledText : disabledText}
                  </div>
                </div>

                <Toggle
                  on={on}
                  color={color}
                  onClick={() => toggleSetting(key)}
                />
              </div>
            );
          }
        )}
      </Card>

      {/* =================================================
          ACTIVE PROTECTIONS
      ================================================= */}

      <Card
        style={{
          padding: "11px 14px",
          borderColor: `${C.cyan}22`,
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

      {/* =================================================
          LAUNCH GAME
      ================================================= */}

      <button
        type="button"
        onClick={() => go("monitor")}
        style={{
          width: "100%",
          padding: "16px 0",
          marginTop: 2,
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #00e5ff 0%, #007a99 100%)",
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
        const next =
          old + (Math.random() > 0.5 ? 1 : -1);

        return Math.max(39, Math.min(49, next));
      });

      setFps((old) => {
        const next =
          old + (Math.random() > 0.5 ? 1 : -1);

        return Math.max(108, Math.min(120, next));
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const thermalRisk =
    temperature >= 48
      ? "HIGH"
      : temperature >= 45
      ? "MEDIUM"
      : "LOW";

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
        padding: "18px 16px 30px",
      }}
    >
      {/* TOP BAR */}

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
          onClick={() => go("setup")}
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
          ← BACK
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

        <Tag label="LIVE" color={C.green} />
      </div>

      {/* LIVE STATUS */}

      <Card
        style={{
          padding: 16,
          borderColor: `${C.green}25`,
        }}
      >
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

      {/* METRICS */}

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

      {/* AI THERMAL PREDICTION */}

      <Card
        style={{
          padding: 15,
          marginTop: 10,
          borderColor: `${C.cyan}25`,
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

      {/* PROTECTION STATUS */}

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
          {
            name: "AI Thermal Prediction",
            status: "ACTIVE",
            color: C.cyan,
          },
          {
            name: "Auto-Optimization",
            status: "READY",
            color: C.green,
          },
          {
            name: "FPS Guard",
            status: "PROTECTED",
            color: C.yellow,
          },
        ].map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 0",
              borderBottom:
                "1px solid rgba(255,255,255,0.05)",
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

      {/* OPTIMIZATION */}

      <Card
        style={{
          padding: 15,
          marginTop: 10,
          borderColor: `${C.green}25`,
        }}
      >
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

      {/* END SESSION */}

      <button
        type="button"
        onClick={() => go("setup")}
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
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [screen, setScreen] =
    useState<Screen>("setup");

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
      {screen === "setup" ? (
        <ScreenSetup go={setScreen} />
      ) : (
        <ScreenMonitor go={setScreen} />
      )}
    </main>
  );
}
