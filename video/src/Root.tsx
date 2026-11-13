import React from "react";
import { Composition } from "remotion";
import { HomeNetPromo } from "./HomeNetPromo";
import { DURATION_IN_FRAMES, FPS } from "./timeline";
import "./fonts";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HomeNetPromo"
    component={HomeNetPromo}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
