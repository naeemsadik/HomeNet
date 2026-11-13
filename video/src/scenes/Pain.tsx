import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Enter, useBreathe, useCue, useCueSpring, useProgress, Words } from "../components/Motion";
import { Icon } from "../components/Icons";
import { body, display } from "../components/UI";

const c = theme.colors;

const Chip: React.FC<{ icon: string; label: string; at: number; index: number }> = ({ icon, label, at, index }) => {
  const frame = useCurrentFrame();
  const cue = useCue();
  // Once "tension" is spoken the chips start to fidget: a nervous micro-shake.
  const stress = interpolate(frame, [cue(CUE.kothagulo), cue(CUE.tension)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut,
  });
  const shake = Math.sin(frame * 0.9 + index * 2) * 3 * stress;
  const tilt = Math.sin(frame / 20 + index) * 2.5 * stress;
  return (
    <Enter at={at} exitAt={CUE.dalal} dy={50} preset="snappy" float={3}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 30px 18px 20px", borderRadius: 999,
        background: c.inkRaised, border: `1px solid ${c.inkLine}`, transform: `translateX(${shake}px) rotate(${tilt}deg)`,
        boxShadow: theme.shadow.dark }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={36} color={c.onInk} />
        </div>
        <span style={display(54, c.onInk, theme.weight.semiBold)}>{label}</span>
      </div>
    </Enter>
  );
};

const WorryCard: React.FC<{ icon: string; title: string; at: number }> = ({ icon, title, at }) => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const chase = interpolate(frame, [cue(CUE.tara), cue(CUE.tara) + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jitter = Math.sin(frame * 0.7 + at) * 4 * chase;
  return (
    <Enter at={at} dy={70} scaleFrom={0.9} float={4}>
      <div style={{ width: 760, minHeight: 300, padding: "44px 48px", borderRadius: 20, background: c.inkRaised, border: `1px solid ${c.inkLine}`,
        boxShadow: theme.shadow.dark, transform: `translateX(${jitter}px)`, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ width: 84, height: 84, borderRadius: 22, background: "rgba(244,130,58,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={44} color={c.notification} />
        </div>
        <span style={{ ...display(60, c.onInk, theme.weight.bold), whiteSpace: "nowrap" }}>{title}</span>
      </div>
    </Enter>
  );
};

export const Pain: React.FC = () => {
  const q = useCueSpring(CUE.taiTo, "bouncy");
  const fadeOut = useProgress(CUE.tara + 0.6, CUE.tobeEbar, theme.ease.in);
  const drift = useBreathe(40, 6);
  // Chips sit centre-frame for beat 1, then rise to make room for the headline.
  const rise = useProgress(CUE.kothagulo + 0.9, CUE.kothagulo + 1.5, theme.ease.inOut);
  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: 1 - fadeOut * 0.6 }}>
      {/* Beat 1: the three life events, each landing on its word */}
      <div style={{ position: "absolute", top: 440 - rise * 250, display: "flex", gap: 28 }}>
        <Chip icon="truck" label="বাসা বদল" at={CUE.basaBodol} index={0} />
        <Chip icon="key" label="নতুন ফ্ল্যাট কেনা" at={CUE.notunFlat} index={1} />
        <Chip icon="tag" label="প্রপার্টি বিক্রি" at={CUE.bikri} index={2} />
      </div>

      {/* Beat 2: the feeling */}
      <div style={{ position: "absolute", top: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `translateY(${drift}px)` }}>
        <Words
          text="এক গাদা টেনশন আর দৌড়াদৌড়ি"
          at={CUE.kothagulo}
          times={[5.85, 6.05, CUE.tension, 6.85, CUE.douradouri]}
          exitAt={CUE.dalal}
          style={{ ...display(124, c.onInk, theme.weight.bold), justifyContent: "center" }}
          wordStyle={(i) => (i === 2 || i === 4 ? { color: c.notification } : { color: c.onInkDim })}
        />
        <Enter at={CUE.taiTo} exitAt={CUE.dalal} preset="bouncy" dy={20}>
          <div style={{ ...body(44, c.onInkDim, theme.weight.medium), transform: `scale(${0.9 + q * 0.1})` }}>তাই তো?</div>
        </Enter>
      </div>

      {/* Beat 3: the fears */}
      <div style={{ position: "absolute", top: 330, display: "flex", gap: 48 }}>
        <WorryCard icon="users" title="দালালদের দৌরাত্ম্য" at={CUE.dalal} />
        <WorryCard icon="alert" title="সঠিক দাম না পাওয়ার ভয়" at={CUE.shothikDam} />
      </div>
      <div style={{ position: "absolute", top: 730 }}>
        <Words text="যেন সব সময় তাড়া করে বেড়ায়" at={CUE.tara} per={4} style={body(40, c.onInkDim, theme.weight.medium)} />
      </div>
    </AbsoluteFill>
  );
};
