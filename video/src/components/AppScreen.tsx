import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Icon } from "./Icons";
import { body, CARDS, Logo, PropertyCard } from "./UI";

const c = theme.colors;

/** HomeNet mobile app home: header, search, verified listings feed (slowly scrolling). */
export const AppScreen: React.FC<{ width: number }> = ({ width }) => {
  const frame = useCurrentFrame();
  const inner = width - 28;
  const scroll = Math.min(frame * 0.5, 140);
  return (
    <div style={{ position: "absolute", inset: 0, background: c.canvas, display: "flex", flexDirection: "column" }}>
      <div style={{ paddingTop: 54, paddingInline: 14, paddingBottom: 12, background: c.surface, borderBottom: `1px solid ${c.divider}`, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo variant="light" width={inner * 0.5} />
          <Icon name="bell" size={22} color={c.ink} />
        </div>
        <div style={{ height: 44, borderRadius: 10, background: c.surfaceSunken, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
          <Icon name="search" size={18} color={c.muted} />
          <span style={{ ...body(14, c.subtle, 400), lineHeight: 1.4 }}>এলাকা, প্রপার্টি খুঁজুন</span>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", padding: 14 }}>
        <div style={{ transform: `translateY(${-scroll}px)`, display: "flex", flexDirection: "column", gap: 14 }}>
          {CARDS.map((card) => (
            <PropertyCard key={card.title} data={card} width={inner} imageHeight={inner * 0.55} scale={0.8} />
          ))}
        </div>
      </div>
    </div>
  );
};
