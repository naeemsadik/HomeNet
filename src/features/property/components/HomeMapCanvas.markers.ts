import type { HomeMapMarker } from "./HomeMapCanvas.types";

/** The price pins and cluster bubbles, shared by the website's map and the app's (which runs the same Leaflet in a WebView). */
export const MARKER_CSS = `
.hn-price-wrap { background: transparent; border: none; }
.hn-price {
  display: inline-flex; align-items: center; gap: 5px;
  font: 700 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 5px 9px; border-radius: 9999px; white-space: nowrap; cursor: pointer;
  box-shadow: 0 2px 7px rgba(15, 23, 42, 0.28);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  transform: translate(-50%, -50%);
  user-select: none; -webkit-tap-highlight-color: transparent;
}
.hn-price.sale { background: #0F172A; color: #FFFFFF; border: 1.5px solid #1E293B; }
.hn-price.rent { background: #059669; color: #FFFFFF; border: 1.5px solid #047857; }
.hn-price.neutral { background: #334155; color: #F8FAFC; border: 1.5px solid #475569; }
.hn-price .hn-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.hn-price.sale .hn-dot { background: #38BDF8; }
.hn-price.rent .hn-dot { background: #6EE7B7; }
.hn-price.neutral .hn-dot { background: #94A3B8; }
.hn-price:hover { transform: translate(-50%, -50%) translateY(-2px) scale(1.06); }
.hn-price.active {
  transform: translate(-50%, -50%) scale(1.14);
  box-shadow: 0 0 0 3px #10B981, 0 8px 22px rgba(15, 23, 42, 0.38);
}
.hn-cluster { background: rgba(15, 23, 42, 0.14); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.hn-cluster > div {
  width: 32px; height: 32px; border-radius: 50%; background: #0F172A; color: #FFFFFF;
  border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center;
  font: 700 11.5px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.25);
}
`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function markerHtml(item: HomeMapMarker, active: boolean): string {
  return (
    `<div class="hn-price ${item.variant}${active ? " active" : ""}">` +
    `<span class="hn-dot"></span><span>${escapeHtml(item.label)}</span></div>`
  );
}
