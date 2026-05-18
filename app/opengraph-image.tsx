import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ConsentVault — verdict archive for AI content consent disputes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 96px",
          background:
            "linear-gradient(135deg, #1c1814 0%, #2b211f 55%, #401a22 100%)",
          color: "#f3ede0",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 28,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#e7b3a6",
            }}
          >
            ConsentVault
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(243, 237, 224, 0.65)",
            }}
          >
            verdict archive · genlayer demo
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 980,
          }}
        >
          <span style={{ fontSize: 76, lineHeight: 1.1, fontWeight: 600 }}>
            A creator-facing tribunal for AI content consent disputes.
          </span>
          <span
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "rgba(243, 237, 224, 0.78)",
            }}
          >
            Capture policy, bundle evidence, run a GenLayer-backed trial, and
            export a shareable verdict receipt.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "ui-monospace, monospace",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(243, 237, 224, 0.6)",
          }}
        >
          <span>Studionet · Chain id 61999</span>
          <span>consent · evidence · receipt</span>
        </div>
      </div>
    ),
    size,
  );
}
