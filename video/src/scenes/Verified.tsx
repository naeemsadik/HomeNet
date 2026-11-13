import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CUE } from "../timeline";
import { Enter, useCue, useCueSpring, useProgress, Words } from "../components/Motion";
import { Icon } from "../components/Icons";
import { body, CARDS, display, PropertyCard, VerifiedBadge } from "../components/UI";

const c = theme.colors;

/** "Fake listings / hidden charges" — struck through on "শেষ". */
const Problem: React.FC<{ label: string; at: number }> = ({ label, at }) => {
  const strike = useProgress(CUE.shesh - 0.35, CUE.shesh + 0.1, theme.ease.out);
  return (
    <Enter at={at} exitAt={CUE.amader - 0.05} dy={50} preset="snappy">
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "16px 40px 16px 24px", borderRadius: 999,
        background: c.surface, border: `1px solid ${c.divider}`, boxShadow: theme.shadow.card }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: c.errorSurface, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={34} color={c.errorText} stroke={2.8} />
        </div>
        <span style={{ ...display(76, c.ink, theme.weight.bold), backgroundImage: `linear-gradient(${c.errorText}, ${c.errorText})`,
          backgroundRepeat: "no-repeat", backgroundPosition: "0 56%", backgroundSize: `${strike * 100}% 7px`,
          opacity: 1 - strike * 0.45 }}>{label}</span>
      </div>
    </Enter>
  );
};

const Node: React.FC<{ icon: string; label: string; dim?: boolean; at: number; accent?: boolean }> = ({ icon, label, dim, at, accent }) => (
  <Enter at={at} dy={30} preset="snappy">
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: dim ? 0.5 : 1 }}>
      <div style={{ width: 104, height: 104, borderRadius: 52, background: accent ? c.ink : c.surface, border: `1px solid ${c.divider}`,
        boxShadow: theme.shadow.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={46} color={accent ? c.onInk : c.body} />
      </div>
      <span style={body(24, c.body, theme.weight.semiBold)}>{label}</span>
    </div>
  </Enter>
);

const DirectContact: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const brokerOut = useProgress(CUE.middleman + 0.2, CUE.middleman + 0.7, theme.ease.out);
  const arc = useProgress(CUE.shorashori - 0.1, CUE.shorashori + 0.7, theme.ease.out);
  const pulse = (frame - cue(CUE.shorashori)) / 40;
  const lineIn = useCueSpring(CUE.pochonder + 0.5, "smooth");
  return (
    <div style={{ position: "relative", width: 720, height: 230 }}>
      {/* the straight line through the broker fades; a direct arc replaces it */}
      <div style={{ position: "absolute", left: 104, right: 104, top: 52, height: 3, background: c.divider, opacity: Math.min(1, lineIn) }} />
      <svg width={720} height={230} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d="M 104 40 C 260 -60, 460 -60, 616 40" fill="none" stroke={c.brand} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={760} strokeDashoffset={760 * (1 - arc)} />
        {arc > 0.98 && (
          <circle cx={104 + ((pulse % 1) * 512)} cy={40 - Math.sin((pulse % 1) * Math.PI) * 75} r={8} fill={c.brand} />
        )}
      </svg>
      <div style={{ position: "absolute", left: 0, top: 0 }}><Node icon="user" label="আপনি" at={CUE.pochonder + 0.3} accent /></div>
      <div style={{ position: "absolute", left: 308, top: 0, transform: `scale(${1 - brokerOut * 0.2})`, opacity: 1 - brokerOut * 0.65 }}>
        <Node icon="users" label="মিডেলম্যান" at={CUE.pochonder + 0.45} />
        <div style={{ position: "absolute", left: "50%", marginLeft: -30, top: 22, width: 60, height: 60, borderRadius: 30, background: c.errorText,
          display: "flex", alignItems: "center", justifyContent: "center", opacity: brokerOut, transform: `scale(${0.5 + brokerOut * 0.5})` }}>
          <Icon name="x" size={34} color={c.onInk} stroke={3} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 0, top: 0 }}><Node icon="home" label="মালিক" at={CUE.pochonder + 0.6} accent /></div>
    </div>
  );
};

const ContactPanel: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 720 }}>
    <Enter at={CUE.malik} dy={30}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: 22, borderRadius: 12, background: c.surface,
        border: `1px solid ${c.divider}`, boxShadow: theme.shadow.card }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: c.brandSurface, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={display(32, c.brandText, theme.weight.bold)}>তা</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={body(25, c.ink, theme.weight.bold)}>তানভীর রহমান</div>
          <div style={body(18, c.muted, theme.weight.medium)}>সরাসরি মালিক · ০% ব্রোকার কমিশন</div>
        </div>
        <VerifiedBadge scale={1.1} />
      </div>
    </Enter>
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <Enter at={CUE.phone} dy={24} preset="bouncy">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 76, borderRadius: 10, background: c.ink }}>
            <Icon name="phone" size={26} color={c.onInk} />
            <span style={body(24, c.onInk, theme.weight.bold)}>কল করুন</span>
          </div>
        </Enter>
      </div>
      <div style={{ flex: 1 }}>
        <Enter at={CUE.whatsapp} dy={24} preset="bouncy">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 76, borderRadius: 10, background: c.whatsapp }}>
            <Icon name="chat" size={26} color={c.onBrand} />
            <span style={body(24, c.onBrand, theme.weight.bold)}>হোয়াটসঅ্যাপ</span>
          </div>
        </Enter>
      </div>
    </div>
  </div>
);

export const Verified: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = useCue();
  const stamp = useCueSpring(CUE.verified, "bouncy");
  const burst = interpolate(frame, [cue(CUE.verified) - 3, cue(CUE.verified) + 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out,
  });
  return (
    <AbsoluteFill>
      {/* Beat 1: the old problems */}
      <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Problem label="ফেক লিস্টিং" at={CUE.fake} />
        <Problem label="হিডেন চার্জ" at={CUE.hidden} />
      </div>

      {/* Beat 2: the verified card */}
      <div style={{ position: "absolute", left: 200, top: 150 }}>
        <Enter at={CUE.amader} dy={80} scaleFrom={0.9} float={3}>
          <div style={{ position: "relative" }}>
            <PropertyCard data={CARDS[0]} width={600} imageHeight={360} scale={1.25} showBadge={false} />
            <div style={{ position: "absolute", top: 16, left: 16, transform: `scale(${Math.max(0, stamp)})`, transformOrigin: "left center", opacity: Math.min(1, stamp * 2) }}>
              <div style={{ position: "absolute", left: -10, top: -10, right: -10, bottom: -10, borderRadius: 999,
                border: `3px solid ${c.info}`, opacity: 1 - burst, transform: `scale(${1 + burst * 0.6})` }} />
              <VerifiedBadge label="ভেরিফাইড লিস্টিং" scale={1.5} />
            </div>
          </div>
        </Enter>
      </div>

      <div style={{ position: "absolute", left: 960, top: 300, width: 760 }}>
        <Enter at={CUE.verified} exitAt={CUE.pochonder} dy={40}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 96, height: 96, borderRadius: 24, background: c.infoSurface, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="shield" size={54} color={c.info} stroke={2.2} />
            </div>
            <span style={{ ...display(80, c.ink, theme.weight.bold), whiteSpace: "nowrap" }}>ভেরিফাইড লিস্টিং</span>
          </div>
          <div style={{ ...body(32, c.muted, theme.weight.medium), marginTop: 16 }}>প্রতিটি প্রপার্টি যাচাই করা, কোনো হিডেন চার্জ নেই</div>
        </Enter>
      </div>

      {/* Beat 3: direct contact, no middleman */}
      <div style={{ position: "absolute", left: 980, top: 200 }}>
        <DirectContact />
      </div>
      <div style={{ position: "absolute", left: 980, top: 470 }}>
        <ContactPanel />
      </div>

      {/* Beat 4: payoff line */}
      <div style={{ position: "absolute", top: 846, width: "100%", display: "flex", justifyContent: "center" }}>
        <Words text="একদম স্বচ্ছ আর ডিরেক্ট!" at={CUE.shocho} times={[CUE.shocho, 47.05, 47.4, 47.65]}
          style={display(78, c.ink, theme.weight.bold)}
          wordStyle={(i) => (i === 3 ? { color: c.brandText } : undefined)} />
      </div>
    </AbsoluteFill>
  );
};
