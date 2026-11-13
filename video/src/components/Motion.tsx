import React, { createContext, useContext } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { LEAD_FRAMES } from "../timeline";

type SpringPreset = keyof typeof theme.spring;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Scene start in absolute seconds, so components can take voiceover cues directly. */
export const SceneClock = createContext(0);

/** Frame (relative to the current scene) at which an absolute cue lands. */
export const useCue = () => {
  const start = useContext(SceneClock);
  const { fps } = useVideoConfig();
  return (cueSeconds: number) => Math.round((cueSeconds - start) * fps);
};

/** 0→1 spring that settles on the cue (starts LEAD frames early). */
export const useCueSpring = (cueSeconds: number, preset: SpringPreset = "smooth") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = useCue();
  return spring({ frame: frame - (cue(cueSeconds) - LEAD_FRAMES), fps, config: theme.spring[preset] });
};

/** 1→0 fast exit starting at the cue (10 frames, ease-in). */
export const useExit = (cueSeconds?: number, frames = 10) => {
  const frame = useCurrentFrame();
  const cue = useCue();
  if (cueSeconds === undefined) return 0;
  const at = cue(cueSeconds) - frames;
  return interpolate(frame, [at, at + frames], [0, 1], { ...clamp, easing: theme.ease.in });
};

/** Eased 0→1 progress between two absolute cues. */
export const useProgress = (fromSeconds: number, toSeconds: number, easing = theme.ease.inOut) => {
  const frame = useCurrentFrame();
  const cue = useCue();
  return interpolate(frame, [cue(fromSeconds), cue(toSeconds)], [0, 1], { ...clamp, easing });
};

export const useBreathe = (period = 30, amount = 4, phase = 0) => {
  const frame = useCurrentFrame();
  return Math.sin(frame / period + phase) * amount;
};

type EnterProps = {
  at: number;
  exitAt?: number;
  dx?: number;
  dy?: number;
  scaleFrom?: number;
  blur?: number;
  preset?: SpringPreset;
  float?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/** Premium entrance: opacity + translate + scale + de-blur, with a faster exit. */
export const Enter: React.FC<EnterProps> = ({
  at, exitAt, dx = 0, dy = 40, scaleFrom = 0.94, blur = 8, preset = "smooth", float = 0, style, children,
}) => {
  const p = useCueSpring(at, preset);
  const out = useExit(exitAt);
  const bob = useBreathe(34, float, at);
  const visible = Math.min(1, p) * (1 - out);
  return (
    <div
      style={{
        opacity: visible,
        transform: `translate(${interpolate(p, [0, 1], [dx, 0])}px, ${interpolate(p, [0, 1], [dy, 0]) - out * 30 + bob}px) scale(${interpolate(p, [0, 1], [scaleFrom, 1]) + out * 0.03})`,
        filter: blur ? `blur(${interpolate(p, [0, 1], [blur, 0], clamp) + out * 6}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

type WordsProps = {
  text: string;
  at: number;
  per?: number;
  exitAt?: number;
  /** Optional absolute cue per word, overriding the uniform stagger. */
  times?: number[];
  style?: React.CSSProperties;
  wordStyle?: (index: number, word: string) => React.CSSProperties | undefined;
};

/** Word-by-word reveal. Words are never masked, so Bengali glyphs cannot clip. */
export const Words: React.FC<WordsProps> = ({ text, at, per = 3, exitAt, times, style, wordStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = useCue();
  const out = useExit(exitAt);
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.28em", ...style, opacity: 1 - out }}>
      {words.map((word, i) => {
        const start = times?.[i] !== undefined ? cue(times[i]) : cue(at) + i * per;
        const p = spring({ frame: frame - (start - LEAD_FRAMES), fps, config: theme.spring.snappy });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p),
              transform: `translateY(${interpolate(p, [0, 1], [34, 0]) - out * 24}px)`,
              filter: `blur(${interpolate(p, [0, 1], [6, 0], clamp)}px)`,
              ...wordStyle?.(i, word),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Characters typed one by one between two cues; returns the visible substring. */
export const useTyped = (text: string, fromSeconds: number, toSeconds: number) => {
  const frame = useCurrentFrame();
  const cue = useCue();
  // Split by grapheme so Bangla vowel signs stay attached to their consonant.
  const graphemes = Array.from(new Intl.Segmenter("bn", { granularity: "grapheme" }).segment(text), (s) => s.segment);
  const n = Math.round(
    interpolate(frame, [cue(fromSeconds), cue(toSeconds)], [0, graphemes.length], { ...clamp, easing: theme.ease.out }),
  );
  return graphemes.slice(0, n).join("");
};

export const Caret: React.FC<{ color: string; height: number }> = ({ color, height }) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block", width: 3, height, marginLeft: 4, background: color,
        opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.15, verticalAlign: "middle", borderRadius: 2,
      }}
    />
  );
};
