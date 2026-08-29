import React, { useEffect, useState } from "react";

/* =========================================================
   VMAX — AI-POWERED GAMING PERFORMANCE
   Frontend-only prototype
   8 Screens + Working Controls + Groq-powered reasoning
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

type Settings = {
  thermalPrediction: boolean;
  autoOptimization: boolean;
  fpsGuard: boolean;
};

type AlertSettings = {
  thermal: boolean;
  fps: boolean;
  optimization: boolean;
};

type NpuSettings = {
  inference: boolean;
  background: boolean;
  powerSaving: boolean;
};

type OptimizationState = {
  analyzed: boolean;
  riskDetected: boolean;
  lastAction: string;
  history: string[];
};

const C = {
  bg: "#07090d",
  panel: "#10141b",
  panel2: "#141a23",
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
  display: "system-ui, -apple-system, sans-serif",
  body: "system-ui, -apple-system, sans-serif",
  mono: "ui-monospace, SFMono-Regular, monospace",
};

/* =========================================================
   GROQ AI REASONING
   ---------------------------------------------------------
   Frontend-only prototype.

   Reads its configuration from a Vite environment variable:
     VITE_GROQ_API_KEY   - required, your Groq API key

   SECURITY NOTE:
   This is a Vite frontend, so VITE_GROQ_API_KEY is bundled into the
   client JS and can be read by anyone who inspects the app. That is
   fine for a hackathon/demo prototype, but it is NOT secure for a
   production app. For production, move askGroq()'s fetch call behind
   a server-side endpoint (e.g. a Netlify Function) that holds the
   real key and proxies the request, and call that endpoint instead.
========================================================= */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const GROQ_API_KEY: string | undefined = import.meta.env
  .VITE_GROQ_API_KEY as string | undefined;

const GROQ_MODEL = "llama-3.3-70b-versatile";

function isGroqKeyConfigured(): boolean {
  return typeof GROQ_API_KEY === "string" && GROQ_API_KEY.trim().length > 0;
}

const VMAX_SYSTEM_PROMPT =
  "You are VMAX Gaming Performance AI, an assistant built into a mobile gaming-performance dashboard. " +
  "Analyze the gaming telemetry provided by the application, using the actual FPS, CPU, GPU, RAM and " +
  "temperature values given to you. Do NOT invent hardware changes, and do NOT claim that a system setting " +
  "was actually changed — this is a frontend-only prototype. Never use generic filler phrases such as " +
  "'Adaptive optimization applied.' Return exactly three short parts: 'Detection:' the specific current " +
  "condition, 'Recommendation:' one specific optimization action, and 'Reason:' a short explanation based on " +
  "the actual metrics. Recommendations must be specific and relevant to the metrics given — for example: " +
  "Reduce background workload, Prioritize FPS stability, Reduce thermal load, Maintain balanced performance, " +
  "Prioritize GPU performance, or Reduce unnecessary memory usage. Keep the whole reply concise, under 80 " +
  "words, plain text, no markdown headers or bullet lists.";

type VmaxAiState = {
  fps: number;
  temperature: number;
  cpuUsage?: number;
  gpuUsage?: number;
  ramUsage?: number;
  performanceMode?: string;
  thermalStatus?: string;
  fpsStatus?: string;
  optimizationStatus?: string;
  activeAlerts?: string[];
  sessionInfo?: string;
  action: string;
};

function deriveThermalStatus(temperature: number): string {
  if (temperature >= 46) return "Warning";
  if (temperature >= 43) return "Elevated";
  return "Optimal";
}

function deriveFpsStatus(fps: number): string {
  if (fps >= 108) return "Stable";
  if (fps >= 96) return "Fluctuating";
  return "Unstable";
}

function buildVmaxStatePrompt(state: VmaxAiState): string {
  const lines = [
    "Current VMAX Gaming State:",
    "",
    `FPS: ${state.fps}`,
    `FPS Status: ${state.fpsStatus ?? deriveFpsStatus(state.fps)}`,
    `Temperature: ${state.temperature}°C`,
    `Thermal Status: ${state.thermalStatus ?? deriveThermalStatus(state.temperature)}`,
  ];

  if (state.cpuUsage !== undefined) {
    lines.push(`CPU Usage: ${state.cpuUsage}%`);
  }

  if (state.gpuUsage !== undefined) {
    lines.push(`GPU Usage: ${state.gpuUsage}%`);
  }

  if (state.ramUsage !== undefined) {
    lines.push(`RAM Usage: ${state.ramUsage}%`);
  }

  lines.push(
    `Performance Mode: ${state.performanceMode ?? "Balanced"}`,
    `Optimization Status: ${state.optimizationStatus ?? "Not yet optimized"}`,
    `Active Alerts: ${
      state.activeAlerts && state.activeAlerts.length
        ? state.activeAlerts.join(", ")
        : "None"
    }`
  );

  if (state.sessionInfo) {
    lines.push(`Session: ${state.sessionInfo}`);
  }

  lines.push("", `Requested Action: ${state.action}`, "", "Analyze this state and give the best recommended optimization.");

  return lines.join("\n");
}

/* ---------------------------------------------------------
   Low-level Groq call.
   Sends a system + user message to the Groq OpenAI-compatible
   chat/completions endpoint and returns the assistant's reply text.
--------------------------------------------------------- */
async function askGroq(prompt: string): Promise<string> {
  if (!isGroqKeyConfigured()) {
    throw new Error("MISSING_KEY");
  }

  let response: Response;

  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: VMAX_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });
  } catch (networkError) {
    console.error("Groq network error:", networkError);
    throw new Error("NETWORK_ERROR");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error(
      `Groq API error ${response.status}:`,
      errorBody
    );

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (response.status === 403) throw new Error("FORBIDDEN");
    if (response.status === 429) throw new Error("RATE_LIMITED");

    throw new Error(`API_ERROR_${response.status}`);
  }

  const data = await response.json();

  const aiResponse: string | undefined =
    data?.choices?.[0]?.message?.content?.trim();

  if (!aiResponse) {
    throw new Error("EMPTY_RESPONSE");
  }

  return aiResponse;
}

/* ---------------------------------------------------------
   Local fallback recommendation.
   Used when Groq is unavailable (no key, network error, rate
   limit, etc.) so the Optimize feature still works offline.
--------------------------------------------------------- */
function getLocalFallbackRecommendation(state: VmaxAiState): string {
  const thermalStatus =
    state.thermalStatus ?? deriveThermalStatus(state.temperature);
  const fpsStatus = state.fpsStatus ?? deriveFpsStatus(state.fps);

  if (thermalStatus === "Warning") {
    return `Detection: Temperature is elevated at ${state.temperature}°C. Recommendation: Thermal optimization recommended. Reason: Cooling headroom is reduced, which risks throttling. (Local fallback — Groq unavailable)`;
  }

  if (fpsStatus === "Unstable") {
    return `Detection: FPS is unstable at ${state.fps}. Recommendation: FPS stability optimization recommended. Reason: Frame rate is below the stable target range. (Local fallback — Groq unavailable)`;
  }

  if (state.cpuUsage !== undefined && state.cpuUsage >= 85) {
    return `Detection: CPU usage is elevated at ${state.cpuUsage}%. Recommendation: CPU workload optimization recommended. Reason: High CPU load can reduce headroom for stable frame pacing. (Local fallback — Groq unavailable)`;
  }

  return `Detection: FPS (${state.fps}) and temperature (${state.temperature}°C) are within normal range. Recommendation: System performance is stable — no major optimization is recommended. Reason: Current metrics do not indicate thermal or performance risk. (Local fallback — Groq unavailable)`;
}

/* ---------------------------------------------------------
   Friendly, non-technical error copy for the UI. Full
   technical detail stays in the console via askGroq's logs.
--------------------------------------------------------- */
function describeGroqError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  switch (message) {
    case "MISSING_KEY":
      return "Groq API key is not configured.";
    case "UNAUTHORIZED":
      return "Groq authentication failed. Check your Groq API key.";
    case "FORBIDDEN":
      return "Groq access was denied. Check API permissions.";
    case "RATE_LIMITED":
      return "Groq rate limit reached. Try again shortly.";
    case "NETWORK_ERROR":
      return "Unable to connect to Groq. Check your internet connection.";
    default:
      return "Groq is temporarily unavailable. Using a local recommendation instead.";
  }
}

/* ---------------------------------------------------------
   High-level helper used by the UI. Builds the dynamic VMAX
   state prompt, calls Groq, and falls back to a local
   recommendation (labeled as such) if Groq cannot be reached.
--------------------------------------------------------- */
type AiReasoningResult = {
  text: string;
  source: "groq" | "fallback";
  errorMessage?: string;
};

async function getAIReasoning(
  state: VmaxAiState
): Promise<AiReasoningResult> {
  const prompt = buildVmaxStatePrompt(state);

  try {
    const text = await askGroq(prompt);
    return { text, source: "groq" };
  } catch (error) {
    const errorMessage = describeGroqError(error);
    console.error("VMAX Groq reasoning failed:", errorMessage, error);

    return {
      text: getLocalFallbackRecommendation(state),
      source: "fallback",
      errorMessage,
    };
  }
}

/* =========================================================
   GLOBAL CSS
========================================================= */

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      * {
        box-sizing: border-box;
      }

      html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 100%;
        background: #07090d;
      }

      body {
        font-family: system-ui, -apple-system, sans-serif;
        overflow-x: hidden;
      }

      button {
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      *::-webkit-scrollbar {
        display: none;
      }

      * {
        scrollbar-width: none;
      }

      @keyframes pulse-glow {
        0%, 100% { opacity: 1; }
        50% { opacity: .45; }
      }

      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 8px rgba(0,229,255,.25);
        }
        50% {
          box-shadow: 0 0 24px rgba(0,229,255,.55);
        }
      }

      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .anim-slide {
        animation: slide-in .3s ease-out both;
      }

      .anim-pulse {
        animation: pulse-glow 2s ease-in-out infinite;
      }

      .anim-spin {
        animation: spin 7s linear infinite;
      }

      .anim-glow {
        animation: glow 2s ease-in-out infinite;
      }

      .anim-thinking {
        animation: spin-slow 1s linear infinite;
        display: inline-block;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

/* =========================================================
   HELPERS
========================================================= */

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) =>
          `"${String(cell).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");

  downloadText(filename, csv);
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function Glow({
  color,
  size = 150,
  top = 0,
  right = 0,
}: {
  color: string;
  size?: number;
  top?: number;
  right?: number;
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
        opacity: 0.09,
        filter: "blur(45px)",
        pointerEvents: "none",
      }}
    />
  );
}

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
          "linear-gradient(145deg, rgba(20,25,34,.96), rgba(8,11,16,.96))",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 18,
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
        letterSpacing: ".08em",
      }}
    >
      {label}
    </span>
  );
}

function Bar({
  value,
  color,
  height = 6,
}: {
  value: number;
  color: string;
  height?: number;
}) {
  return (
    <div
      style={{
        height,
        width: "100%",
        borderRadius: height,
        overflow: "hidden",
        background: "rgba(255,255,255,.07)",
      }}
    >
      <div
        style={{
          width: `${Math.max(
            0,
            Math.min(100, value)
          )}%`,
          height: "100%",
          borderRadius: height,
          background: color,
          boxShadow: `0 0 12px ${color}66`,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}

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
        width: 52,
        height: 29,
        padding: 3,
        borderRadius: 20,
        border: `1px solid ${
          on ? color : "rgba(255,255,255,.14)"
        }`,
        background: on
          ? `${color}22`
          : "rgba(255,255,255,.05)",
        cursor: "pointer",
        transition: "all .2s ease",
      }}
    >
      <div
        style={{
          width: 21,
          height: 21,
          borderRadius: "50%",
          background: on ? color : "#555d68",
          transform: on
            ? "translateX(22px)"
            : "translateX(0)",
          transition: "transform .2s ease",
          boxShadow: on
            ? `0 0 10px ${color}`
            : "none",
        }}
      />
    </button>
  );
}

function BackButton({
  go,
  label = "← DASH",
}: {
  go: (screen: Screen) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => go("dash")}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        color: C.cyan,
        fontFamily: F.mono,
        fontSize: 9,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Header({
  title,
  go,
  tag,
  tagColor = C.cyan,
}: {
  title: string;
  go: (screen: Screen) => void;
  tag: string;
  tagColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <BackButton go={go} />

      <div
        style={{
          fontFamily: F.display,
          fontSize: 17,
          fontWeight: 800,
          color: C.white,
          letterSpacing: ".08em",
        }}
      >
        {title}
      </div>

      <Tag label={tag} color={tagColor} />
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  color = C.cyan,
  disabled = false,
  style = {},
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "13px 12px",
        borderRadius: 13,
        background: disabled
          ? "rgba(255,255,255,.03)"
          : `${color}12`,
        border: `1px solid ${
          disabled
            ? "rgba(255,255,255,.08)"
            : `${color}44`
        }`,
        color: disabled ? "#555d68" : C.white,
        fontFamily: F.display,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: ".1em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .2s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function ThinkingBanner() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDots((prev) =>
        prev.length >= 3 ? "." : prev + "."
      );
    }, 350);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="anim-slide"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 13,
        background: `${C.cyan}12`,
        border: `1px solid ${C.cyan}44`,
        marginBottom: 10,
      }}
    >
      <span
        className="anim-thinking"
        style={{ fontSize: 18 }}
      >
        🤖
      </span>

      <div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 10,
            fontWeight: 700,
            color: C.cyan,
            letterSpacing: ".08em",
          }}
        >
          AI IS THINKING{dots}
        </div>

        <div
          style={{
            marginTop: 2,
            fontFamily: F.mono,
            fontSize: 7,
            color: C.mute,
          }}
        >
          Analyzing live FPS &amp; thermal data
        </div>
      </div>
    </div>
  );
}

function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 20,
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 488,
        zIndex: 999,
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(10,15,20,.97)",
        border: `1px solid ${C.green}55`,
        color: C.green,
        fontFamily: F.mono,
        fontSize: 9,
        textAlign: "center",
        boxShadow: `0 0 25px ${C.green}20`,
      }}
    >
      ✓ {message}

      <button
        type="button"
        onClick={onClose}
        style={{
          marginLeft: 10,
          border: "none",
          background: "transparent",
          color: C.mute,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function ScreenDash({
  go,
  fps,
  temperature,
  settings,
}: {
  go: (screen: Screen) => void;
  fps: number;
  temperature: number;
  settings: Settings;
}) {
  const active =
    Object.values(settings).filter(Boolean).length;

  const stats = [
    {
      label: "CURRENT FPS",
      value: String(fps),
      color: C.green,
    },
    {
      label: "SOC TEMP",
      value: `${temperature}°C`,
      color: C.cyan,
    },
    {
      label: "PROTECTIONS",
      value: `${active}/3`,
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
        padding: "20px 16px 40px",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: ".13em",
          }}
        >
          GAMING PERFORMANCE SYSTEM
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 5,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: F.display,
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: ".06em",
              color: C.white,
              textShadow: `0 0 20px ${C.cyan}30`,
            }}
          >
            VMAX
          </h1>

          <Tag label="AI POWERED" color={C.cyan} />
        </div>

        <div
          style={{
            marginTop: 4,
            fontFamily: F.body,
            fontSize: 10,
            color: C.mute,
          }}
        >
          AI-POWERED GAMING PERFORMANCE
        </div>
      </div>

      <Card
        style={{
          position: "relative",
          overflow: "hidden",
          padding: 17,
          marginBottom: 10,
          borderColor: `${C.cyan}25`,
        }}
      >
        <Glow
          color={C.cyan}
          size={180}
          top={-80}
          right={-40}
        />

        <Glow
          color={C.purple}
          size={140}
          top={40}
          right={80}
        />

        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Tag label="NPU READY" color={C.purple} />

            <span
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.green,
              }}
            >
              ● SYSTEM STABLE
            </span>
          </div>

          <div
            style={{
              marginTop: 25,
              fontFamily: F.display,
              fontSize: 20,
              fontWeight: 800,
              color: C.white,
            }}
          >
            BATTLE ARENA
          </div>

          <div
            style={{
              marginTop: 4,
              fontFamily: F.body,
              fontSize: 10,
              color: C.mute,
            }}
          >
            Competitive Gaming · 120Hz Profile
          </div>
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: ".1em",
            marginBottom: 10,
          }}
        >
          LIVE PERFORMANCE
        </div>

        <div style={{ 
          fontFamily: F.mono, 
          fontSize: 7, 
          color: C.mute, 
          marginBottom: 8 
        }}>
          DEMO TELEMETRY
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 9,
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              style={{
                padding: "12px 10px",
                borderRadius: 12,
                background: "rgba(255,255,255,.03)",
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 18,
                  fontWeight: 800,
                  color: item.color,
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontFamily: F.mono,
                  fontSize: 7,
                  color: C.mute,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div style={{ 
          fontFamily: F.mono, 
          fontSize: 8, 
          color: C.mute, 
          marginBottom: 8 
        }}>
          PROTOTYPE NOTICE
        </div>
        
        <div style={{ 
          fontFamily: F.body, 
          fontSize: 9, 
          color: C.mute, 
          lineHeight: 1.6 
        }}>
          This is a frontend demo simulating the VMAX experience. In the final Android 
          app, telemetry comes from device sensors (Game Overlay API) and the AI model 
          runs on-device (Snapdragon NPU). This browser demo does not control hardware 
          settings.
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
        }}
      >
        {[
          ["🎮", "SETUP", "setup", C.cyan],
          ["📊", "MONITOR", "monitor", C.green],
          ["⚠️", "ALERTS", "alert", C.red],
          ["⚡", "OPTIMIZE", "optimize", C.yellow],
          ["📈", "ANALYTICS", "analytics", C.purple],
          ["🤖", "AI ENGINE", "ai", C.cyan],
        ].map(([icon, label, target, color]) => (
          <button
            key={label}
            type="button"
            onClick={() => go(target as Screen)}
            style={{
              padding: "18px 10px",
              borderRadius: 15,
              background: `${color}10`,
              border: `1px solid ${color}35`,
              color: C.white,
              cursor: "pointer",
              fontFamily: F.display,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: ".08em",
            }}
          >
            <div
              style={{
                fontSize: 17,
                marginBottom: 7,
              }}
            >
              {icon}
            </div>

            {label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => go("summary")}
          style={{
            gridColumn: "1 / -1",
            padding: "16px",
            borderRadius: 15,
            background: `${C.orange}10`,
            border: `1px solid ${C.orange}40`,
            color: C.white,
            cursor: "pointer",
            fontFamily: F.display,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
          }}
        >
          📋 SESSION SUMMARY
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SETUP
========================================================= */

function ScreenSetup({
  go,
  settings,
  setSettings,
  launch,
}: {
  go: (screen: Screen) => void;
  settings: Settings;
  setSettings: React.Dispatch<
    React.SetStateAction<Settings>
  >;
  launch: () => void;
}) {
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
      label: "Recommendation Mode",
      onText: "Trigger at 91% confidence",
      offText: "Automatic optimization disabled",
      color: C.green,
    },
    {
      key: "fpsGuard" as const,
      label: "FPS Risk Alerts",
      onText: "Min 90 FPS threshold",
      offText: "FPS protection disabled",
      color: C.yellow,
    },
  ];

  const active =
    Object.values(settings).filter(Boolean).length;

  return (
    <div
      className="anim-slide"
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 40px",
      }}
    >
      <Header
        title="GAME SETUP"
        go={go}
        tag={`${active}/3 ACTIVE`}
        tagColor={C.cyan}
      />

      <Card
        style={{
          position: "relative",
          overflow: "hidden",
          padding: 17,
          marginBottom: 10,
          minHeight: 160,
        }}
      >
        <Glow
          color={C.purple}
          size={170}
          top={-70}
          right={-30}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 125,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Tag label="120Hz" color={C.cyan} />
            <Tag
              label="COMPETITIVE"
              color={C.purple}
            />
          </div>

          <div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 22,
                fontWeight: 800,
                color: C.white,
              }}
            >
              BATTLE ARENA
            </div>

            <div
              style={{
                marginTop: 5,
                fontFamily: F.body,
                fontSize: 10,
                color: C.mute,
              }}
            >
              Pro Mode · Performance-first gaming profile
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: ".1em",
            marginBottom: 12,
          }}
        >
          THERMAL READINESS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
          }}
        >
          {[
            ["41°C", "SOC TEMP", C.cyan],
            ["18%", "HEADROOM", C.green],
            ["LOW", "RISK", C.green],
          ].map(([value, label, color]) => (
            <div
              key={label}
              style={{
                textAlign: "center",
                padding: "9px 3px",
                borderRadius: 10,
                background: "rgba(255,255,255,.03)",
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 15,
                  fontWeight: 800,
                  color,
                }}
              >
                {value}
              </div>

              <div
                style={{
                  marginTop: 3,
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

        <div style={{ marginTop: 12 }}>
          <Bar value={82} color={C.green} />
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: ".1em",
            marginBottom: 7,
          }}
        >
          VMAX PROTECTIONS
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
                gap: 10,
                padding: "12px 0",
                borderBottom:
                  "1px solid rgba(255,255,255,.05)",
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
                    marginTop: 2,
                    fontFamily: F.mono,
                    fontSize: 8,
                    color: on ? C.mute : "#454c56",
                  }}
                >
                  {on ? item.onText : item.offText}
                </div>
              </div>

              <Toggle
                on={on}
                color={item.color}
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key],
                  }))
                }
              />
            </div>
          );
        })}

        <div
          style={{
            marginTop: 10,
            fontFamily: F.mono,
            fontSize: 8,
            color: C.cyan,
            textAlign: "right",
          }}
        >
          {active}/3 PROTECTIONS ACTIVE
        </div>
      </Card>

      <ActionButton
        color={C.cyan}
        onClick={() => {
          launch();
          go("monitor");
        }}
      >
        ▶ LAUNCH GAME
      </ActionButton>
    </div>
  );
}

/* =========================================================
   MONITOR
========================================================= */

function ScreenMonitor({
  go,
  fps,
  temperature,
  settings,
  sessionActive,
  startSession,
}: {
  go: (screen: Screen) => void;
  fps: number;
  temperature: number;
  settings: Settings;
  sessionActive: boolean;
  startSession: () => void;
}) {
  return (
    <div
      className="anim-slide"
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 40px",
      }}
    >
      <Header
        title="LIVE MONITOR"
        go={go}
        tag={sessionActive ? "LIVE" : "READY"}
        tagColor={
          sessionActive ? C.green : C.yellow
        }
      />

      <Card
        style={{
          padding: 18,
          marginBottom: 10,
          borderColor: `${C.green}35`,
        }}
      >
        <div style={{ fontSize: 7, color: C.mute, marginBottom: 3 }}>
          DEMO TELEMETRY
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
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
              }}
            >
              CURRENT FPS
            </div>

            <div
              style={{
                marginTop: 4,
                fontFamily: F.display,
                fontSize: 48,
                fontWeight: 800,
                color: C.green,
                textShadow: `0 0 18px ${C.green}44`,
              }}
            >
              {fps}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 8,
                color: C.mute,
              }}
            >
              TARGET
            </div>

            <div
              style={{
                marginTop: 4,
                fontFamily: F.display,
                fontSize: 20,
                color: C.white,
              }}
            >
              120
            </div>

            <Tag
              label={
                fps >= 90 ? "STABLE" : "FPS RISK"
              }
              color={
                fps >= 90 ? C.green : C.red
              }
            />
          </div>
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div style={{ fontSize: 7, color: C.mute, marginBottom: 8 }}>
          DEMO TELEMETRY
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {[
            ["🌡️", "SOC TEMP", `${temperature}°C`, C.cyan],
            ["🎮", "GPU LOAD", "84%", C.purple],
            ["⚙️", "CPU LOAD", "72%", C.yellow],
            ["🔋", "BATTERY", "68%", C.green],
          ].map(([icon, label, value, color]) => (
            <div
              key={label}
              style={{
                padding: 13,
                borderRadius: 12,
                background: "rgba(255,255,255,.03)",
              }}
            >
              <div style={{ fontSize: 17 }}>
                {icon}
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontFamily: F.mono,
                  fontSize: 7,
                  color: C.mute,
                }}
              >
                {label}
              </div>

              <div
                style={{
                  marginTop: 3,
                  fontFamily: F.display,
                  fontSize: 18,
                  fontWeight: 800,
                  color,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div style={{ fontSize: 7, color: C.mute, marginBottom: 8 }}>
          DEMO TELEMETRY
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
            }}
          >
            THERMAL HEADROOM
          </span>

          <span
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              color: C.green,
            }}
          >
            18%
          </span>
        </div>

        <Bar value={82} color={C.green} />

        <div
          style={{
            marginTop: 9,
            fontFamily: F.body,
            fontSize: 9,
            color: C.mute,
          }}
        >
          AI prediction: temperature expected to remain
          within optimal range.
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div style={{ 
          fontFamily: F.mono, 
          fontSize: 8, 
          color: C.mute, 
          marginBottom: 10 
        }}>
          RISK PREDICTION (NEXT 15 MIN)
        </div>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: 60,
          position: "relative"
        }}>
          {/* Low risk segment (0-5 min) */}
          <div style={{ 
            width: "33%", 
            height: "30%", 
            background: C.green,
            borderRadius: 4,
            position: "relative"
          }}>
            <div style={{ 
              position: "absolute", 
              bottom: -20, 
              left: "50%", 
              transform: "translateX(-50%)",
              fontSize: 7,
              color: C.mute
            }}>0-5 min</div>
          </div>
          
          {/* Medium risk segment (5-10 min) */}
          <div style={{ 
            width: "33%", 
            height: "60%", 
            background: C.yellow,
            borderRadius: 4,
            position: "relative"
          }}>
            <div style={{ 
              position: "absolute", 
              bottom: -20, 
              left: "50%", 
              transform: "translateX(-50%)",
              fontSize: 7,
              color: C.mute
            }}>5-10 min</div>
          </div>
          
          {/* High risk segment (10-15 min) */}
          <div style={{ 
            width: "33%", 
            height: "100%", 
            background: C.red,
            borderRadius: 4,
            position: "relative"
          }}>
            <div style={{ 
              position: "absolute", 
              bottom: -20, 
              left: "50%", 
              transform: "translateX(-50%)",
              fontSize: 7,
              color: C.mute
            }}>10-15 min</div>
            
            {/* Warning icon */}
            <div style={{ 
              position: "absolute", 
              top: -25, 
              left: "50%", 
              transform: "translateX(-50%)",
              fontSize: 16
            }}>⚠️</div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: 30,
          fontFamily: F.body, 
          fontSize: 9, 
          color: C.mute 
        }}>
          Predicted: High thermal risk in 10-15 minutes
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          ACTIVE PROTECTION
        </div>

        {([
          [
            "AI Thermal Prediction",
            settings.thermalPrediction,
          ],
          [
            "Recommendation Mode",
            settings.autoOptimization,
          ],
          ["FPS Risk Alerts", settings.fpsGuard],
        ] as [string, boolean][]).map(([label, enabled]) => (
          <div
            key={String(label)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom:
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            <span
              style={{
                fontFamily: F.body,
                fontSize: 10,
                color: C.white,
              }}
            >
              {label}
            </span>

            <Tag
              label={enabled ? "ACTIVE" : "OFF"}
              color={
                enabled ? C.green : C.mute
              }
            />
          </div>
        ))}
      </Card>

      <ActionButton
        color={C.green}
        onClick={startSession}
      >
        {sessionActive
          ? "● SESSION RUNNING"
          : "▶ START MONITORING"}
      </ActionButton>
    </div>
  );
}

/* =========================================================
   ALERTS
========================================================= */

function ScreenAlert({
  go,
  alerts,
  setAlerts,
  notify,
}: {
  go: (screen: Screen) => void;
  alerts: AlertSettings;
  setAlerts: React.Dispatch<
    React.SetStateAction<AlertSettings>
  >;
  notify: (message: string) => void;
}) {
  const items = [
    {
      key: "thermal" as const,
      label: "Thermal Alerts",
      description:
        "Notify when thermal risk increases",
      color: C.red,
    },
    {
      key: "fps" as const,
      label: "FPS Alerts",
      description:
        "Notify when FPS falls below threshold",
      color: C.yellow,
    },
    {
      key: "optimization" as const,
      label: "Optimization Alerts",
      description:
        "Notify when VMAX applies optimization",
      color: C.cyan,
    },
  ];

  const active =
    Object.values(alerts).filter(Boolean).length;

  return (
    <div
      className="anim-slide"
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 40px",
      }}
    >
      <Header
        title="ALERT CENTER"
        go={go}
        tag={`${active}/3 ACTIVE`}
        tagColor={C.red}
      />

      <Card
        style={{
          padding: 16,
          marginBottom: 10,
          borderColor: `${C.red}30`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div
            className="anim-pulse"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.green,
            }}
          />

          <div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 14,
                fontWeight: 800,
                color: C.white,
              }}
            >
              ALERT SYSTEM
            </div>

            <div
              style={{
                marginTop: 3,
                fontFamily: F.body,
                fontSize: 9,
                color: C.mute,
              }}
            >
              Configure which events VMAX reports.
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: ".1em",
            marginBottom: 8,
          }}
        >
          ALERT SETTINGS
        </div>

        {items.map((item) => {
          const enabled = alerts[item.key];

          return (
            <div
              key={item.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "13px 0",
                borderBottom:
                  "1px solid rgba(255,255,255,.05)",
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
                    marginTop: 3,
                    fontFamily: F.mono,
                    fontSize: 8,
                    color: enabled
                      ? C.mute
                      : "#454c56",
                  }}
                >
                  {enabled
                    ? item.description
                    : "Alert disabled"}
                </div>
              </div>

              <Toggle
                on={enabled}
                color={item.color}
                onClick={() => {
                  setAlerts((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key],
                  }));

                  notify(
                    `${item.label} ${
                      enabled
                        ? "disabled"
                        : "enabled"
                    }`
                  );
                }}
              />
            </div>
          );
        })}
      </Card>

      <Card style={{ padding: 15 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 9,
          }}
        >
          CURRENT ALERT STATUS
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: F.body,
              fontSize: 10,
              color: C.white,
            }}
          >
            Active alert channels
          </span>

          <span
            style={{
              fontFamily: F.display,
              fontSize: 14,
              color: active
                ? C.green
                : C.mute,
            }}
          >
            {active}/3
          </span>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   OPTIMIZE
   Groq-powered live reasoning
========================================================= */

/* =========================================================
   RISK PREDICTION HELPER
========================================================= */

function predictRisk(
  fps: number,
  temperature: number,
  battery: number,
  cpuUsage?: number,
  gpuUsage?: number
): { level: string; reason: string; recommendation: string } {
  if (temperature >= 46 || fps < 90) {
    return {
      level: "high",
      reason: `Temperature ${temperature}°C is elevated. FPS ${fps} is below target.`,
      recommendation: "Reduce graphics quality or take a cooling break.",
    };
  }
  if (temperature >= 43 || fps < 100) {
    return {
      level: "medium",
      reason: `Temperature ${temperature}°C is rising. FPS ${fps} is fluctuating.`,
      recommendation: "Monitor closely. Consider lowering shadows.",
    };
  }
  return {
    level: "low",
    reason: `Temperature ${temperature}°C and FPS ${fps} are stable.`,
    recommendation: "Continue gaming. No action needed.",
  };
}

function ScreenOptimize({
  go,
  optimization,
  setOptimization,
  notify,
  fps,
  temperature,
  alerts,
  settings,
}: {
  go: (screen: Screen) => void;
  optimization: OptimizationState;
  setOptimization: React.Dispatch<
    React.SetStateAction<OptimizationState>
  >;
  notify: (message: string) => void;
  fps: number;
  temperature: number;
  alerts: AlertSettings;
  settings: Settings;
}) {
  const [thinking, setThinking] = useState(false);

  const activeAlertLabels = (): string[] => {
    const active: string[] = [];
    if (alerts.thermal) active.push("Thermal Alerts");
    if (alerts.fps) active.push("FPS Alerts");
    if (alerts.optimization) active.push("Optimization Alerts");
    return active;
  };

  const currentPerformanceMode = (): string => {
    if (optimization.riskDetected) return "Risk Detected";
    if (optimization.analyzed) return "Analyzed";
    if (settings.autoOptimization) return "Balanced (Auto)";
    return "Balanced";
  };

  const pushHistory = (
    prev: OptimizationState,
    entry: string
  ): string[] => {
    // Never add a duplicate consecutive entry.
    if (prev.history[0] === entry) return prev.history;
    return [entry, ...prev.history].slice(0, 10);
  };

  const runGroqAnalysis = async (action: string) => {
    const result = await getAIReasoning({
      fps,
      temperature,
      action,
      performanceMode: currentPerformanceMode(),
      optimizationStatus: optimization.analyzed
        ? "Previously analyzed"
        : "Not yet analyzed",
      activeAlerts: activeAlertLabels(),
    });

    if (result.source === "fallback" && result.errorMessage) {
      notify(result.errorMessage);
    }

    return result.text;
  };

  const applyOptimization = async () => {
    if (thinking) return; // prevent overlapping requests

    setThinking(true);

    try {
      const reasoning = await runGroqAnalysis(
        "General optimization requested"
      );

      setOptimization((prev) => ({
        ...prev,
        analyzed: true,
        riskDetected: false,
        lastAction: reasoning,
        history: pushHistory(prev, reasoning),
      }));

      notify("Recommendation generated");
    } finally {
      setThinking(false);
    }
  };

  const analyzeRisk = async () => {
    if (thinking) return; // prevent overlapping requests

    setThinking(true);

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = predictRisk(fps, temperature, 68, 72, 84);

    setOptimization((prev) => ({
      ...prev,
      analyzed: true,
      riskDetected: result.level !== "low",
      lastAction: result.recommendation,
      history: pushHistory(
        prev,
        `${result.level.toUpperCase()} RISK: ${result.recommendation}`
      ),
    }));

    notify("Risk analysis completed");
    setThinking(false);
  };

  const resetProfile = () => {
    const baseAction = "Profile reset to default";

    setOptimization((prev) => ({
      analyzed: false,
      riskDetected: false,
      lastAction: baseAction,
      history: pushHistory(prev, baseAction),
    }));

    notify("Performance profile reset");
  };

  const exportLog = () => {
    const text = [
      "VMAX OPTIMIZATION LOG",
      "======================",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Current state: ${
        optimization.analyzed
          ? "ANALYZED"
          : "DEFAULT"
      }`,
      `Risk Detected: ${
        optimization.riskDetected ? "ON" : "OFF"
      }`,
      `Last action: ${optimization.lastAction}`,
      "",
      "History:",
      ...optimization.history.map(
        (item, index) =>
          `${index + 1}. ${item}`
      ),
    ].join("\n");

    downloadText(
      "vmax-optimization-log.txt",
      text
    );

    notify("Optimization log exported");
  };

  return (
    <div
      className="anim-slide"
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 40px",
      }}
    >
      <Header
        title="OPTIMIZE"
        go={go}
        tag={
          optimization.analyzed
            ? "ANALYZED"
            : "READY"
        }
        tagColor={
          optimization.analyzed
            ? C.green
            : C.yellow
        }
      />

      {thinking && <ThinkingBanner />}

      <Card
        style={{
          padding: 17,
          marginBottom: 10,
          borderColor: `${C.yellow}30`,
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
              }}
            >
              PERFORMANCE MODE
            </div>

            <div
              style={{
                marginTop: 5,
                fontFamily: F.display,
                fontSize: 21,
                fontWeight: 800,
                color: optimization.riskDetected
                  ? C.orange
                  : C.green,
              }}
            >
              {optimization.riskDetected
                ? "RISK DETECTED"
                : optimization.analyzed
                ? "ADAPTIVE"
                : "BALANCED"}
            </div>
          </div>

          <div
            className={
              optimization.riskDetected
                ? "anim-glow"
                : ""
            }
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: `${C.yellow}12`,
              border: `1px solid ${C.yellow}44`,
              fontSize: 22,
            }}
          >
            {thinking ? (
              <span className="anim-thinking">
                🤖
              </span>
            ) : (
              "⚡"
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            fontFamily: F.body,
            fontSize: 9,
            color: thinking
              ? C.cyan
              : C.mute,
          }}
        >
          {optimization.lastAction}
        </div>

        <div
          style={{
            marginTop: 8,
            fontFamily: F.mono,
            fontSize: 7,
            color: isGroqKeyConfigured()
              ? C.cyan
              : C.green,
          }}
        >
          {isGroqKeyConfigured()
            ? "✓ Cloud AI Mode (Optional)"
            : "✓ Local Demo Mode (Works Offline)"}
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div style={{ 
          fontFamily: F.mono, 
          fontSize: 8, 
          color: C.mute, 
          marginBottom: 10 
        }}>
          WHY THIS RECOMMENDATION?
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: 8 
        }}>
          <div style={{ 
            padding: 10, 
            borderRadius: 8, 
            background: "rgba(255,255,255,0.03)" 
          }}>
            <div style={{ fontSize: 7, color: C.mute, marginBottom: 3 }}>
              TEMPERATURE
            </div>
            <div style={{ fontSize: 14, color: C.red }}>46°C ↑</div>
          </div>
          
          <div style={{ 
            padding: 10, 
            borderRadius: 8, 
            background: "rgba(255,255,255,0.03)" 
          }}>
            <div style={{ fontSize: 7, color: C.mute, marginBottom: 3 }}>
              FPS
            </div>
            <div style={{ fontSize: 14, color: C.yellow }}>88 ↓</div>
          </div>
          
          <div style={{ 
            padding: 10, 
            borderRadius: 8, 
            background: "rgba(255,255,255,0.03)" 
          }}>
            <div style={{ fontSize: 7, color: C.mute, marginBottom: 3 }}>
              SESSION
            </div>
            <div style={{ fontSize: 14, color: C.cyan }}>18 min</div>
          </div>
          
          <div style={{ 
            padding: 10, 
            borderRadius: 8, 
            background: "rgba(255,255,255,0.03)" 
          }}>
            <div style={{ fontSize: 7, color: C.mute, marginBottom: 3 }}>
              RISK
            </div>
            <div style={{ fontSize: 14, color: C.red }}>HIGH</div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            letterSpacing: ".1em",
            marginBottom: 10,
          }}
        >
          QUICK ACTIONS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 9,
          }}
        >
          <ActionButton
            color={C.orange}
            onClick={analyzeRisk}
            disabled={thinking}
          >
            🔍 ANALYZE RISK
          </ActionButton>

          <ActionButton
            color={C.red}
            onClick={resetProfile}
            disabled={thinking}
          >
            ↺ RESET PROFILE
          </ActionButton>

          <ActionButton
            color={C.cyan}
            onClick={() => {
              notify(
                optimization.history.length
                  ? `${optimization.history.length} actions in history`
                  : "No optimization history yet"
              );
            }}
          >
            🕘 VIEW HISTORY
          </ActionButton>

          <ActionButton
            color={C.purple}
            onClick={exportLog}
          >
            ↓ EXPORT LOG
          </ActionButton>
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          RECOMMENDED ACTION
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 11,
            background: `${C.green}08`,
            border: `1px solid ${C.green}20`,
          }}
        >
          <div
            style={{
              fontFamily: F.body,
              fontSize: 11,
              fontWeight: 700,
              color: C.white,
            }}
          >
            Maintain stable performance
          </div>

          <div
            style={{
              marginTop: 5,
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
            }}
          >
            AI confidence: 94% · Thermal risk: LOW
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <ActionButton
            color={C.green}
            onClick={applyOptimization}
            disabled={thinking}
          >
            {thinking
              ? "🤖 THINKING..."
              : "✓ APPLY OPTIMIZATION"}
          </ActionButton>
        </div>

        <div style={{ marginTop: 10 }}>
          <ActionButton
            color={C.green}
            onClick={() => {
              notify("Recommendation marked as followed");
              // Optionally log this for analytics
            }}
          >
            ✓ MARK AS FOLLOWED
          </ActionButton>
        </div>
      </Card>

      <Card style={{ padding: 15 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 9,
          }}
        >
          OPTIMIZATION HISTORY
        </div>

        {optimization.history.length === 0 ? (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background:
                "rgba(255,255,255,.03)",
              fontFamily: F.mono,
              fontSize: 8,
              color: C.mute,
              textAlign: "center",
            }}
          >
            No actions recorded yet.
          </div>
        ) : (
          optimization.history.map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                style={{
                  padding: "8px 0",
                  borderBottom:
                    "1px solid rgba(255,255,255,.05)",
                  fontFamily: F.body,
                  fontSize: 9,
                  color: C.white,
                }}
              >
                <span
                  style={{
                    color: C.mute,
                  }}
                >
                  {index + 1}.{" "}
                </span>

                {item}
              </div>
            )
          )
        )}
      </Card>
    </div>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function ScreenAnalytics({
  go,
  notify,
}: {
  go: (screen: Screen) => void;
  notify: (message: string) => void;
}) {
  const [avgFps, setAvgFps] = useState(116);
  const [avgTemp, setAvgTemp] = useState(43);
  const [stableFpsPercent, setStableFpsPercent] = useState(94);
  const [thermalEvents, setThermalEvents] = useState(8);

  const stats = [
    ["AVG FPS", `${avgFps || "—"}`, "—", C.green],
    ["AVG TEMP", `${avgTemp || "—"}°C`, "—", C.cyan],
    ["STABLE FPS", `${stableFpsPercent || "—"}%`, "—", C.purple],
    ["THERMAL EVENTS", `${thermalEvents || "—"}`, "—", C.yellow],
  ];

  const exportReport = () => {
    downloadCSV(
      "vmax-performance-report.csv",
      [
        ["VMAX PERFORMANCE REPORT", ""],
        [
          "Generated",
          new Date().toLocaleString(),
        ],
        [],
        ["Metric", "Value", "Change"],
        ["Average FPS", `${avgFps || "—"}`, "—"],
        [
          "Average Temperature",
          `${avgTemp || "—"}°C`,
          "—",
        ],
        ["Stable FPS", `${stableFpsPercent || "—"}%`, "—"],
        ["Thermal Events", `${thermalEvents || "—"}`, "—"],
        ["NPU Accuracy", "94%", "Stable"],
        [
          "Optimization Events",
          "12",
          "+12%",
        ],
      ]
    );

    notify("Analytics report exported");
  };

  return (
    <div
      className="anim-slide"
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 40px",
      }}
    >
      <Header
        title="ANALYTICS"
        go={go}
        tag="SAMPLE"
        tagColor={C.purple}
      />

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          PERFORMANCE OVERVIEW
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 9,
          }}
        >
          {stats.map(
            ([label, value, change, color]) => (
              <div
                key={label}
                style={{
                  padding: 12,
                  borderRadius: 11,
                  background:
                    "rgba(255,255,255,.03)",
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 7,
                    color: C.mute,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontFamily: F.display,
                    fontSize: 19,
                    fontWeight: 800,
                    color,
                  }}
                >
                  {value}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontFamily: F.mono,
                    fontSize: 7,
                    color: C.green,
                  }}
                >
                  {change}
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 12,
          }}
        >
          FPS DISTRIBUTION
        </div>

        {([
          ["110–120 FPS", 68, C.green],
          ["90–109 FPS", 24, C.yellow],
          ["BELOW 90 FPS", 8, C.red],
        ] as [string, number, string][]).map(
          ([label, value, color]) => (
            <div
              key={label}
              style={{ marginBottom: 11 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: F.body,
                    fontSize: 9,
                    color: C.white,
                  }}
                >
                  {label}
                </span>

                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 8,
                    color,
                  }}
                >
                  {value}%
                </span>
              </div>

              <Bar
                value={Number(value)}
                color={String(color)}
                height={5}
              />
            </div>
          )
        )}
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          THERMAL HISTORY
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: F.body,
              fontSize: 10,
              color: C.white,
            }}
          >
            Average Temperature
          </span>

          <span
            style={{
              fontFamily: F.display,
              fontSize: 18,
              color: C.cyan,
            }}
          >
            43°C
          </span>
        </div>

        <Bar value={72} color={C.cyan} />

        <div
          style={{
            marginTop: 6,
            fontFamily: F.mono,
            fontSize: 7,
            color: C.mute,
          }}
        >
          Optimal range: 35–45°C
        </div>
      </Card>

      <ActionButton
        color={C.purple}
        onClick={exportReport}
      >
        ↓ EXPORT PERFORMANCE REPORT
      </ActionButton>
    </div>
  );
}

/* =========================================================
   AI ENGINE
========================================================= */

function ScreenAI({
  go,
  npuSettings,
  setNpuSettings,
  notify,
}: {
  go: (screen: Screen) => void;
  npuSettings: NpuSettings;
  setNpuSettings: React.Dispatch<
    React.SetStateAction<NpuSettings>
  >;
  notify: (message: string) => void;
}) {
  const [localMode, setLocalMode] = useState(true);

  const settings = [
    {
      key: "inference" as const,
      label: "Enable NPU Inference",
      description:
        "Run supported AI workloads on NPU",
      color: C.purple,
    },
    {
      key: "background" as const,
      label: "Background Processing",
      description:
        "Allow AI processing during background activity",
      color: C.cyan,
    },
    {
      key: "powerSaving" as const,
      label: "Power Saving Mode",
      description:
        "Prioritize efficiency during AI processing",
      color: C.green,
    },
  ];

  return (
    <div
      className="anim-slide"
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 40px",
      }}
    >
      <Header
        title="AI ENGINE"
        go={go}
        tag={
          npuSettings.inference
            ? "NPU PIPELINE"
            : "NPU OFF"
        }
        tagColor={
          npuSettings.inference
            ? C.purple
            : C.mute
        }
      />

      <Card
        style={{
          padding: 17,
          marginBottom: 10,
          borderColor: `${C.purple}35`,
        }}
      >
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
              background:
                npuSettings.inference
                  ? C.purple
                  : C.mute,
              boxShadow:
                npuSettings.inference
                  ? `0 0 12px ${C.purple}`
                  : "none",
            }}
          />

          <div
            style={{
              fontFamily: F.display,
              fontSize: 15,
              fontWeight: 800,
              color:
                npuSettings.inference
                  ? C.purple
                  : C.mute,
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
          On-device AI inference layer for VMAX prediction
          and optimization.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {[
            ["MODEL", "VMAX AI"],
            ["INFERENCE", "23ms"],
            ["MEMORY", "128 MB"],
            ["CONFIDENCE", "94%"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: 9,
                borderRadius: 9,
                background: `${C.purple}09`,
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 7,
                  color: C.mute,
                }}
              >
                {label}
              </div>

              <div
                style={{
                  marginTop: 3,
                  fontFamily: F.display,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.purple,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          AI MODE
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.white,
                fontWeight: 600,
              }}
            >
              Local Model (Offline)
            </div>
            <div
              style={{
                marginTop: 3,
                fontFamily: F.mono,
                fontSize: 7,
                color: C.mute,
              }}
            >
              Rule-based risk prediction
            </div>
          </div>

          <Toggle
            on={localMode}
            color={C.green}
            onClick={() => {
              setLocalMode(true);
              notify("Switched to Local Model (Offline)");
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.white,
                fontWeight: 600,
              }}
            >
              Cloud AI (Optional)
            </div>
            <div
              style={{
                marginTop: 3,
                fontFamily: F.mono,
                fontSize: 7,
                color: C.mute,
              }}
            >
              Groq for natural language
            </div>
          </div>

          <Toggle
            on={!localMode}
            color={C.cyan}
            onClick={() => {
              setLocalMode(false);
              notify("Switched to Cloud AI");
            }}
          />
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          AI FEATURES
        </div>

        {[
          ["Thermal Prediction", "94%", C.cyan],
          ["FPS Forecasting", "91%", C.green],
          ["Recommendation Mode", "89%", C.yellow],
        ].map(
          ([name, accuracy, color]) => (
            <div
              key={name}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom:
                  "1px solid rgba(255,255,255,.05)",
              }}
            >
              <span
                style={{
                  fontFamily: F.body,
                  fontSize: 10,
                  color: C.white,
                }}
              >
                {name}
              </span>

              <Tag
                label={`ACCURACY ${accuracy}`}
                color={String(color)}
              />
            </div>
          )
        )}
      </Card>

      <Card style={{ padding: 15 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 8,
          }}
        >
          NPU SETTINGS
        </div>

        {settings.map((item) => {
          const enabled =
            npuSettings[item.key];

          return (
            <div
              key={item.key}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  "1px solid rgba(255,255,255,.05)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: F.body,
                    fontSize: 11,
                    color: C.white,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontFamily: F.mono,
                    fontSize: 7,
                    color: enabled
                      ? C.mute
                      : "#454c56",
                  }}
                >
                  {enabled
                    ? item.description
                    : "Setting disabled"}
                </div>
              </div>

              <Toggle
                on={enabled}
                color={item.color}
                onClick={() => {
                  setNpuSettings((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key],
                  }));

                  notify(
                    `${item.label} ${
                      enabled
                        ? "disabled"
                        : "enabled"
                    }`
                  );
                }}
              />
            </div>
          );
        })}
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 10,
          }}
        >
          HOW VMAX WORKS
        </div>

        <div
          style={{
            fontFamily: F.body,
            fontSize: 9,
            color: C.white,
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong>1. Telemetry:</strong> Android Game
            Overlay API reads FPS, temperature, battery
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>2. Prediction:</strong> TinyML model
            predicts thermal/FPS risk (on-device)
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>3. NPU:</strong> Snapdragon Hexagon NPU
            accelerates inference
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>4. Recommendation:</strong> Actionable
            advice (e.g., "Reduce graphics quality")
          </div>
          <div>
            <strong>5. Offline:</strong> No cloud
            dependency, privacy-first
          </div>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   SESSION SUMMARY
========================================================= */

function ScreenSummary({
  go,
  resetSession,
  notify,
}: {
  go: (screen: Screen) => void;
  resetSession: () => void;
  notify: (message: string) => void;
}) {
  const [shared, setShared] = useState(false);

  const summaryText = [
    "VMAX SESSION SUMMARY",
    "====================",
    "Game: Battle Arena",
    "Mode: Pro Mode",
    "Duration: 2h 18m",
    "Average FPS: 116",
    "Peak Temperature: 47°C",
    "Optimizations: 12",
    "Stable FPS: 94%",
    "AI Confidence: 94%",
  ].join("\n");

  const shareSummary = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "VMAX Session Summary",
          text: summaryText,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          summaryText
        );
      } else {
        downloadText(
          "vmax-session-summary.txt",
          summaryText
        );
      }

      setShared(true);
      notify("Session summary shared");

      window.setTimeout(() => {
        setShared(false);
      }, 2500);
    } catch {
      notify("Share cancelled");
    }
  };

  const newSession = () => {
    resetSession();
    notify("New gaming session started");
    go("setup");
  };

  const stats = [
    ["DURATION", "2h 18m", C.cyan],
    ["AVG FPS", "116", C.green],
    ["PEAK TEMP", "47°C", C.yellow],
    ["OPTIMIZATIONS", "12", C.purple],
  ];

  return (
    <div
      className="anim-slide"
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "18px 16px 40px",
      }}
    >
      <Header
        title="SESSION SUMMARY"
        go={go}
        tag="COMPLETED"
        tagColor={C.green}
      />

      <Card
        style={{
          padding: 17,
          marginBottom: 10,
          borderColor: `${C.green}35`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            className="anim-pulse"
            style={{
              width: 11,
              height: 11,
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
            marginTop: 10,
            fontFamily: F.body,
            fontSize: 10,
            color: C.mute,
          }}
        >
          BATTLE ARENA · Pro Mode
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 9,
          }}
        >
          {stats.map(
            ([label, value, color]) => (
              <div
                key={label}
                style={{
                  padding: 13,
                  borderRadius: 11,
                  background:
                    "rgba(255,255,255,.03)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 7,
                    color: C.mute,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontFamily: F.display,
                    fontSize: 20,
                    fontWeight: 800,
                    color,
                  }}
                >
                  {value}
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      <Card style={{ padding: 15, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 8,
            color: C.mute,
            marginBottom: 9,
          }}
        >
          PERFORMANCE HIGHLIGHTS
        </div>

        {[
          [
            "🎯",
            "Maintained 90+ FPS for 94% of session",
          ],
          [
            "🌡️",
            "Thermal protection triggered 3 times",
          ],
          [
            "⚡",
            "Performance optimization improved stability",
          ],
          [
            "🤖",
            "NPU prediction confidence: 94%",
          ],
        ].map(([icon, text]) => (
          <div
            key={text}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "10px 0",
              borderBottom:
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            <span style={{ fontSize: 15 }}>
              {icon}
            </span>

            <span
              style={{
                fontFamily: F.body,
                fontSize: 9,
                color: C.white,
              }}
            >
              {text}
            </span>
          </div>
        ))}
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
        }}
      >
        <ActionButton
          color={C.cyan}
          onClick={shareSummary}
        >
          {shared ? "✓ SHARED" : "↗ SHARE"}
        </ActionButton>

        <ActionButton
          color={C.green}
          onClick={newSession}
        >
          + NEW SESSION
        </ActionButton>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [screen, setScreen] =
    useState<Screen>("dash");

  const [settings, setSettings] =
    useState<Settings>({
      thermalPrediction: true,
      autoOptimization: true,
      fpsGuard: true,
    });

  const [alerts, setAlerts] =
    useState<AlertSettings>({
      thermal: true,
      fps: true,
      optimization: true,
    });

  const [npuSettings, setNpuSettings] =
    useState<NpuSettings>({
      inference: true,
      background: false,
      powerSaving: true,
    });

  const [optimization, setOptimization] =
    useState<OptimizationState>({
      analyzed: false,
      riskDetected: false,
      lastAction:
        "No recommendation generated yet",
      history: [],
    });

  const [fps, setFps] = useState(116);
  const [temperature, setTemperature] =
    useState(41);

  const [sessionActive, setSessionActive] =
    useState(false);

  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const launchGame = () => {
    setSessionActive(true);
    notify("VMAX gaming session launched");
  };

  const startSession = () => {
    setSessionActive(true);
    setFps(116);
    setTemperature(41);
    notify("Live monitoring started");
  };

  const resetSession = () => {
    setSessionActive(false);
    setFps(116);
    setTemperature(41);

    setOptimization({
      analyzed: false,
      riskDetected: false,
      lastAction:
        "No recommendation generated yet",
      history: [],
    });
  };

  /* =======================================================
     SIMULATED FRONTEND TELEMETRY
     Replace later with backend/NPU data.
  ======================================================= */

  useEffect(() => {
    if (!sessionActive) return;

    const timer = window.setInterval(() => {
      setFps((prev) => {
        const delta =
          Math.floor(Math.random() * 7) - 3;

        return Math.max(
          88,
          Math.min(120, prev + delta)
        );
      });

      setTemperature((prev) => {
        const delta =
          Math.random() > 0.5 ? 1 : -1;

        return Math.max(
          39,
          Math.min(48, prev + delta)
        );
      });
    }, 2200);

    return () => {
      window.clearInterval(timer);
    };
  }, [sessionActive]);

  const renderScreen = () => {
    switch (screen) {
      case "dash":
        return (
          <ScreenDash
            go={setScreen}
            fps={fps}
            temperature={temperature}
            settings={settings}
          />
        );

      case "setup":
        return (
          <ScreenSetup
            go={setScreen}
            settings={settings}
            setSettings={setSettings}
            launch={launchGame}
          />
        );

      case "monitor":
        return (
          <ScreenMonitor
            go={setScreen}
            fps={fps}
            temperature={temperature}
            settings={settings}
            sessionActive={sessionActive}
            startSession={startSession}
          />
        );

      case "alert":
        return (
          <ScreenAlert
            go={setScreen}
            alerts={alerts}
            setAlerts={setAlerts}
            notify={notify}
          />
        );

      case "optimize":
        return (
          <ScreenOptimize
            go={setScreen}
            optimization={optimization}
            setOptimization={setOptimization}
            notify={notify}
            fps={fps}
            temperature={temperature}
            alerts={alerts}
            settings={settings}
          />
        );

      case "analytics":
        return (
          <ScreenAnalytics
            go={setScreen}
            notify={notify}
          />
        );

      case "ai":
        return (
          <ScreenAI
            go={setScreen}
            npuSettings={npuSettings}
            setNpuSettings={setNpuSettings}
            notify={notify}
          />
        );

      case "summary":
        return (
          <ScreenSummary
            go={setScreen}
            resetSession={resetSession}
            notify={notify}
          />
        );

      default:
        return (
          <ScreenDash
            go={setScreen}
            fps={fps}
            temperature={temperature}
            settings={settings}
          />
        );
    }
  };

  return (
    <>
      <GlobalStyles />

      <main
        style={{
          minHeight: "100vh",
          width: "100%",
          color: C.white,
          background:
            "radial-gradient(circle at top, #111827 0%, #07090d 45%, #050609 100%)",
        }}
      >
        {renderScreen()}
      </main>

      <Toast
        message={toast}
        onClose={() => setToast("")}
      />
    </>
  );
}
