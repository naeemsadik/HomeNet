import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Caret, Enter, useCue, useCueSpring, useTyped } from "../components/Motion";
import { Icon } from "../components/Icons";
import { body, BrowserFrame, CARDS, display, Logo, PropertyCard } from "../components/UI";
import { toBn } from "../lib";

const c = theme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const TABS = [
  { icon: "home", label: "বাড়ি", at: CUE.bari },
  { icon: "building", label: "ফ্ল্যাট", at: CUE.flat },
  { icon: "briefcase", label: "অফিস স্পেস", at: CUE.office },
];

const FILTERS = [
  { label: "বাজেট: ৳ ৫০ লাখ – ২ কোটি", at: CUE.budget },
  { label: "লোকেশন: গুলশান-২", at: CUE.location },
  { label: "৩+ বেড · পার্কিং · লিফট", at: CUE.pochondo },
];

const useActiveIndex = (cues: number[]) => {
  const frame = useCurrentFrame();
  const cue = useCue();
  return cues.reduce((acc, t, i) => (frame >= cue(t) - 2 ? i : acc), -1);
};

const Tabs: React.FC = () => {
  const active = useActiveIndex(TABS.map((t) => t.at));
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {TABS.map((t, i) => {
        const on = i === active;
        return (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 999,
            background: on ? c.ink : c.surface, border: `1px solid ${on ? c.ink : c.divider}`,
            transform: `scale(${on ? 1.04 : 1})` }}>
            <Icon name={t.icon} size={18} color={on ? c.onInk : c.muted} />
            <span style={{ ...body(17, on ? c.onInk : c.body, theme.weight.semiBold), lineHeight: 1.5 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const SearchBar: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const typed = useTyped("গুলশান-২, ঢাকা", CUE.smartSearch - 0.4, CUE.smartSearch + 0.4);
  const press = interpolate(frame, [cue(CUE.smartSearch + 0.45), cue(CUE.smartSearch + 0.55), cue(CUE.smartSearch + 0.75)], [1, 0.94, 1], clamp);
  const focus = frame >= cue(CUE.smartSearch - 0.5);
  return (
    <div style={{ display: "flex", gap: 12, height: 72 }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", borderRadius: 10, background: c.surface,
        border: `2px solid ${focus ? c.brand : c.divider}`, boxShadow: focus ? `0 0 0 5px ${c.brandSurface}` : "none" }}>
        <Icon name="search" size={24} color={c.muted} />
        {typed ? (
          <span style={{ ...body(22, c.ink, theme.weight.semiBold), lineHeight: 1.5 }}>{typed}<Caret color={c.brandText} height={26} /></span>
        ) : (
          <span style={{ ...body(20, c.subtle, 400), lineHeight: 1.5 }}>জোন, এলাকা বা মহল্লা খুঁজুন...</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 30px", borderRadius: 10, background: c.brand,
        transform: `scale(${press})` }}>
        <Icon name="search" size={22} color={c.onBrand} stroke={2.4} />
        <span style={{ ...body(21, c.onBrand, theme.weight.bold), lineHeight: 1.5 }}>খুঁজুন</span>
      </div>
    </div>
  );
};

const Filters: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Enter at={CUE.advancedFilter} dx={-20} dy={0} preset="snappy" blur={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: c.ink }}>
          <Icon name="sliders" size={18} color={c.onInk} />
          <span style={{ ...body(16, c.onInk, theme.weight.semiBold), lineHeight: 1.5 }}>অ্যাডভান্সড ফিল্টার</span>
        </div>
      </Enter>
      {FILTERS.map((f, i) => {
        const on = frame >= cue(f.at) - 2;
        return (
          <Enter key={f.label} at={CUE.advancedFilter + 0.12 * (i + 1)} dx={-20} dy={0} preset="snappy" blur={0}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 999,
              background: on ? c.brandSurface : c.surface, border: `1px solid ${on ? c.brandBorder : c.divider}`,
              transform: `scale(${on ? 1.03 : 1})` }}>
              {on && <Icon name="check" size={16} color={c.brandText} stroke={2.6} />}
              <span style={{ ...body(16, on ? c.brandText : c.body, theme.weight.semiBold), lineHeight: 1.5 }}>{f.label}</span>
            </div>
          </Enter>
        );
      })}
    </div>
  );
};

const Results: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const counts = [1240, 368, 142, 28];
  const step = [CUE.budget, CUE.location, CUE.pochondo].reduce((acc, t, i) => (frame >= cue(t) ? i + 1 : acc), 0);
  const match = useCueSpring(CUE.perfect, "bouncy");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Enter at={CUE.apniKi + 0.5} dy={16} blur={0}>
        <span style={{ ...body(19, c.ink, theme.weight.semiBold) }}>
          ঢাকায় <span style={{ color: c.brandText }}>{toBn(counts[step].toLocaleString("en-US"))}টি</span> প্রপার্টি পাওয়া গেছে
        </span>
      </Enter>
      <div style={{ display: "flex", gap: 20 }}>
        {CARDS.map((card, i) => (
          <Enter key={card.title} at={CUE.apniKi + 0.6 + i * 0.15} dy={50} preset="smooth">
            <div style={{ position: "relative", transform: i === 0 ? `translateY(${-10 * Math.min(match, 1)}px)` : undefined,
              borderRadius: 8, boxShadow: i === 0 ? `0 0 0 ${4 * Math.min(match, 1)}px ${c.brand}` : undefined }}>
              <PropertyCard data={card} width={312} imageHeight={168} scale={0.86} />
              {i === 0 && (
                <div style={{ position: "absolute", top: 128, right: 12, padding: "4px 14px", borderRadius: 999, background: c.ink,
                  opacity: Math.min(1, match), transform: `scale(${0.6 + 0.4 * Math.min(match, 1.1)})` }}>
                  <span style={{ ...body(15, c.onInk, theme.weight.bold), lineHeight: 1.5 }}>পারফেক্ট ম্যাচ</span>
                </div>
              )}
            </div>
          </Enter>
        ))}
      </div>
    </div>
  );
};

/** Left column: the spoken idea, in three short beats. */
const Narrative: React.FC = () => {
  const words = [
    { text: "স্বপ্নের বাড়ি", at: CUE.bari, exit: CUE.flat - 0.12 },
    { text: "ফ্ল্যাট", at: CUE.flat, exit: CUE.office - 0.1 },
    { text: "অফিস স্পেস", at: CUE.office, exit: CUE.smartSearch - 0.75 },
  ];
  return (
    <div style={{ position: "absolute", left: 120, top: 300, width: 600 }}>
      <Enter at={CUE.apniKi} exitAt={CUE.smartSearch - 0.75} dy={20}>
        <div style={body(34, c.muted, theme.weight.medium)}>আপনি কি খুঁজছেন</div>
      </Enter>
      <div style={{ position: "relative", height: 160 }}>
        {words.map((w) => (
          <div key={w.text} style={{ position: "absolute", top: 0, left: 0 }}>
            <Enter at={w.at} exitAt={w.exit} dy={50} preset="snappy">
              <div style={display(104, c.ink, theme.weight.bold)}>{w.text}</div>
            </Enter>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", top: 0, left: 0 }}>
        <Enter at={CUE.smartSearch} exitAt={CUE.budget - 0.45} dy={40} preset="bouncy">
          <div style={{ display: "inline-block", padding: "0 28px", borderRadius: 18, background: c.brandSurface }}>
            <span style={display(96, c.brandText, theme.weight.bold)}>স্মার্ট সার্চ</span>
          </div>
        </Enter>
        <Enter at={CUE.advancedFilter} exitAt={CUE.budget - 0.45} dy={30}>
          <div style={{ ...display(56, c.ink, theme.weight.semiBold), marginTop: 18 }}>+ অ্যাডভান্সড ফিল্টার</div>
        </Enter>
      </div>

      <div style={{ position: "absolute", top: -40, left: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {[["বাজেট", CUE.budget], ["লোকেশন", CUE.location], ["পছন্দ", CUE.pochondo]].map(([label, at]) => (
          <Enter key={label as string} at={at as number} dx={-40} dy={0} preset="snappy">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: c.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" size={28} color={c.onInk} stroke={3} />
              </div>
              <span style={display(76, c.ink, theme.weight.bold)}>{label}</span>
            </div>
          </Enter>
        ))}
        <Enter at={CUE.perfect} dy={30}>
          <div style={{ ...display(50, c.body, theme.weight.semiBold), marginTop: 18 }}>
            পারফেক্ট প্রপার্টি, <span style={{ color: c.brandText }}>নিমিষেই</span>
          </div>
        </Enter>
      </div>
    </div>
  );
};

export const Search: React.FC = () => {
  const enter = useCueSpring(CUE.apniKi - 0.2, "smooth");
  return (
    <AbsoluteFill>
      <Narrative />
      <div style={{ position: "absolute", left: 770, top: 150, opacity: Math.min(1, enter),
        transform: `translateX(${(1 - enter) * 120}px) rotateY(${(1 - enter) * -8}deg)`, transformOrigin: "left center" }}>
        <BrowserFrame url="homenetbd.com/buy" width={1040} height={790}>
          <div style={{ position: "absolute", inset: 0, padding: "18px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Logo variant="light" width={180} />
              <div style={{ display: "flex", gap: 26 }}>
                {["কিনুন", "ভাড়া", "বিক্রি করুন", "ভ্যালুয়েশন"].map((n) => (
                  <span key={n} style={{ ...body(16, c.body, theme.weight.semiBold) }}>{n}</span>
                ))}
              </div>
            </div>
            <Tabs />
            <SearchBar />
            <div style={{ height: 44 }}><Filters /></div>
            <Results />
          </div>
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
};
