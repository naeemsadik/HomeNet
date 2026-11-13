// Synthesizes the small SFX kit used by the promo as 16-bit mono WAVs.
// Deterministic (seeded noise), zero downloads. Run: npm run sfx
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx");
mkdirSync(out, { recursive: true });

let seed = 1337;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296 * 2 - 1;
};

const writeWav = (name, samples) => {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32767, i * 2));
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(join(out, name), Buffer.concat([h, data]));
};

// Whoosh: band-swept noise with a rise-fall envelope.
const whoosh = (dur, peak) => {
  const n = Math.floor(SR * dur); const s = new Float32Array(n);
  let lp = 0, lp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 2);
    const cutoff = 0.02 + 0.25 * Math.sin(Math.PI * t);
    lp += cutoff * (rand() - lp); lp2 += cutoff * (lp - lp2);
    s[i] = (lp - lp2 * 0.6) * env * peak;
  }
  return s;
};

// Pop: short sine with pitch drop.
const pop = (f0, f1, dur, peak) => {
  const n = Math.floor(SR * dur); const s = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n; const f = f0 * Math.pow(f1 / f0, t);
    ph += 2 * Math.PI * f / SR;
    s[i] = Math.sin(ph) * Math.exp(-t * 6) * Math.min(1, i / 60) * peak;
  }
  return s;
};

// Soft sub hit for logo moments.
const hit = () => {
  const n = Math.floor(SR * 1.6); const s = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; const f = 48 + 60 * Math.exp(-t * 18);
    ph += 2 * Math.PI * f / SR;
    s[i] = (Math.sin(ph) * Math.exp(-t * 2.6) + rand() * 0.04 * Math.exp(-t * 30)) * 0.8 * Math.min(1, i / 40);
  }
  return s;
};

// Seamless 12s pad loop: every partial completes an integer number of cycles.
const pad = () => {
  const dur = 12; const n = SR * dur; const s = new Float32Array(n);
  const notes = [110, 165, 220, 277.5, 330];
  for (let i = 0; i < n; i++) {
    const t = i / SR; let v = 0;
    notes.forEach((f, k) => {
      const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * t / 6 + k);
      v += (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * (f + 0.25) * t)) * lfo / (k + 1.5);
    });
    s[i] = v * 0.16;
  }
  return s;
};

writeWav("whoosh.wav", whoosh(0.55, 2.4));
writeWav("whoosh-soft.wav", whoosh(0.8, 1.4));
writeWav("pop.wav", pop(900, 380, 0.14, 0.5));
writeWav("tick.wav", pop(2400, 1800, 0.05, 0.25));
writeWav("hit.wav", hit());
writeWav("pad.wav", pad());
console.log("sfx written to", out);
