import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

const c = theme.colors;

/** Ink background: two slow brand glows and a faint architectural grid. */
export const DarkBg: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 70) * 60;
  const d2 = Math.cos(frame / 90) * 50;
  return (
    <AbsoluteFill style={{ background: c.ink }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${c.inkLine} 1px, transparent 1px), linear-gradient(90deg, ${c.inkLine} 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          backgroundPosition: `${frame * 0.15}px ${frame * 0.1}px`,
          opacity: 0.35,
          maskImage: "radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)",
        }}
      />
      <div
        style={{
          position: "absolute", width: 1300, height: 1300, borderRadius: "50%", top: -620, left: -260 + d1,
          background: `radial-gradient(circle, rgba(4,207,146,0.20), transparent 62%)`, filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute", width: 1000, height: 1000, borderRadius: "50%", bottom: -560, right: -220 - d2,
          background: `radial-gradient(circle, rgba(4,207,146,0.12), transparent 65%)`, filter: "blur(60px)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Canvas background: the app's light surface with a soft mint wash and dot grid. */
export const LightBg: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 80) * 50;
  return (
    <AbsoluteFill style={{ background: c.canvas }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(11,26,23,0.10) 1.2px, transparent 1.2px)`,
          backgroundSize: "32px 32px",
          backgroundPosition: `${frame * 0.12}px 0px`,
          maskImage: "radial-gradient(ellipse at 50% 50%, black 10%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 10%, transparent 72%)",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute", width: 1400, height: 1400, borderRadius: "50%", top: -760, right: -300 + d1,
          background: `radial-gradient(circle, rgba(4,207,146,0.16), transparent 60%)`, filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute", width: 900, height: 900, borderRadius: "50%", bottom: -520, left: -200 - d1,
          background: `radial-gradient(circle, rgba(34,81,214,0.05), transparent 62%)`, filter: "blur(50px)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Global finish, above all content: gentle grade, film grain, vignette. */
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundColor: c.brand, mixBlendMode: "soft-light", opacity: 0.05 }} />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.06), transparent 25%, transparent 75%, rgba(0,0,0,0.10))" }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: noise, backgroundSize: "220px",
          backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
          opacity: 0.06, mixBlendMode: "overlay",
        }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.22) 100%)" }}
      />
    </AbsoluteFill>
  );
};

/** Cross-dissolve wrapper for a scene: scale-through + de-blur in. */
export const SceneFade: React.FC<{ fadeIn: boolean; frames: number; children: React.ReactNode }> = ({
  fadeIn, frames, children,
}) => {
  const frame = useCurrentFrame();
  const p = fadeIn
    ? interpolate(frame, [0, frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out })
    : 1;
  return (
    <AbsoluteFill style={{ opacity: p, transform: `scale(${1.035 - 0.035 * p})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};
