/**
 * Points git at the repo's own hooks folder (.githooks), so the pre-push
 * check runs for every person and every agent working in a clone.
 *
 * Runs on `npm install` (the "prepare" script). It never fails the install:
 * outside a git checkout (Vercel, EAS, CI caches) it quietly does nothing.
 */
const { execSync } = require("node:child_process");

try {
  execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
  let current = "";
  try {
    current = execSync("git config --get core.hooksPath", { encoding: "utf8" }).trim();
  } catch {
    // Not set yet.
  }
  // Never replace a hooks setup someone chose; say how to opt in instead.
  if (current && current !== ".githooks") {
    console.log(`git hooks: core.hooksPath is "${current}"; leaving it. Run "git config core.hooksPath .githooks" to use HomeNet's pre-push check.`);
  } else if (!current) {
    execSync("git config core.hooksPath .githooks", { stdio: "ignore" });
  }
} catch {
  // Not a git checkout, or git is not installed: nothing to set up.
}
