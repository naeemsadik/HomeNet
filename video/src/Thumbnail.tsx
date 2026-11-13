import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import { DarkBg, Finish } from "./components/Layers";
import { body, CARDS, display, Logo, PhoneFrame, PropertyCard, VerifiedBadge } from "./components/UI";
import { AppScreen } from "./components/AppScreen";

const c = theme.colors;

/** 1280×720 YouTube thumbnail: one big promise, the brand, and the product. */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill>
    <DarkBg />
    <div style={{ position: "absolute", left: 64, top: 70, width: 700, display: "flex", flexDirection: "column", gap: 10 }}>
      <Logo variant="dark" width={330} />
      <div style={{ marginTop: 30 }}>
        <div style={{ ...display(112, c.onInk, theme.weight.extraBold), lineHeight: 1.25, paddingBlock: 0 }}>স্মার্ট প্রপার্টি,</div>
        <div style={{ ...display(112, c.brand, theme.weight.extraBold), lineHeight: 1.25, paddingBlock: 0 }}>স্মার্ট সলিউশন</div>
      </div>
      <div style={{ marginTop: 18, display: "inline-flex", alignSelf: "flex-start", padding: "6px 22px", borderRadius: 999,
        background: "rgba(255,255,255,0.08)", border: `1px solid ${c.inkLine}` }}>
        <span style={{ ...body(30, c.onInk, theme.weight.semiBold), lineHeight: 1.5 }}>বাংলাদেশের আধুনিক প্রোপটেক প্ল্যাটফর্ম</span>
      </div>
    </div>

    <div style={{ position: "absolute", left: 900, top: 64, transform: "rotate(6deg)", filter: `drop-shadow(0 0 60px ${c.brandGlow})` }}>
      <PhoneFrame width={290}><AppScreen width={270} /></PhoneFrame>
    </div>
    <div style={{ position: "absolute", left: 760, top: 330, transform: "rotate(-4deg)" }}>
      <div style={{ position: "relative" }}>
        <PropertyCard data={CARDS[0]} width={330} imageHeight={180} scale={0.95} showBadge={false} />
        <div style={{ position: "absolute", top: 12, left: 12 }}><VerifiedBadge label="ভেরিফাইড লিস্টিং" scale={1.3} /></div>
      </div>
    </div>
    <Finish />
  </AbsoluteFill>
);
