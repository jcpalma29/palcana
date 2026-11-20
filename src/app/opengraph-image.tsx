import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 64,
          background: "#102a20",
          color: "#f7f5f0",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4 }}>
          INDEPENDENT BRANDS &amp; DIGITAL VENTURES
        </div>
        <div style={{ display: "flex", fontSize: 200, fontWeight: 700, letterSpacing: -6 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a8b9a0" }}>
          Different ideas. One vision. — palcana.com
        </div>
      </div>
    ),
    size,
  );
}
