import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { CROSSFADE_FRAMES, CUE, SCENE_WINDOWS } from "./timeline";
import { DarkBg, Finish, LightBg, SceneFade } from "./components/Layers";
import { SceneClock } from "./components/Motion";
import { Pain } from "./scenes/Pain";
import { Reveal } from "./scenes/Reveal";
import { Search } from "./scenes/Search";
import { Verified } from "./scenes/Verified";
import { Sell } from "./scenes/Sell";
import { Moderation } from "./scenes/Moderation";
import { Vision } from "./scenes/Vision";
import { Web } from "./scenes/Web";
import { AppPromo } from "./scenes/AppPromo";
import { Outro } from "./scenes/Outro";

type SceneDef = { key: keyof typeof SCENE_WINDOWS; dark: boolean; Comp: React.FC };

const SCENES: SceneDef[] = [
  { key: "pain", dark: true, Comp: Pain },
  { key: "reveal", dark: true, Comp: Reveal },
  { key: "search", dark: false, Comp: Search },
  { key: "verified", dark: false, Comp: Verified },
  { key: "sell", dark: false, Comp: Sell },
  { key: "moderation", dark: true, Comp: Moderation },
  { key: "vision", dark: true, Comp: Vision },
  { key: "web", dark: false, Comp: Web },
  { key: "app", dark: false, Comp: AppPromo },
  { key: "outro", dark: true, Comp: Outro },
];

/** SFX land 3 frames before the visual they accent. */
const SFX: { at: number; file: string; volume: number }[] = [
  ...SCENES.slice(1).map((s) => ({ at: SCENE_WINDOWS[s.key][0], file: "whoosh-soft.wav", volume: 0.22 })),
  ...[CUE.basaBodol + 0.05, CUE.notunFlat, CUE.bikri].map((at) => ({ at, file: "pop.wav", volume: 0.22 })),
  ...[CUE.dalal, CUE.shothikDam].map((at) => ({ at, file: "whoosh.wav", volume: 0.16 })),
  { at: CUE.homenet, file: "hit.wav", volume: 0.5 },
  ...[CUE.bari, CUE.flat, CUE.office].map((at) => ({ at, file: "tick.wav", volume: 0.25 })),
  ...[CUE.budget, CUE.location, CUE.pochondo].map((at) => ({ at, file: "tick.wav", volume: 0.25 })),
  { at: CUE.perfect, file: "pop.wav", volume: 0.2 },
  { at: CUE.verified, file: "pop.wav", volume: 0.3 },
  ...[CUE.phone, CUE.whatsapp].map((at) => ({ at, file: "pop.wav", volume: 0.2 })),
  ...[CUE.step1, CUE.step2, CUE.step3, CUE.step4].map((at) => ({ at, file: "tick.wav", volume: 0.22 })),
  { at: CUE.ai, file: "pop.wav", volume: 0.22 },
  ...[CUE.jachai, CUE.jachai + 0.2, CUE.jachai + 0.4, CUE.jachai + 0.6].map((at) => ({ at, file: "tick.wav", volume: 0.2 })),
  { at: CUE.hundred, file: "whoosh.wav", volume: 0.14 },
  ...[CUE.digital, CUE.shocho2, CUE.jhamela].map((at) => ({ at, file: "tick.wav", volume: 0.22 })),
  { at: CUE.technology + 0.15, file: "whoosh.wav", volume: 0.16 },
  { at: CUE.urlBd + 0.45, file: "pop.wav", volume: 0.25 },
  { at: CUE.playStore, file: "pop.wav", volume: 0.22 },
  { at: CUE.app, file: "pop.wav", volume: 0.25 },
  { at: CUE.outroHomenet - 0.1, file: "hit.wav", volume: 0.55 },
];

export const HomeNetPromo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{ background: "#0B1A17" }}>
      {SCENES.map(({ key, dark, Comp }, i) => {
        const [start, end] = SCENE_WINDOWS[key];
        const isLast = i === SCENES.length - 1;
        const duration = isLast ? durationInFrames - f(start) : f(end) - f(start) + CROSSFADE_FRAMES;
        return (
          <Sequence key={key} from={f(start)} durationInFrames={duration} name={key}>
            <SceneClock.Provider value={start}>
              <SceneFade fadeIn={i > 0} frames={CROSSFADE_FRAMES}>
                {dark ? <DarkBg /> : <LightBg />}
                <Comp />
              </SceneFade>
            </SceneClock.Provider>
          </Sequence>
        );
      })}

      <Finish />

      {/* Voiceover is the master clock: the composition is exactly its length. */}
      <Audio src={staticFile("audio/voiceover.mp3")} />
      <Audio
        src={staticFile("sfx/pad.wav")}
        loop
        volume={(fr) =>
          interpolate(fr, [0, 45, durationInFrames - 60, durationInFrames], [0, 0.06, 0.06, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          })
        }
      />
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, f(s.at) - 3)} durationInFrames={f(2)} name={`sfx-${s.file}`}>
          <Audio src={staticFile(`sfx/${s.file}`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
