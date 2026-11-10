/**
 * One focus state for every text field on the web, drawn on the field's box.
 *
 * Most HomeNet fields draw their border or fill on a wrapper View around the
 * input (an icon, the input, a clear button). The old global CSS put a 2px
 * outline on the bare <input>, so focusing one drew a square ring inside the
 * rounded box, or a clipped one where the wrapper hides overflow: the login
 * modal, the hero search, the profile fields, everywhere.
 *
 * Now the input itself never shows an outline. On focus, the nearest element
 * that actually draws the field (the input when it has its own border,
 * otherwise the wrapper that has the border or fill) gets data-field-focus,
 * and the CSS below gives that box a 2px border in the focus colour. The
 * ring follows the box's own radius, sits inside it (so overflow: hidden on
 * a parent cannot clip it) and does not change the layout.
 *
 * It finds the box from computed styles, so new fields get it without any
 * change. Native platforms have no outline and are untouched.
 *
 * Call installFieldFocus() once, before React renders (app/_layout.tsx).
 */
import { colorTokens } from "@/theme";

// primaryOnLight passes 3:1 against white and the field fills (WCAG 1.4.11
// for a focus indicator); the brand green #04cf92 is 2.03:1 and does not.
const FOCUS = colorTokens.primaryOnLight;

/** The global rules. Also inlined in app/+html.tsx so the first paint matches. */
export const FIELD_FOCUS_CSS = `
input, textarea, select, [contenteditable] {
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
}
[data-field-focus="border"] {
  border-color: ${FOCUS} !important;
  box-shadow: inset 0 0 0 1px ${FOCUS} !important;
}
[data-field-focus="fill"] {
  box-shadow: inset 0 0 0 2px ${FOCUS} !important;
}
[data-field-focus="error"] {
  box-shadow: inset 0 0 0 1px var(--field-error-color) !important;
}
`;

const NOT_TEXT = /^(checkbox|radio|range|color|file|submit|button|reset|image|hidden)$/;
const MAX_CLIMB = 3;

const isVisible = (color: string) => color !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(color);

/** A border that is already saying "error" (red): focus thickens it instead of turning it green. */
const isErrorColor = (color: string) => {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return Boolean(m && Number(m[1]) > 170 && Number(m[2]) < 90 && Number(m[3]) < 110);
};

type Kind = "border" | "fill" | "error";

/** The element that draws the field: the input, or a wrapper close around it. */
function fieldBox(input: HTMLElement): { el: HTMLElement; kind: Kind; color?: string } {
  const inputHeight = input.getBoundingClientRect().height;
  let node: HTMLElement | null = input;
  for (let depth = 0; node && depth <= MAX_CLIMB; depth++) {
    // Stop before climbing into a card or form group that merely contains the field.
    if (depth > 0 && node.getBoundingClientRect().height > inputHeight * 2 + 24) break;
    const style = getComputedStyle(node);
    const hasBorder =
      parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== "none" && isVisible(style.borderTopColor);
    if (hasBorder) {
      return isErrorColor(style.borderTopColor)
        ? { el: node, kind: "error", color: style.borderTopColor }
        : { el: node, kind: "border" };
    }
    if (isVisible(style.backgroundColor)) return { el: node, kind: "fill" };
    node = node.parentElement;
  }
  return { el: input, kind: "fill" };
}

let installed = false;
export const STYLE_ID = "homenet-field-focus";

export function installFieldFocus() {
  if (installed || typeof document === "undefined") return;
  installed = true;

  // Exported pages already carry these rules from app/+html.tsx under this id.
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = FIELD_FOCUS_CSS;
    document.head.appendChild(style);
  }

  let marked: HTMLElement | null = null;
  let watcher: MutationObserver | null = null;
  const clear = () => {
    watcher?.disconnect();
    watcher = null;
    marked?.removeAttribute("data-field-focus");
    marked?.style.removeProperty("--field-error-color");
    marked = null;
  };

  document.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("input, textarea, select, [contenteditable]")) return;
    if (target instanceof HTMLInputElement && NOT_TEXT.test(target.type)) return;
    clear();
    const box = fieldBox(target);
    box.el.setAttribute("data-field-focus", box.kind);
    if (box.color) box.el.style.setProperty("--field-error-color", box.color);
    marked = box.el;
    // Removing a focused input fires no focusout in some browsers; clear then too.
    if (box.el !== target && typeof MutationObserver !== "undefined") {
      watcher = new MutationObserver(() => {
        if (!target.isConnected) clear();
      });
      watcher.observe(box.el, { childList: true, subtree: true });
    }
  });
  document.addEventListener("focusout", clear);
}
