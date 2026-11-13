/**
 * Voiceover timing map (seconds) for public/audio/voiceover.mp3.
 *
 * Derived from the audio itself: `ffmpeg -af silencedetect=noise=-32dB:d=0.18`
 * gives every pause; each speech island between pauses was matched to its
 * script clause (see README). Word cues inside a clause are interpolated by
 * syllable count across the island. Visuals start LEAD frames before a cue so
 * the motion lands on the word, not after it.
 */
export const FPS = 30;
export const AUDIO_SECONDS = 99.082438;
export const DURATION_IN_FRAMES = Math.ceil(AUDIO_SECONDS * FPS);
export const LEAD_FRAMES = 4;

export const CUE = {
  // ¶1 Empathetic
  basaBodol: 0.1, notunFlat: 0.95, bikri: 1.95,
  kothagulo: 4.38, tension: 6.4, douradouri: 7.0, taiTo: 7.85,
  dalal: 8.67, shothikDam: 10.2, tara: 11.84,
  // ¶2 Excited
  tobeEbar: 13.75, biday: 16.0, homenet: 17.55, tagline: 18.36, smartProptech: 19.9,
  // ¶3 Friendly
  apniKi: 22.13, bari: 23.5, flat: 24.0, office: 24.4,
  smartSearch: 26.37, advancedFilter: 27.04,
  budget: 29.38, location: 29.8, pochondo: 30.4, perfect: 31.46, nimishei: 33.2,
  // ¶4 Reassuring
  fake: 34.11, hidden: 35.0, shesh: 36.5,
  amader: 37.12, verified: 38.8,
  pochonder: 40.25, middleman: 41.93, shorashori: 42.9, malik: 43.9, phone: 45.43, whatsapp: 45.75,
  shocho: 46.65,
  // ¶5 Encouraging
  sellQ: 48.93, sellWord: 50.0, rentWord: 50.6,
  steps: 51.85, step1: 52.7, step2: 53.3, step3: 53.9, step4: 54.5, listingDone: 55.2,
  damNiye: 55.8, ai: 57.9, valuation: 58.5, bazardor: 60.65,
  // ¶6 Proud
  shudhu: 62.5, moderation: 64.6, jachai: 66.5, seller: 67.65, buyer: 68.3,
  hundred: 69.6, genuine: 70.5, secured: 71.2,
  // ¶7 Inspirational
  kenaBecha: 73.02, digital: 75.9, shocho2: 76.6, jhamela: 77.3, vision: 78.5,
  technology: 79.44, realEstate: 80.6, haterMuthoy: 82.1,
  // ¶8 Energetic
  deri: 83.08, duniya: 84.25, visit: 86.43, urlHomenet: 87.45, urlCom: 88.0, urlBd: 88.4,
  // ¶9 Warm
  arHa: 89.28, update: 89.99, playStore: 92.92, download: 93.98, app: 94.9,
  // ¶10 Corporate
  outroHomenet: 95.94, smartProperty: 96.74, smartSolution: 97.85,
} as const;

/** Scene windows in seconds; each one cross-dissolves into the next. */
export const SCENE_WINDOWS = {
  pain: [0, 13.55],
  reveal: [13.55, 21.95],
  search: [21.95, 33.95],
  verified: [33.95, 48.75],
  sell: [48.75, 62.35],
  moderation: [62.35, 72.85],
  vision: [72.85, 82.9],
  web: [82.9, 89.1],
  app: [89.1, 95.75],
  outro: [95.75, AUDIO_SECONDS],
} as const;

export const CROSSFADE_FRAMES = 10;
