/**
 * The `go_live_on_approval` part of a save request. Sent only when the owner
 * changed it on an edit: an unchanged value is not a request, and an API that
 * does not know the field would refuse the whole save.
 */
export function goLivePatch(
  mode: "create" | "edit",
  current: boolean,
  initial: boolean,
): { go_live_on_approval?: boolean } {
  return mode === "edit" && current !== initial ? { go_live_on_approval: current } : {};
}
