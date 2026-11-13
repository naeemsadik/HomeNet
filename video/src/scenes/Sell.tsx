import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Enter, useCue, useCueSpring, useProgress, Words } from "../components/Motion";
import { Icon } from "../components/Icons";
import { body, display, Photo } from "../components/UI";
import { toBn } from "../lib";

const c = theme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const STEPS = [
  { label: "ধরন", icon: "building", at: CUE.step1 },
  { label: "লোকেশন", icon: "pin", at: CUE.step2 },
  { label: "ছবি", icon: "camera", at: CUE.step3 },
  { label: "দাম", icon: "tag", at: CUE.step4 },
];

const Field: React.FC<{ label: string; value: string; at: number }> = ({ label, value, at }) => (
  <Enter at={at} dy={16} blur={0} preset="snappy">
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={body(16, c.muted, theme.weight.semiBold)}>{label}</span>
      <div style={{ height: 58, borderRadius: 8, background: c.surfaceSunken, border: `1px solid ${c.divider}`, display: "flex", alignItems: "center", padding: "0 18px" }}>
        <span style={body(20, c.ink, theme.weight.semiBold)}>{value}</span>
      </div>
    </div>
  </Enter>
);

const ListingFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const done = STEPS.reduce((acc, s, i) => (frame >= cue(s.at) ? i + 1 : acc), 0);
  const bar = interpolate(frame, [cue(CUE.step1) - 6, cue(CUE.step4)], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const success = useCueSpring(CUE.listingDone, "bouncy");
  return (
    <div style={{ width: 760, borderRadius: 14, background: c.surface, border: `1px solid ${c.divider}`, boxShadow: theme.shadow.float, padding: 34, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={display(34, c.ink, theme.weight.bold)}>নতুন লিস্টিং তৈরি করুন</span>
        <span style={body(18, c.muted, theme.weight.semiBold)}>ধাপ {toBn(Math.max(1, Math.min(4, done + 1)))}/৪</span>
      </div>
      {/* Stepper */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 28, height: 4, borderRadius: 2, background: c.surfaceSunken }} />
        <div style={{ position: "absolute", left: 30, top: 28, height: 4, borderRadius: 2, background: c.brand, width: `calc(${bar} * (100% - 60px))` }} />
        {STEPS.map((s, i) => {
          const isDone = i < done;
          const p = spring({ frame: frame - cue(s.at), fps: 30, config: theme.spring.bouncy });
          return (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
              <div style={{ width: 60, height: 60, borderRadius: 30, background: isDone ? c.brand : c.surface,
                border: `2px solid ${isDone ? c.brand : c.divider}`, display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${isDone ? 0.85 + Math.min(p, 1.15) * 0.15 : 1})` }}>
                <Icon name={isDone ? "check" : s.icon} size={28} color={isDone ? c.onBrand : c.muted} stroke={isDone ? 3 : 2} />
              </div>
              <span style={body(19, isDone ? c.ink : c.muted, theme.weight.semiBold)}>{s.label}</span>
            </div>
          );
        })}
      </div>
      {/* Form preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="প্রপার্টির ধরন" value="অ্যাপার্টমেন্ট · বিক্রি" at={CUE.step1} />
        <Field label="লোকেশন" value="ধানমন্ডি, ঢাকা" at={CUE.step2} />
        <Enter at={CUE.step3} dy={16} blur={0} preset="snappy">
          <div style={{ display: "flex", gap: 8 }}>
            {[20, 55, 90].map((fx) => (
              <Photo key={fx} focusX={fx} focusY={50} zoom={1.6} style={{ width: 110, height: 84, borderRadius: 8 }} />
            ))}
          </div>
        </Enter>
        <Field label="দাম" value="৳ ১,৭২,০০,০০০" at={CUE.step4} />
      </div>
      <div style={{ height: 66, borderRadius: 10, background: success > 0.05 ? c.ink : c.surfaceSunken, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ transform: `scale(${Math.min(success, 1.2)})` }}><Icon name="check" size={26} color={c.brand} stroke={3} /></div>
        <span style={body(22, success > 0.05 ? c.onInk : c.subtle, theme.weight.bold)}>{success > 0.05 ? "লিস্টিং প্রকাশিত হয়েছে" : "লিস্টিং প্রকাশ করুন"}</span>
      </div>
    </div>
  );
};

const Valuation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = useCue();
  const count = spring({ frame: frame - cue(CUE.valuation), fps, config: { damping: 30, stiffness: 50 } });
  const value = interpolate(count, [0, 1], [0, 1.72]);
  const marker = useProgress(CUE.valuation, CUE.valuation + 1.4, theme.ease.out);
  const confidence = useCueSpring(CUE.bazardor, "snappy");
  const bars = [0.55, 0.72, 0.64, 0.86, 0.78, 0.92, 0.7];
  return (
    <div style={{ width: 700, borderRadius: 14, background: c.ink, padding: 34, boxShadow: theme.shadow.dark, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={display(36, c.onInk, theme.weight.bold)}>ভ্যালুয়েশন ইন্টেলিজেন্স</span>
        <Enter at={CUE.ai} dy={0} scaleFrom={0.5} preset="bouncy" blur={0}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: c.brand }}>
            <Icon name="sparkles" size={20} color={c.onBrand} />
            <span style={{ ...body(18, c.onBrand, theme.weight.bold), lineHeight: 1.5 }}>এআই-পাওয়ার্ড</span>
          </div>
        </Enter>
      </div>
      <div>
        <div style={body(20, c.onInkDim, theme.weight.medium)}>আনুমানিক বাজারদর</div>
        <div style={{ ...display(84, c.onInk, theme.weight.bold), fontVariantNumeric: "tabular-nums" }}>৳ {toBn(value.toFixed(2))} কোটি</div>
      </div>
      {/* Range */}
      <div>
        <div style={{ position: "relative", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ position: "absolute", left: "18%", right: "22%", top: 0, bottom: 0, borderRadius: 6, background: "rgba(4,207,146,0.35)" }} />
          <div style={{ position: "absolute", top: -9, left: `calc(${18 + marker * 36}% - 15px)`, width: 30, height: 30, borderRadius: 15,
            background: c.brand, border: `4px solid ${c.ink}` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span style={body(17, c.onInkDim, theme.weight.medium)}>৳ ১.৬০ কোটি</span>
          <span style={body(17, c.onInkDim, theme.weight.medium)}>৳ ১.৮৫ কোটি</span>
        </div>
      </div>
      {/* Comparable sales */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 110 }}>
        {bars.map((h, i) => {
          const p = spring({ frame: frame - cue(CUE.valuation + 0.5) - i * 3, fps, config: theme.spring.smooth });
          return <div key={i} style={{ flex: 1, height: `${h * 100 * Math.min(p, 1)}%`, borderRadius: 4, background: i === 5 ? c.brand : "rgba(255,255,255,0.14)" }} />;
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: Math.min(1, confidence), transform: `translateY(${(1 - Math.min(confidence, 1)) * 14}px)` }}>
        <Icon name="chart" size={22} color={c.brand} />
        <span style={body(20, c.onInk, theme.weight.semiBold)}>এলাকার ১২৪টি তুলনীয় বিক্রির ভিত্তিতে · ৯২% কনফিডেন্স</span>
      </div>
    </div>
  );
};

export const Sell: React.FC = () => {
  const up = useProgress(CUE.steps - 0.45, CUE.steps + 0.2, theme.ease.inOut);
  const frame = useCurrentFrame();
  const cue = useCue();
  const mode = frame >= cue(CUE.rentWord) - 2 ? 1 : frame >= cue(CUE.sellWord) - 2 ? 0 : -1;
  return (
    <AbsoluteFill>
      {/* Question: large, then it docks to the top as the product takes over */}
      <div style={{ position: "absolute", width: "100%", top: interpolate(up, [0, 1], [380, 70]), display: "flex", flexDirection: "column",
        alignItems: "center", transform: `scale(${interpolate(up, [0, 1], [1, 0.62])})`, transformOrigin: "center top" }}>
        <Words text="নিজের প্রপার্টি বিক্রি বা ভাড়া দিতে চান?" at={CUE.sellQ} per={4}
          style={{ ...display(96, c.ink, theme.weight.bold), justifyContent: "center" }}
          wordStyle={(i) => (i === 2 || i === 4 ? {
            borderRadius: 16, padding: "0 16px", margin: "0 -16px",
            ...((i === 2 && mode === 0) || (i === 4 && mode === 1) ? { color: c.brandText, background: c.brandSurface } : {}),
          } : undefined)} />
      </div>

      <div style={{ position: "absolute", left: 150, top: 250 }}>
        <Enter at={CUE.steps} dy={70} float={2}><ListingFlow /></Enter>
      </div>
      <div style={{ position: "absolute", left: 1000, top: 300 }}>
        <Enter at={CUE.damNiye} dx={120} dy={0} float={3}><Valuation /></Enter>
      </div>
    </AbsoluteFill>
  );
};
