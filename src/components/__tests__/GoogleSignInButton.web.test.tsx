import type * as React from "react";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const CLIENT_ID = "63352692878-eb3rpke5sn8ojmq2svkfpjrq3pgnpbjm.apps.googleusercontent.com";

type Config = { callback: (r: { credential?: string }) => void; client_id: string };
type ButtonProps = { mode: "signin" | "signup"; onCredential: (t: string) => void };

// The component keeps Google's script and initialize() state at module level
// (that is the point of it), so every test loads a fresh copy. React and
// react-dom load in the same isolated registry: two copies of React in one tree
// would leave hooks without a dispatcher.
function setup() {
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = CLIENT_ID;
  const initialize: Config[] = [];
  const rendered: { text: string; width: number }[] = [];
  let appended = 0;

  const api = {
    initialize: jest.fn((config: Config) => initialize.push(config)),
    renderButton: jest.fn((parent: HTMLElement, options: { text: string; width: number }) => {
      rendered.push(options);
      parent.appendChild(document.createElement("button"));
    }),
  };

  /** Makes appended <script> tags load (or fail) the way the real one would. */
  const answerScript = (outcome: "load" | "error") => {
    jest.spyOn(document.head, "appendChild").mockImplementation(((node: Node) => {
      appended += 1;
      const script = node as HTMLScriptElement;
      setTimeout(() => {
        if (outcome === "load") {
          window.google = { accounts: { id: api as never } };
          script.onload?.(new Event("load"));
        } else {
          script.onerror?.(new Event("error") as never);
        }
      }, 0);
      return node;
    }) as never);
  };

  let Button!: (props: ButtonProps & { disabled?: boolean }) => React.ReactElement | null;
  let createElement!: typeof React.createElement;
  let act!: (callback: () => Promise<unknown>) => Promise<void>;
  let createRoot!: (container: Element) => { render: (node: React.ReactNode) => void; unmount: () => void };
  jest.isolateModules(() => {
    const react = require("react");
    createElement = react.createElement;
    act = react.act;
    createRoot = require("react-dom/client").createRoot;
    Button = require("@/components/GoogleSignInButton.web").GoogleSignInButton;
  });

  const mount = async (props: ButtonProps & { disabled?: boolean }) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(createElement(Button, props)));
    return {
      container,
      unmount: () => act(async () => root.unmount()),
    };
  };

  /** Lets timers and promises settle. */
  const settle = () =>
    act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

  return { initialize, rendered, api, scriptsAppended: () => appended, answerScript, mount, settle };
}

afterEach(() => {
  jest.restoreAllMocks();
  delete window.google;
  delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  document.body.replaceChildren();
});

describe("GoogleSignInButton (web)", () => {
  it("loads Google's script and draws Google's own button", async () => {
    const t = setup();
    t.answerScript("load");

    const view = await t.mount({ mode: "signin", onCredential: () => undefined });
    await t.settle();

    expect(t.api.renderButton).toHaveBeenCalledTimes(1);
    expect(t.rendered[0].text).toBe("signin_with");
    expect(t.rendered[0].width).toBeGreaterThanOrEqual(200);
    expect(t.rendered[0].width).toBeLessThanOrEqual(400);
    expect(t.initialize).toHaveLength(1);
    expect(t.initialize[0].client_id).toBe(CLIENT_ID);
    expect(t.scriptsAppended()).toBe(1);
    expect(view.container.querySelector("button")).not.toBeNull();
  });

  it("words the button for sign-up in the sign-up form", async () => {
    const t = setup();
    t.answerScript("load");

    await t.mount({ mode: "signup", onCredential: () => undefined });
    await t.settle();

    expect(t.rendered[0].text).toBe("signup_with");
  });

  it("hands the credential Google returns to the current form, and ignores an empty one", async () => {
    const t = setup();
    t.answerScript("load");
    const onCredential = jest.fn();

    await t.mount({ mode: "signin", onCredential });
    await t.settle();

    t.initialize[0].callback({ credential: "a.b.c" });
    expect(onCredential).toHaveBeenCalledWith("a.b.c");

    t.initialize[0].callback({});
    expect(onCredential).toHaveBeenCalledTimes(1);
  });

  it("initializes Google once, even when the form is opened and closed again", async () => {
    const t = setup();
    t.answerScript("load");

    const first = await t.mount({ mode: "signin", onCredential: () => undefined });
    await t.settle();
    await first.unmount();

    const onCredential = jest.fn();
    await t.mount({ mode: "signin", onCredential });
    await t.settle();

    expect(t.api.renderButton).toHaveBeenCalledTimes(2);
    expect(t.initialize).toHaveLength(1);
    expect(t.scriptsAppended()).toBe(1);
    t.initialize[0].callback({ credential: "x.y.z" });
    expect(onCredential).toHaveBeenCalledWith("x.y.z");
  });

  it("does not deliver a credential to a form that has been closed", async () => {
    const t = setup();
    t.answerScript("load");
    const onCredential = jest.fn();

    const view = await t.mount({ mode: "signin", onCredential });
    await t.settle();
    await view.unmount();

    t.initialize[0].callback({ credential: "late.token.x" });
    expect(onCredential).not.toHaveBeenCalled();
  });

  it("draws nothing, and does not throw, when Google's script cannot be loaded", async () => {
    const t = setup();
    t.answerScript("error");

    const view = await t.mount({ mode: "signin", onCredential: () => undefined });
    await t.settle();

    expect(t.scriptsAppended()).toBe(1);
    expect(t.api.renderButton).not.toHaveBeenCalled();
    expect(view.container.querySelector("button")).toBeNull();
  });

  it("tries again after a failed load", async () => {
    const t = setup();
    t.answerScript("error");

    const first = await t.mount({ mode: "signin", onCredential: () => undefined });
    await t.settle();
    await first.unmount();

    jest.restoreAllMocks();
    t.answerScript("load");
    await t.mount({ mode: "signin", onCredential: () => undefined });
    await t.settle();

    expect(t.api.renderButton).toHaveBeenCalledTimes(1);
  });

  it("dims and blocks the button while a sign-in is in progress", async () => {
    const t = setup();
    t.answerScript("load");

    const view = await t.mount({ mode: "signin", onCredential: () => undefined, disabled: true });
    const slot = view.container.querySelector<HTMLElement>('[data-testid="google-sign-in"]');

    expect(slot?.style.pointerEvents).toBe("none");
    expect(slot?.style.opacity).toBe("0.5");
  });
});
