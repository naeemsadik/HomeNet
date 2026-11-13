import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Icon } from "./Icons";

const c = theme.colors;

/** Display text style. Generous line-height + vertical padding keep Bengali matras unclipped. */
export const display = (size: number, color: string, weight: number = theme.weight.bold): React.CSSProperties => ({
  fontFamily: theme.fonts.display, fontSize: size, fontWeight: weight, color,
  lineHeight: theme.lineHeight.display, letterSpacing: "-0.01em", paddingBlock: size * 0.06,
});

export const body = (size: number, color: string, weight: number = theme.weight.medium): React.CSSProperties => ({
  fontFamily: theme.fonts.body, fontSize: size, fontWeight: weight, color, lineHeight: theme.lineHeight.body,
});

/** A real HomeNet asset (assets/auth-hero-building.webp) with slow Ken Burns. */
export const Photo: React.FC<{ focusX?: number; focusY?: number; zoom?: number; tint?: boolean; style?: React.CSSProperties }> = ({
  focusX = 50, focusY = 50, zoom = 1.25, tint = false, style,
}) => {
  const frame = useCurrentFrame();
  const scale = zoom + interpolate(frame, [0, 600], [0, 0.1], { extrapolateRight: "clamp", easing: theme.ease.inOut });
  const pan = interpolate(frame, [0, 600], [0, -18], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", overflow: "hidden", background: c.surfaceSunken, ...style }}>
      <Img
        src={staticFile("images/building.jpg")}
        style={{
          width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focusX}% ${focusY}%`,
          transform: `scale(${scale}) translateX(${pan}px)`, transformOrigin: `${focusX}% ${focusY}%`,
        }}
      />
      {tint && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(11,26,23,0.55))" }} />}
    </div>
  );
};

export const BrowserFrame: React.FC<{ url: string; width: number; height: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  url, width, height, children, style,
}) => (
  <div style={{ width, height, borderRadius: 16, background: c.surface, boxShadow: theme.shadow.float, overflow: "hidden",
    border: `1px solid ${c.divider}`, display: "flex", flexDirection: "column", ...style }}>
    <div style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "0 20px",
      background: c.surfaceSunken, borderBottom: `1px solid ${c.divider}` }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 13, height: 13, borderRadius: 7, background: "rgba(11,26,23,0.14)" }} />
      ))}
      <div style={{ marginLeft: 18, flex: 1, maxWidth: 520, height: 34, borderRadius: 17, background: c.surface,
        border: `1px solid ${c.divider}`, display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
        <Icon name="lock" size={14} color={c.brandText} />
        <span style={{ ...body(15, c.muted, 500), lineHeight: 1 }}>{url}</span>
      </div>
    </div>
    <div style={{ flex: 1, position: "relative", background: c.canvas }}>{children}</div>
  </div>
);

export const PhoneFrame: React.FC<{ width: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width, children, style }) => {
  const height = width * 2.05;
  return (
    <div style={{ width, height, borderRadius: width * 0.16, background: c.ink, padding: width * 0.035,
      boxShadow: theme.shadow.dark, border: "1px solid rgba(255,255,255,0.10)", ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: width * 0.13, overflow: "hidden", background: c.canvas }}>
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: width * 0.3,
          height: width * 0.085, borderRadius: 99, background: c.ink, zIndex: 5 }} />
        {children}
      </div>
    </div>
  );
};

export const Logo: React.FC<{ variant: "light" | "dark"; width: number; reveal?: number }> = ({ variant, width, reveal = 1 }) => {
  // The lockup's tile ends at ~22% of the width; reveal 0..0.22 shows the tile, then the wordmark wipes in.
  const clip = interpolate(reveal, [0, 1], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Img
      src={staticFile(variant === "dark" ? "images/homenet-logo-reverse-clear.svg" : "images/homenet-logo.svg")}
      style={{ width, height: (width * 684) / 3464, clipPath: `inset(0 ${clip}% 0 0)` }}
    />
  );
};

export const VerifiedBadge: React.FC<{ label?: string; scale?: number }> = ({ label = "ভেরিফাইড", scale = 1 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6 * scale, padding: `${4 * scale}px ${12 * scale}px ${4 * scale}px ${9 * scale}px`,
    borderRadius: 999, background: c.infoSurface }}>
    <Icon name="shield" size={16 * scale} color={c.info} stroke={2.4} />
    <span style={{ ...body(14 * scale, c.info, theme.weight.bold), lineHeight: 1.5 }}>{label}</span>
  </div>
);

export type CardData = {
  price: string; suffix?: string; title: string; location: string; beds: string; baths: string; area: string;
  intent: string; focusX: number; focusY: number;
};

/** Reconstruction of src/components/PropertyCard.tsx (grid variant). */
export const PropertyCard: React.FC<{ data: CardData; width: number; badge?: React.ReactNode; showBadge?: boolean; imageHeight?: number; scale?: number }> = ({
  data, width, badge, showBadge = true, imageHeight, scale = 1,
}) => {
  const s = scale;
  return (
    <div style={{ width, borderRadius: theme.radius.card * s, background: c.surface, overflow: "hidden",
      border: `1px solid ${c.divider}`, boxShadow: theme.shadow.card }}>
      <div style={{ position: "relative" }}>
        <Photo focusX={data.focusX} focusY={data.focusY} style={{ width: "100%", height: imageHeight ?? width * 0.66 }} />
        <div style={{ position: "absolute", top: 12 * s, left: 12 * s, right: 12 * s, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 * s, alignItems: "center" }}>
            {showBadge && (badge ?? <VerifiedBadge scale={s} />)}
            <div style={{ padding: `${3 * s}px ${11 * s}px`, borderRadius: 999, background: "rgba(255,255,255,0.94)",
              ...body(13 * s, c.ink, theme.weight.semiBold), lineHeight: 1.5 }}>{data.intent}</div>
          </div>
          <div style={{ width: 34 * s, height: 34 * s, borderRadius: 99, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="heart" size={17 * s} color={c.ink} />
          </div>
        </div>
      </div>
      <div style={{ padding: 16 * s, display: "flex", flexDirection: "column", gap: 2 * s }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 * s }}>
          <span style={{ ...display(23 * s, c.brandText, theme.weight.extraBold), paddingBlock: 0 }}>{data.price}</span>
          {data.suffix && <span style={body(14 * s, c.muted, 400)}>{data.suffix}</span>}
        </div>
        <div style={{ ...body(16 * s, c.ink, theme.weight.semiBold), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 * s }}>
          <Icon name="pin" size={14 * s} color={c.muted} />
          <span style={body(14 * s, c.muted, 400)}>{data.location}</span>
        </div>
        <div style={{ display: "flex", gap: 16 * s, marginTop: 8 * s, paddingTop: 10 * s, borderTop: `1px solid ${c.divider}` }}>
          {[["bed", data.beds], ["bath", data.baths], ["area", data.area]].map(([icon, v]) => (
            <div key={icon} style={{ display: "flex", alignItems: "center", gap: 6 * s }}>
              <Icon name={icon} size={15 * s} color={c.muted} />
              <span style={body(14 * s, c.muted, theme.weight.semiBold)}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CARDS: CardData[] = [
  { price: "৳ ৪.৮৫ কোটি", title: "স্কাইলাইন টেরেসসহ লাক্সারি পেন্টহাউস", location: "রোড ৯২, গুলশান-২, ঢাকা",
    beds: "৪ বেড", baths: "৫ বাথ", area: "৪,২০০ বর্গফুট", intent: "বিক্রির জন্য", focusX: 35, focusY: 40 },
  { price: "৳ ১.৭২ কোটি", title: "লেকভিউ ৩ বেডরুম অ্যাপার্টমেন্ট", location: "গুলশান-১, ঢাকা",
    beds: "৩ বেড", baths: "৩ বাথ", area: "১,৯৫০ বর্গফুট", intent: "বিক্রির জন্য", focusX: 70, focusY: 55 },
  { price: "৳ ৮৫,০০০", suffix: "/মাস", title: "কর্নার প্লট ফ্যামিলি অ্যাপার্টমেন্ট", location: "বারিধারা ডিওএইচএস, ঢাকা",
    beds: "৩ বেড", baths: "৪ বাথ", area: "২,৪০০ বর্গফুট", intent: "ভাড়ার জন্য", focusX: 92, focusY: 60 },
];
