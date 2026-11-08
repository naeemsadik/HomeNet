import { installFieldFocus } from "../fieldFocus";

/**
 * The focus state goes on the box a field draws, never as a ring on the bare
 * <input> inside it. jsdom reads inline styles through getComputedStyle,
 * which is all the box finder needs.
 */
describe("installFieldFocus", () => {
  beforeAll(() => installFieldFocus());
  afterEach(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    document.body.innerHTML = "";
  });

  const mount = (html: string) => {
    document.body.innerHTML = html;
    return document.querySelector("input, textarea") as HTMLElement;
  };
  const marked = () => document.querySelector("[data-field-focus]");
  // What react-native-web renders for a TextInput: no border, no fill of its own.
  const RN_INPUT = '<input style="border: 0 solid black; background-color: transparent" />';

  it("marks the bordered wrapper around an input, not the input", () => {
    const input = mount(
      `<div id="box" style="border: 1px solid rgba(11,26,23,0.12); border-radius: 12px"><span>@</span>${RN_INPUT}</div>`,
    );
    input.focus();
    expect(marked()?.id).toBe("box");
    expect(marked()?.getAttribute("data-field-focus")).toBe("border");
  });

  it("marks the input itself when it draws its own border", () => {
    const input = mount('<div><label>Title</label><input style="border: 1px solid #ccc; border-radius: 10px" /></div>');
    input.focus();
    expect(marked()).toBe(input);
  });

  it("marks a filled wrapper with no border as a fill", () => {
    const input = mount(`<div id="box" style="background-color: rgb(244, 246, 245)">${RN_INPUT}</div>`);
    input.focus();
    expect(marked()?.id).toBe("box");
    expect(marked()?.getAttribute("data-field-focus")).toBe("fill");
  });

  it("leaves checkboxes alone and clears the mark on blur", () => {
    const box = mount('<div style="border: 1px solid #ccc"><input type="checkbox" /></div>');
    box.focus();
    expect(marked()).toBeNull();

    const input = mount(`<div style="border: 1px solid #ccc">${RN_INPUT}</div>`);
    input.focus();
    expect(marked()).not.toBeNull();
    input.blur();
    expect(marked()).toBeNull();
  });

  it("keeps a red error border red while focused", () => {
    const input = mount(`<div id="box" style="border: 1px solid rgb(212, 24, 61)">${RN_INPUT}</div>`);
    input.focus();
    expect(marked()?.getAttribute("data-field-focus")).toBe("error");
  });

  it("clears the mark when the focused input is removed", async () => {
    const input = mount(`<div id="box" style="border: 1px solid #ccc">${RN_INPUT}</div>`);
    input.focus();
    input.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(marked()).toBeNull();
  });

  it("never draws an outline on the input itself", () => {
    const css = document.getElementById("homenet-field-focus")?.textContent ?? "";
    expect(css).toMatch(/input, textarea, select, \[contenteditable\] \{\s*outline: none !important/);
    expect(css).not.toMatch(/:focus-visible/);
  });
});
