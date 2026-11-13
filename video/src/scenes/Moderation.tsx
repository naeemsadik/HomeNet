import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Enter, useBreathe, useCue, useCueSpring, useProgress, Words } from "../components/Motion";
import { Icon } from "../components/Icons";
import { body, display, Photo } from "../components/UI";
import { toBn } from "../lib";

const c = theme.colors;

const ROWS = [
  { title: "৩ বেড অ্যাপার্টমেন্ট, বনানী", meta: "মালিকানা দলিল যাচাই", fx: 30 },
  { title: "অফিস স্পেস, মতিঝিল", meta: "ছবি ও লোকেশন যাচাই", fx: 60 },
  { title: "ডুপ্লেক্স বাড়ি, উত্তরা", meta: "দাম ও তথ্য যাচাই", fx: 85 },
  { title: "স্টুডিও ফ্ল্যাট, মিরপুর", meta: "মালিকের পরিচয় যাচাই", fx: 10 },
];

const ReviewQueue: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = useCue();
  return (
    <div style={{ width: 760, borderRadius: 16, background: c.inkRaised, border: `1px solid ${c.inkLine}`, padding: 26, display: "flex", flexDirection: "column", gap: 14, boxShadow: theme.shadow.dark }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 6 }}>
        <span style={display(30, c.onInk, theme.weight.bold)}>মডারেশন কিউ</span>
        <span style={body(18, c.onInkDim, theme.weight.semiBold)}>আজ {toBn(312)}টি রিভিউ</span>
      </div>
      {ROWS.map((r, i) => {
        const check = spring({ frame: frame - cue(CUE.jachai) - i * 6, fps, config: theme.spring.bouncy });
        const ok = check > 0.05;
        return (
          <Enter key={r.title} at={CUE.moderation + i * 0.12} dx={-40} dy={0} preset="snappy">
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${c.inkLine}` }}>
              <Photo focusX={r.fx} focusY={50} zoom={1.7} style={{ width: 96, height: 72, borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div style={body(21, c.onInk, theme.weight.semiBold)}>{r.title}</div>
                <div style={body(16, c.onInkDim, theme.weight.medium)}>{r.meta}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999,
                background: ok ? "rgba(4,207,146,0.14)" : "rgba(255,255,255,0.06)" }}>
                {ok ? (
                  <div style={{ transform: `scale(${Math.min(check, 1.2)})` }}><Icon name="check" size={18} color={c.brand} stroke={3} /></div>
                ) : (
                  <div style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid ${c.onInkDim}`, borderTopColor: "transparent", transform: `rotate(${frame * 12}deg)` }} />
                )}
                <span style={{ ...body(16, ok ? c.brand : c.onInkDim, theme.weight.bold), lineHeight: 1.5 }}>{ok ? "যাচাইকৃত" : "রিভিউ চলছে"}</span>
              </div>
            </div>
          </Enter>
        );
      })}
    </div>
  );
};

const Shield: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const scan = (frame % 60) / 60;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[0, 1].map((k) => {
        const t = (scan + k * 0.5) % 1;
        return <div key={k} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${c.brand}`, opacity: (1 - t) * 0.5, transform: `scale(${0.6 + t * 0.7})` }} />;
      })}
      <div style={{ width: size * 0.62, height: size * 0.62, borderRadius: size * 0.16, background: c.brand,
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 80px ${c.brandGlow}` }}>
        <Icon name="shield" size={size * 0.34} color={c.onBrand} stroke={2.2} />
      </div>
    </div>
  );
};

export const Moderation: React.FC = () => {
  const swap = useProgress(CUE.seller - 0.5, CUE.seller, theme.ease.inOut);
  const shieldIn = useCueSpring(CUE.shudhu + 0.2, "bouncy");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = useCue();
  const count = spring({ frame: frame - cue(CUE.hundred) + 4, fps, config: { damping: 28, stiffness: 60 } });
  const float = useBreathe(30, 6);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 90, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Enter at={CUE.shudhu} exitAt={CUE.seller} dy={20}>
          <div style={body(32, c.onInkDim, theme.weight.medium)}>শুধু তাই নয়,</div>
        </Enter>
        <div style={{ opacity: 1 - swap }}>
          <Words text="ডেডিকেটেড মডারেশন টিম" at={CUE.moderation} per={4}
            style={{ ...display(84, c.onInk, theme.weight.bold), justifyContent: "center" }} />
        </div>
      </div>

      {/* Beat 1: the review queue checks every listing */}
      <div style={{ position: "absolute", left: 200, top: 330, opacity: 1 - swap, transform: `translateX(${-swap * 120}px)` }}>
        <ReviewQueue />
      </div>

      {/* The shield travels from the side to the centre for beat 2 */}
      <div style={{ position: "absolute", top: interpolate(swap, [0, 1], [380, 230]), left: interpolate(swap, [0, 1], [1220, 760]),
        transform: `scale(${Math.min(shieldIn, 1.05)}) translateY(${float}px)`, opacity: Math.min(1, shieldIn) }}>
        <Shield size={400} />
      </div>

      {/* Beat 2: seller and buyer, both protected */}
      <div style={{ position: "absolute", left: 340, top: 380 }}>
        <Enter at={CUE.seller} dx={-60} dy={0} preset="snappy">
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 30px", borderRadius: 999, background: c.inkRaised, border: `1px solid ${c.inkLine}` }}>
            <Icon name="home" size={32} color={c.onInk} />
            <span style={display(46, c.onInk, theme.weight.semiBold)}>সেলার</span>
          </div>
        </Enter>
      </div>
      <div style={{ position: "absolute", right: 340, top: 380 }}>
        <Enter at={CUE.buyer} dx={60} dy={0} preset="snappy">
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 30px", borderRadius: 999, background: c.inkRaised, border: `1px solid ${c.inkLine}` }}>
            <Icon name="user" size={32} color={c.onInk} />
            <span style={display(46, c.onInk, theme.weight.semiBold)}>বায়ার</span>
          </div>
        </Enter>
      </div>

      <div style={{ position: "absolute", top: 660, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Enter at={CUE.hundred} dy={30} preset="smooth">
          <div style={{ ...display(150, c.onInk, theme.weight.extraBold), fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {toBn(Math.round(count * 100))}%
          </div>
        </Enter>
        <div style={{ display: "flex", gap: 20 }}>
          {[["জেনুইন", CUE.genuine, "check"], ["সিকিউরড", CUE.secured, "lock"]].map(([label, at, icon]) => (
            <Enter key={label as string} at={at as number} dy={24} preset="bouncy">
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 24px", borderRadius: 999, background: "rgba(4,207,146,0.12)", border: `1px solid rgba(4,207,146,0.3)` }}>
                <Icon name={icon as string} size={26} color={c.brand} stroke={2.6} />
                <span style={display(38, c.onInk, theme.weight.semiBold)}>{label}</span>
              </div>
            </Enter>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
