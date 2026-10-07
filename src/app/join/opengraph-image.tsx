import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "OVRMN — Keep your coach. $29/month, renews monthly, cancel anytime.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Shared static card for every /join link: no membership or provider calls. The house look, with
// static (non-variable) fonts because the OG renderer can't read variable fonts.
export default async function MembershipImage() {
  const font = (file: string) => readFile(join(process.cwd(), "assets/og", file));
  const [serif, serifItalic, mono] = await Promise.all([font("playfair-400.woff"), font("playfair-400-italic.woff"), font("plex-mono-500.woff")]);
  const caption = { fontFamily: "Mono", fontSize: 20, letterSpacing: "0.24em", color: "#8b8a85" } as const;
  return new ImageResponse(
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%",
      padding: "64px 76px", background: "#050505", color: "#f2f1ed",
      backgroundImage: "linear-gradient(to right, #121211 1px, transparent 1px), linear-gradient(to bottom, #121211 1px, transparent 1px)",
      backgroundSize: "40px 40px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", ...caption, color: "#f2f1ed" }}>
        <span>OVRMN</span><span style={{ color: "#8b8a85" }}>MEMBERSHIP</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: "Serif", fontSize: 104, lineHeight: 1.02, letterSpacing: "-0.01em" }}>Keep your coach.</div>
        <div style={{ display: "flex", fontFamily: "Serif", fontStyle: "italic", fontSize: 104, lineHeight: 1.02, color: "#8b8a85" }}>Still a message away.</div>
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #2a2a27", paddingTop: 26, ...caption }}>
        $29 / MONTH · RENEWS MONTHLY · CANCEL ANYTIME
      </div>
    </div>,
    { ...size, fonts: [
      { name: "Serif", data: serif, style: "normal", weight: 400 },
      { name: "Serif", data: serifItalic, style: "italic", weight: 400 },
      { name: "Mono", data: mono, style: "normal", weight: 500 },
    ] },
  );
}
