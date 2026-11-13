import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { theme } from "./theme";

// Variable fonts: one file covers every weight from 100 to 900.
export const fontsReady = Promise.all([
  loadFont({
    family: theme.fonts.display,
    url: staticFile("fonts/AnekBangla.ttf"),
    weight: "100 800",
  }),
  loadFont({
    family: theme.fonts.body,
    url: staticFile("fonts/NotoSansBengali.ttf"),
    weight: "100 900",
  }),
]);
