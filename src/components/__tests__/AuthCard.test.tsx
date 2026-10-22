import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { AuthCard } from "@/components/AuthCard";
import { useLanguageStore } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => ({
  ArrowRight: () => "ArrowRight",
  Eye: () => "Eye",
  EyeOff: () => "EyeOff",
  Lock: () => "Lock",
  Mail: () => "Mail",
  User: () => "User",
  X: () => "X",
}));

jest.mock("@/components/GoogleSignInButton", () => ({
  GoogleSignInButton: () => null,
}));

describe("AuthCard Localization", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
  });

  afterEach(() => {
    useLanguageStore.getState().setLanguage("en");
  });

  it("renders English authentication labels by default", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<AuthCard initialMode="signin" />);
    });

    expect(container.textContent).toContain("Sign In");
    expect(container.textContent).toContain("Create Account");
    expect(container.textContent).toContain("Forgot password?");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("renders authentic Bengali terminology when language is bn", async () => {
    useLanguageStore.getState().setLanguage("bn");

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<AuthCard initialMode="signin" />);
    });

    expect(container.textContent).toContain("লগইন করুন");
    expect(container.textContent).toContain("নতুন অ্যাকাউন্ট তৈরি করুন");
    expect(container.textContent).toContain("পাসওয়ার্ড ভুলে গেছেন?");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
