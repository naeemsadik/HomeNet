import React from "react";
import { Composition, Still } from "remotion";
import { HomeNetPromo } from "./HomeNetPromo";
import { Thumbnail } from "./Thumbnail";
import { DURATION_IN_FRAMES, FPS } from "./timeline";
import "./fonts";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="HomeNetPromo"
    component={HomeNetPromo}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
  <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);
