import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Enter, useBreathe, useCue, useCueSpring, useProgress } from "../components/Motion";
import { body, display, Logo } from "../components/UI";

const c = theme.colors;

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const tile = useCueSpring(CUE.outroHomenet - 0.1, "bouncy");
  const wordmark = useProgress(CUE.outroHomenet + 0.05, CUE.outroHomenet + 0.6, theme.ease.out);
  const ring = interpolate(frame, [cue(CUE.outroHomenet) - 3, cue(CUE.outroHomenet) + 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out,
  });
  const breathe = 1 + useBreathe(28, 0.006);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 300, transform: `scale(${(0.75 + Math.min(tile, 1.05) * 0.25) * breathe})`, opacity: Math.min(1, tile * 1.5) }}>
        <div style={{ position: "absolute", top: -60, left: -60, width: 300, height: 300, borderRadius: "50%",
          border: `3px solid ${c.brand}`, opacity: (1 - ring) * 0.7, transform: `scale(${0.5 + ring * 1.5})` }} />
        <div style={{ filter: `drop-shadow(0 0 70px ${c.brandGlow})` }}>
          <Logo variant="dark" width={920} reveal={0.215 + wordmark * 0.785} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 560, display: "flex", gap: 30 }}>
        <Enter at={CUE.smartProperty} dy={36} preset="snappy">
          <span style={display(84, c.onInk, theme.weight.bold)}>স্মার্ট প্রপার্টি,</span>
        </Enter>
        <Enter at={CUE.smartSolution} dy={36} preset="snappy">
          <span style={display(84, c.brand, theme.weight.bold)}>স্মার্ট সলিউশন।</span>
        </Enter>
      </div>
      <div style={{ position: "absolute", top: 760 }}>
        <Enter at={CUE.smartSolution + 0.4} dy={20}>
          <span style={{ ...body(34, c.onInkDim, theme.weight.semiBold), letterSpacing: "0.02em" }}>homenet.com.bd</span>
        </Enter>
      </div>
    </AbsoluteFill>
  );
};
