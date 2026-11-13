import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Enter, useBreathe, useCue, useCueSpring, useProgress } from "../components/Motion";
import { Icon, PlayStoreIcon } from "../components/Icons";
import { body, display, PhoneFrame } from "../components/UI";
import { AppScreen } from "../components/AppScreen";

const c = theme.colors;

const Toast: React.FC<{ at: number; icon: string; title: string; text: string }> = ({ at, icon, title, text }) => (
  <Enter at={at} dy={-30} preset="bouncy">
    <div style={{ width: 400, display: "flex", gap: 14, alignItems: "center", padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.97)",
      boxShadow: theme.shadow.float, border: `1px solid ${c.divider}` }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: c.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={26} color={c.onBrand} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={body(18, c.ink, theme.weight.bold)}>{title}</div>
        <div style={body(15, c.muted, theme.weight.medium)}>{text}</div>
      </div>
    </div>
  </Enter>
);

export const AppPromo: React.FC = () => {
  const phone = useCueSpring(CUE.arHa - 0.1, "smooth");
  const float = useBreathe(30, 7);
  const dl = useProgress(CUE.download, CUE.app - 0.1, theme.ease.inOut);
  const frame = useCurrentFrame();
  const cue = useCue();
  const installed = frame >= cue(CUE.app) - 3;
  const done = useCueSpring(CUE.app, "bouncy");
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 260, top: 100, opacity: Math.min(1, phone),
        transform: `translateY(${(1 - phone) * 300 + float}px) rotate(${(1 - phone) * -6 + 2}deg)` }}>
        <PhoneFrame width={420}><AppScreen width={392} /></PhoneFrame>
        <div style={{ position: "absolute", left: 200, top: 150, display: "flex", flexDirection: "column", gap: 14 }}>
          <Toast at={CUE.update + 0.9} icon="bell" title="দাম আপডেট" text="গুলশান-২ পেন্টহাউস: নতুন অফার" />
          <Toast at={CUE.update + 1.7} icon="chat" title="নতুন মেসেজ" text="মালিক আপনার প্রশ্নের উত্তর দিয়েছেন" />
        </div>
      </div>

      <div style={{ position: "absolute", left: 1000, top: 250, width: 780 }}>
        <Enter at={CUE.arHa} dy={20}>
          <div style={body(36, c.muted, theme.weight.medium)}>আর হ্যাঁ,</div>
        </Enter>
        <Enter at={CUE.update} dy={40} preset="snappy">
          <div style={display(84, c.ink, theme.weight.bold)}>প্রপার্টির সব আপডেট</div>
        </Enter>
        <Enter at={CUE.update + 1.3} dy={30}>
          <div style={display(64, c.body, theme.weight.semiBold)}>সবসময় সাথে রাখুন</div>
        </Enter>

        {/* Store button turns into a download, then an installed state */}
        <div style={{ marginTop: 48 }}>
          <Enter at={CUE.playStore} dy={40} preset="bouncy">
            <div style={{ position: "relative", width: 680, height: 150, borderRadius: 20, background: c.ink, overflow: "hidden",
              display: "flex", alignItems: "center", gap: 22, padding: "0 26px", boxShadow: theme.shadow.dark }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${dl * 100}%`, background: "rgba(4,207,146,0.22)" }} />
              <div style={{ zIndex: 1, width: 100, height: 100, borderRadius: 22, background: c.surface, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlayStoreIcon size={68} />
              </div>
              <div style={{ zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
                <span style={{ ...body(20, c.onInkDim, theme.weight.medium), lineHeight: 1.4 }}>
                  {installed ? "ইনস্টল সম্পন্ন" : dl > 0 ? "ডাউনলোড হচ্ছে…" : "প্লে-স্টোর থেকে ডাউনলোড করুন"}
                </span>
                <span style={{ ...display(40, c.onInk, theme.weight.bold), paddingBlock: 0, lineHeight: 1.35 }}>হোমনেট অ্যাপ</span>
              </div>
              <div style={{ zIndex: 1, width: 60, height: 60, borderRadius: 30, flexShrink: 0,
                background: installed ? c.brand : "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${installed ? Math.min(done, 1.15) : 1})` }}>
                {installed ? <Icon name="check" size={32} color={c.onBrand} stroke={3} /> : <Icon name="download" size={28} color={c.onInk} />}
              </div>
            </div>
          </Enter>
        </div>
      </div>
    </AbsoluteFill>
  );
};
