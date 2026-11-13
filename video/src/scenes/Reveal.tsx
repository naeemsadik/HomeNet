import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Enter, useBreathe, useCue, useCueSpring, useProgress, Words } from "../components/Motion";
import { display, Logo } from "../components/UI";

const c = theme.colors;

export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const strike = useProgress(CUE.biday, CUE.biday + 0.5, theme.ease.out);
  const tile = useCueSpring(CUE.homenet, "bouncy");
  const wordmark = useProgress(CUE.homenet + 0.25, CUE.homenet + 1.0, theme.ease.out);
  const lift = useCueSpring(CUE.tagline, "smooth");
  const breathe = 1 + useBreathe(26, 0.008);
  const ring = interpolate(frame, [cue(CUE.homenet) - 2, cue(CUE.homenet) + 26], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out,
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* "Say goodbye to all of it" — the worries get struck out on "বিদায়" */}
      <div style={{ position: "absolute", top: 400, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Words text="সব দুশ্চিন্তাকে চিরতরে বিদায়" at={CUE.tobeEbar + 0.5} per={6} exitAt={CUE.homenet - 0.15}
          style={{ ...display(104, c.onInk, theme.weight.bold), justifyContent: "center" }}
          wordStyle={(i) => (i === 1 ? {
            color: c.onInkDim,
            backgroundImage: `linear-gradient(${c.brand}, ${c.brand})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0 58%",
            backgroundSize: `${strike * 100}% 8px`,
          } : undefined)} />
      </div>

      {/* Logo: tile springs in on "হোমনেট", wordmark wipes, then lifts for the tagline */}
      <div style={{ position: "absolute", top: 380 - lift * 120, display: "flex", flexDirection: "column", alignItems: "center",
        transform: `scale(${(0.7 + Math.min(tile, 1.05) * 0.3) * breathe})`, opacity: Math.min(1, tile * 1.4) }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 280, height: 280, borderRadius: "50%",
          border: `3px solid ${c.brand}`, opacity: (1 - ring) * 0.8, transform: `scale(${0.6 + ring * 1.4})` }} />
        <div style={{ filter: `drop-shadow(0 0 60px ${c.brandGlow})` }}>
          <Logo variant="dark" width={1000} reveal={0.215 + wordmark * 0.785} />
        </div>
      </div>

      {/* Tagline */}
      <div style={{ position: "absolute", top: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <Words text="বাংলাদেশের সবচেয়ে আধুনিক এবং" at={CUE.tagline} per={4}
          style={{ ...display(60, c.onInkDim, theme.weight.semiBold), justifyContent: "center" }} />
        <Enter at={CUE.smartProptech} dy={30}>
          <div style={{ ...display(92, c.onInk, theme.weight.bold), display: "flex", gap: 24 }}>
            <span style={{ color: c.brand }}>স্মার্ট প্রোপটেক</span>
            <span>প্ল্যাটফর্ম</span>
          </div>
        </Enter>
      </div>
    </AbsoluteFill>
  );
};
