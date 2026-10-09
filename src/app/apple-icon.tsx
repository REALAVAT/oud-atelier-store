import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0d0b",
        }}
      >
        <div
          style={{
            width: 152,
            height: 152,
            border: "3px solid #b8975a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e8d7ae",
            fontSize: 68,
            letterSpacing: 2,
          }}
        >
          OA
        </div>
      </div>
    ),
    size,
  );
}
