/**
 * Keeps React running when something outside React rewrites the page.
 *
 * Google Translate (the Bangla toggle) replaces each text node with its own
 * <font> wrappers, leaving the nodes React created detached: 70 of 85 on the
 * Browse page. When React later removes one of them, or inserts something
 * next to one, the browser throws
 *
 *   Failed to execute 'removeChild' on 'Node': The node to be removed is not
 *   a child of this node.
 *
 * and in production that error unmounts the whole app. Browser translation
 * and some extensions do the same thing.
 *
 * The two DOM calls React makes are made tolerant of it:
 * - removeChild: a detached node is already gone; a node that was moved
 *   somewhere else is removed from where it now is.
 * - insertBefore: if the reference node was detached or wrapped, insert
 *   before the wrapper, or append when there is none.
 *
 * Call installDomGuard() once, before React renders (app/_layout.tsx).
 */

type Guarded = Node & { __homenetDomGuard?: true };

let reportedOnce = false;
function report(what: string) {
  if (!__DEV__ || reportedOnce) return;
  reportedOnce = true;
  // debug, not warn: the guard is working, not failing. Logged once.
  console.debug(`[domGuard] ${what}. An outside script (Google Translate?) changed the page under React.`);
}

/** Installs the guard. Returns a function that removes it again (used by tests). */
export function installDomGuard(): () => void {
  if (typeof Node !== "function" || !Node.prototype) return () => {};

  const proto = Node.prototype as Guarded;
  if (proto.__homenetDomGuard) return () => {};

  const originalRemoveChild = proto.removeChild;
  const originalInsertBefore = proto.insertBefore;

  proto.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child && child.parentNode !== this) {
      report("ignored removeChild of a node that is no longer in its parent");
      return child.parentNode ? (originalRemoveChild.call(child.parentNode, child) as T) : child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  proto.insertBefore = function insertBefore<T extends Node>(this: Node, node: T, reference: Node | null): T {
    if (reference && reference.parentNode !== this) {
      report("redirected insertBefore whose reference node is no longer in its parent");
      let anchor: Node | null = reference.parentNode;
      while (anchor && anchor.parentNode !== this) anchor = anchor.parentNode;
      return originalInsertBefore.call(this, node, anchor) as T;
    }
    return originalInsertBefore.call(this, node, reference) as T;
  };

  proto.__homenetDomGuard = true;

  return () => {
    proto.removeChild = originalRemoveChild;
    proto.insertBefore = originalInsertBefore;
    delete proto.__homenetDomGuard;
  };
}
