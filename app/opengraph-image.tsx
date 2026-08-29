import { ImageResponse } from "next/og";

export const alt = "Baki";
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
          justifyContent: "center",
          background: "#17130F",
          color: "#FBF7F0",
          padding: 96,
        }}
      >
        <div
          style={{
            width: 72,
            height: 2,
            background: "#FBF7F0",
            marginBottom: 36,
          }}
        />
        <div style={{ fontSize: 108, letterSpacing: "-0.04em", lineHeight: 0.95 }}>Baki</div>
        <div style={{ fontSize: 32, color: "#7C7064", marginTop: 28 }}>
          Outstanding, still owed
        </div>
      </div>
    ),
    { ...size },
  );
}
