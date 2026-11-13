import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Enter, useBreathe, useCueSpring, useExit } from "../components/Motion";
import { body, display, PhoneFrame, Photo, VerifiedBadge } from "../components/UI";
import { AppScreen } from "../components/AppScreen";

const c = theme.colors;

export const Vision: React.FC = () => {
  const photoIn = useCueSpring(CUE.kenaBecha, "smooth");
  const photoOut = useExit(CUE.technology + 0.2, 14);
  const phone = useCueSpring(CUE.technology + 0.15, "smooth");
  const float = useBreathe(32, 8);
  const pillars = [
    { text: "সম্পূর্ণ ডিজিটাল", at: CUE.digital },
    { text: "স্বচ্ছ", at: CUE.shocho2 },
    { text: "ঝামেলাহীন", at: CUE.jhamela },
  ];
  return (
    <AbsoluteFill>
      {/* Beat 1: the vision in three words */}
      <div style={{ position: "absolute", left: 160, top: 210, width: 860 }}>
        <Enter at={CUE.kenaBecha} exitAt={CUE.technology} dy={20}>
          <div style={body(36, c.onInkDim, theme.weight.medium)}>প্রপার্টি কেনা-বেচার পুরো অভিজ্ঞতা</div>
        </Enter>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
          {pillars.map((p, i) => (
            <Enter key={p.text} at={p.at} exitAt={CUE.technology + i * 0.05} dx={-50} dy={0} preset="snappy">
              <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: i === 0 ? c.brand : "rgba(255,255,255,0.3)" }} />
                <span style={display(112, c.onInk, theme.weight.bold)}>{p.text}</span>
              </div>
            </Enter>
          ))}
        </div>
        <Enter at={CUE.vision} exitAt={CUE.technology} dy={20}>
          <div style={{ ...display(44, c.brand, theme.weight.semiBold), marginTop: 18 }}>— আমাদের ভিশন</div>
        </Enter>
      </div>

      <div style={{ position: "absolute", left: 1120, top: 140, opacity: Math.min(1, photoIn) * (1 - photoOut),
        transform: `translateX(${(1 - photoIn) * 100 + photoOut * 200}px) translateY(${float}px)` }}>
        <Photo focusX={45} focusY={40} zoom={1.05} tint style={{ width: 640, height: 800, borderRadius: 24, boxShadow: theme.shadow.dark }} />
        <div style={{ position: "absolute", left: -50, bottom: 90 }}>
          <Enter at={CUE.shocho2} preset="bouncy" dy={20}><VerifiedBadge label="১০০% যাচাইকৃত প্রোপার্টি" scale={1.6} /></Enter>
        </div>
      </div>

      {/* Beat 2: real estate in your hand */}
      <div style={{ position: "absolute", left: 160, top: 300, width: 900 }}>
        <Enter at={CUE.technology} dy={20}>
          <div style={body(38, c.onInkDim, theme.weight.medium)}>টেকনোলজির হাত ধরে</div>
        </Enter>
        <Enter at={CUE.realEstate} dy={40} preset="snappy">
          <div style={display(116, c.onInk, theme.weight.bold)}>রিয়েল এস্টেট</div>
        </Enter>
        <Enter at={CUE.haterMuthoy - 0.5} dy={40} preset="snappy">
          <div style={display(72, c.onInk, theme.weight.semiBold)}>
            এখন আপনার <span style={{ color: c.brand }}>হাতের মুঠোয়</span>
          </div>
        </Enter>
      </div>
      <div style={{ position: "absolute", left: 1220, top: 110, opacity: Math.min(1, phone),
        transform: `translateY(${(1 - phone) * 500 + float}px) rotate(${(1 - phone) * 8 - 3}deg)` }}>
        <PhoneFrame width={420}><AppScreen width={392} /></PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
