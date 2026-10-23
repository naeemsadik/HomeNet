import { act } from "react";
// @ts-expect-error -- @types/react-dom is not a dependency; Jest loads the real module.
import { createRoot } from "react-dom/client";
import { installDomGuard } from "@/lib/domGuard";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** What Google Translate does to a text node: a <font> wrapper takes its place and the original is detached. */
function translate(textNode: Node) {
  const outer = document.createElement("font");
  const inner = document.createElement("font");
  inner.textContent = "অনুবাদ";
  outer.appendChild(inner);
  textNode.parentNode!.replaceChild(outer, textNode);
  return outer;
}

describe("the crash the guard prevents", () => {
  it("is what the browser does to a node that Translate has detached", () => {
    const parent = document.createElement("div");
    const text = document.createTextNode("6");
    parent.appendChild(text);
    translate(text);
    expect(text.parentNode).toBeNull();
    expect(() => parent.removeChild(text)).toThrow(/not a child of this node/);
  });
});

describe("installDomGuard", () => {
  let uninstall: () => void;
  beforeEach(() => {
    jest.spyOn(console, "debug").mockImplementation(() => {});   // the guard logs once in development
    uninstall = installDomGuard();
  });
  afterEach(() => {
    uninstall();
    jest.restoreAllMocks();
  });

  it("lets React remove a text node that Translate detached", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    const view = (show: boolean) => (
      <div>
        {show ? "hello" : null}
        <span>tail</span>
      </div>
    );

    await act(async () => root.render(view(true)));
    const textNode = container.firstElementChild!.firstChild!;
    expect(textNode.nodeType).toBe(Node.TEXT_NODE);
    translate(textNode);

    await act(async () => root.render(view(false)));   // React removes the detached text node
    expect(container.querySelector("span")!.textContent).toBe("tail");

    await act(async () => root.unmount());
  });

  it("lets React insert next to a text node that Translate detached", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    const view = (icon: boolean) => (
      <div>
        {icon ? <i /> : null}
        {"label"}
      </div>
    );

    await act(async () => root.render(view(false)));
    translate(container.firstElementChild!.firstChild!);

    await act(async () => root.render(view(true)));    // React inserts <i> before the detached text
    expect(container.querySelector("i")).not.toBeNull();

    await act(async () => root.unmount());
  });

  it("removes a node an outside script moved into a wrapper, from where it now is", () => {
    const parent = document.createElement("div");
    const wrapper = document.createElement("font");
    const text = document.createTextNode("x");
    parent.appendChild(wrapper);
    wrapper.appendChild(text);
    parent.removeChild(text);
    expect(text.parentNode).toBeNull();
  });

  it("inserts before the wrapper when the reference node was wrapped, and appends when it was detached", () => {
    const parent = document.createElement("div");
    const wrapper = document.createElement("font");
    const wrapped = document.createTextNode("wrapped");
    parent.appendChild(wrapper);
    wrapper.appendChild(wrapped);

    const a = document.createElement("a");
    parent.insertBefore(a, wrapped);
    expect(parent.firstChild).toBe(a);
    expect(a.nextSibling).toBe(wrapper);

    const b = document.createElement("b");
    parent.insertBefore(b, document.createTextNode("never attached"));
    expect(parent.lastChild).toBe(b);
  });

  it("leaves normal DOM calls alone", () => {
    const parent = document.createElement("div");
    const one = document.createElement("p");
    const two = document.createElement("p");
    parent.appendChild(two);
    parent.insertBefore(one, two);
    expect(Array.from(parent.children)).toEqual([one, two]);
    parent.removeChild(one);
    expect(Array.from(parent.children)).toEqual([two]);
    expect(() => parent.removeChild(document.createElement("p"))).not.toThrow();
  });

  it("is installed once and can be removed", () => {
    expect(installDomGuard()()).toBeUndefined();        // second install is a no-op
    uninstall();
    const parent = document.createElement("div");
    expect(() => parent.removeChild(document.createTextNode("x"))).toThrow(/not a child of this node/);
    uninstall = installDomGuard();                      // restore for afterEach
  });
});
