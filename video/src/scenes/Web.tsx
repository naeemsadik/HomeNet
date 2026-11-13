import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Caret, Enter, useCue, useCueSpring, useProgress, Words } from "../components/Motion";
import { Icon } from "../components/Icons";
import { body, display, Logo } from "../components/UI";

const c = theme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** URL typed in bursts on the spoken words: "homenetbd" on হোমনেট, ".com" on ডট কম; ডট বিডি lands the confirm pulse. */
const useUrl = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const seg = (text: string, from: number, to: number) =>
    text.slice(0, Math.round(interpolate(frame, [cue(from), cue(to)], [0, text.length], { ...clamp, easing: theme.ease.out })));
  return seg("homenetbd", CUE.urlHomenet - 0.25, CUE.urlHomenet + 0.4) + seg(".com", CUE.urlCom - 0.1, CUE.urlCom + 0.25);
};

export const Web: React.FC = () => {
  const dock = useProgress(CUE.duniya - 0.35, CUE.duniya + 0.2, theme.ease.inOut);
  const bar = useCueSpring(CUE.duniya, "smooth");
  const url = useUrl();
  const enter = useCueSpring(CUE.urlBd + 0.45, "bouncy");
  const frame = useCurrentFrame();
  const cue = useCue();
  const glow = interpolate(frame, [cue(CUE.urlBd + 0.3), cue(CUE.urlBd + 0.9)], [0, 1], { ...clamp, easing: theme.ease.out });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", width: "100%", top: interpolate(dock, [0, 1], [400, 150]), display: "flex", justifyContent: "center",
        transform: `scale(${interpolate(dock, [0, 1], [1, 0.7])})` }}>
        <Words text="তাহলে আর দেরি কেন?" at={CUE.deri} per={3} style={{ ...display(124, c.ink, theme.weight.bold), justifyContent: "center" }} />
      </div>

      <div style={{ position: "absolute", top: 360 }}>
        <Enter at={CUE.duniya} dy={20}>
          <div style={{ ...body(38, c.muted, theme.weight.medium), textAlign: "center" }}>স্মার্ট রিয়েল এস্টেটের দুনিয়ায় পা রাখতে</div>
        </Enter>
      </div>

      {/* The address bar */}
      <div style={{ position: "absolute", top: 470, opacity: Math.min(1, bar), transform: `translateY(${(1 - bar) * 60}px) scale(${0.94 + 0.06 * Math.min(bar, 1)})` }}>
        <div style={{ width: 1180, height: 150, borderRadius: 75, background: c.surface, border: `2px solid ${glow > 0 ? c.brand : c.divider}`,
          boxShadow: `${theme.shadow.float}, 0 0 0 ${glow * 10}px ${c.brandSurface}`, display: "flex", alignItems: "center", gap: 28, padding: "0 20px 0 54px" }}>
          <Icon name="globe" size={50} color={c.brandText} />
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            {url ? (
              <span style={{ fontFamily: theme.fonts.body, fontSize: 72, fontWeight: theme.weight.bold, color: c.ink, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{url}</span>
            ) : (
              <span style={body(48, c.subtle, theme.weight.medium)}>আজই ভিজিট করুন</span>
            )}
            <Caret color={c.brandText} height={70} />
          </div>
          <div style={{ height: 110, padding: "0 44px", borderRadius: 55, background: c.brand, display: "flex", alignItems: "center", gap: 14,
            transform: `scale(${1 + Math.max(0, Math.min(enter, 1.2) - 1) * 0.5})` }}>
            <span style={{ ...body(36, c.onBrand, theme.weight.bold), lineHeight: 1.4 }}>ভিজিট করুন</span>
            <Icon name="arrowRight" size={36} color={c.onBrand} stroke={2.6} />
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 720 }}>
        <Enter at={CUE.visit} dy={30}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Logo variant="light" width={300} />
          </div>
        </Enter>
      </div>
    </AbsoluteFill>
  );
};
