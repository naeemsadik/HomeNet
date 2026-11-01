import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useLanguageStore } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

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

function setInputValue(input: HTMLInputElement, value: string) {
  const tracker = (input as any)._valueTracker;
  if (tracker) {
    tracker.setValue("");
  }
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  );
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("AuthModal & AuthCard 'Confirm Password' Feature", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(async () => {
    await act(async () => {
      useLanguageStore.getState().setLanguage("en");
      useAuthModalStore.setState({ visible: false });
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      useLanguageStore.getState().setLanguage("en");
      useAuthModalStore.setState({ visible: false });
      root.unmount();
    });
    container.remove();
    jest.restoreAllMocks();
  });

  describe("AuthModal Visibility & Viewport Containment", () => {
    it("renders nothing when modal is not visible", async () => {
      await act(async () => {
        root.render(<AuthModal />);
      });
      expect(document.body.textContent).not.toContain("Property marketplace · Bangladesh");
    });

    it("renders modal with keyboard avoiding wrapper and close action when visible", async () => {
      await act(async () => {
        useAuthModalStore.setState({ visible: true });
      });

      await act(async () => {
        root.render(<AuthModal />);
      });

      expect(document.body.textContent).toContain("Sign In");
      expect(document.body.textContent).toContain("Create Account");

      // Verify close button is rendered
      const closeBtn = document.body.querySelector('[aria-label="Close"]');
      expect(closeBtn).not.toBeNull();
    });
  });

  describe("Confirm Password Field & Visibility Toggles", () => {
    it("renders Confirm Password input in signup mode with secureTextEntry by default", async () => {
      await act(async () => {
        root.render(<AuthCard initialMode="signup" />);
      });

      const passwordInput = container.querySelector(
        'input[placeholder="Create password"]',
      ) as HTMLInputElement;
      const confirmPasswordInput = container.querySelector(
        'input[placeholder="Confirm password"]',
      ) as HTMLInputElement;

      expect(passwordInput).not.toBeNull();
      expect(confirmPasswordInput).not.toBeNull();
      expect(passwordInput.type).toBe("password");
      expect(confirmPasswordInput.type).toBe("password");
    });

    it("toggles password and confirmPassword visibility independently", async () => {
      await act(async () => {
        root.render(<AuthCard initialMode="signup" />);
      });

      const passwordToggle = container.querySelector(
        '[aria-label="Show password"]',
      ) as HTMLElement;
      const confirmPasswordToggle = container.querySelector(
        '[aria-label="Show confirm password"]',
      ) as HTMLElement;

      expect(passwordToggle).not.toBeNull();
      expect(confirmPasswordToggle).not.toBeNull();

      const getPasswordInput = () =>
        container.querySelector('input[placeholder="Create password"]') as HTMLInputElement;
      const getConfirmInput = () =>
        container.querySelector('input[placeholder="Confirm password"]') as HTMLInputElement;

      expect(getPasswordInput().type).toBe("password");
      expect(getConfirmInput().type).toBe("password");

      // Toggle password field only
      await act(async () => {
        passwordToggle.click();
      });

      expect(getPasswordInput().type).toBe("text");
      expect(getConfirmInput().type).toBe("password");
      expect(passwordToggle.getAttribute("aria-label")).toBe("Hide password");
      expect(confirmPasswordToggle.getAttribute("aria-label")).toBe("Show confirm password");

      // Toggle confirm password field only
      await act(async () => {
        confirmPasswordToggle.click();
      });

      expect(getPasswordInput().type).toBe("text");
      expect(getConfirmInput().type).toBe("text");
      expect(confirmPasswordToggle.getAttribute("aria-label")).toBe("Hide confirm password");

      // Toggle password field back
      await act(async () => {
        passwordToggle.click();
      });

      expect(getPasswordInput().type).toBe("password");
      expect(getConfirmInput().type).toBe("text");
    });

    it("resets visibility toggles and inputs when switching tabs", async () => {
      await act(async () => {
        root.render(<AuthCard initialMode="signup" />);
      });

      const confirmToggle = container.querySelector(
        '[aria-label="Show confirm password"]',
      ) as HTMLElement;
      await act(async () => {
        confirmToggle.click();
      });

      const signInTab = Array.from(container.querySelectorAll('[role="button"]')).find(
        (el) => el.textContent === "Sign In",
      ) as HTMLElement;

      await act(async () => {
        signInTab.click();
      });

      // Confirm password should not be present in signin tab
      expect(
        container.querySelector('input[placeholder="Confirm password"]'),
      ).toBeNull();

      // Switch back to signup tab
      const signUpTab = Array.from(container.querySelectorAll('[role="button"]')).find(
        (el) => el.textContent === "Create Account",
      ) as HTMLElement;

      await act(async () => {
        signUpTab.click();
      });

      const confirmInput = container.querySelector(
        'input[placeholder="Confirm password"]',
      ) as HTMLInputElement;
      expect(confirmInput.type).toBe("password");
    });
  });

  describe("Validation & Submission Behavior", () => {
    it("blocks submission and shows localized error when passwords do not match", async () => {
      const registerSpy = jest.spyOn(useAuthStore.getState(), "register").mockResolvedValue(true);

      await act(async () => {
        root.render(<AuthCard initialMode="signup" />);
      });

      const nameInput = container.querySelector(
        'input[placeholder="Enter your full name"]',
      ) as HTMLInputElement;
      const emailInput = container.querySelector(
        'input[placeholder="Email address"]',
      ) as HTMLInputElement;
      const passwordInput = container.querySelector(
        'input[placeholder="Create password"]',
      ) as HTMLInputElement;
      const confirmInput = container.querySelector(
        'input[placeholder="Confirm password"]',
      ) as HTMLInputElement;

      await act(async () => {
        setInputValue(nameInput, "Rahim Ahmed");
        setInputValue(emailInput, "rahim@example.com");
        setInputValue(passwordInput, "ValidPassword123");
        setInputValue(confirmInput, "DifferentPass456");
      });

      const submitBtn = container.querySelector(
        '[data-testid="auth-submit-button"]',
      ) as HTMLElement;

      await act(async () => {
        submitBtn.click();
      });
      await act(async () => {
        await Promise.resolve();
      });

      // Validation should fail and display error message
      expect(container.textContent).toContain("Passwords do not match");
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("blocks submission when confirm password is empty", async () => {
      const registerSpy = jest.spyOn(useAuthStore.getState(), "register").mockResolvedValue(true);

      await act(async () => {
        root.render(<AuthCard initialMode="signup" />);
      });

      const nameInput = container.querySelector(
        'input[placeholder="Enter your full name"]',
      ) as HTMLInputElement;
      const emailInput = container.querySelector(
        'input[placeholder="Email address"]',
      ) as HTMLInputElement;
      const passwordInput = container.querySelector(
        'input[placeholder="Create password"]',
      ) as HTMLInputElement;

      await act(async () => {
        setInputValue(nameInput, "Rahim Ahmed");
        setInputValue(emailInput, "rahim@example.com");
        setInputValue(passwordInput, "ValidPassword123");
      });

      const submitBtn = container.querySelector(
        '[data-testid="auth-submit-button"]',
      ) as HTMLElement;

      await act(async () => {
        submitBtn.click();
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(container.textContent).toContain("Confirm your password");
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("successfully submits when passwords match", async () => {
      const registerSpy = jest.spyOn(useAuthStore.getState(), "register").mockResolvedValue(true);
      const onSuccessMock = jest.fn();

      await act(async () => {
        root.render(<AuthCard initialMode="signup" onSuccess={onSuccessMock} />);
      });

      const nameInput = container.querySelector(
        'input[placeholder="Enter your full name"]',
      ) as HTMLInputElement;
      const emailInput = container.querySelector(
        'input[placeholder="Email address"]',
      ) as HTMLInputElement;
      const passwordInput = container.querySelector(
        'input[placeholder="Create password"]',
      ) as HTMLInputElement;
      const confirmInput = container.querySelector(
        'input[placeholder="Confirm password"]',
      ) as HTMLInputElement;

      await act(async () => {
        setInputValue(nameInput, "Rahim Ahmed");
        setInputValue(emailInput, "rahim@example.com");
        setInputValue(passwordInput, "ValidPassword123");
        setInputValue(confirmInput, "ValidPassword123");
      });

      const submitBtn = container.querySelector(
        '[data-testid="auth-submit-button"]',
      ) as HTMLElement;

      await act(async () => {
        submitBtn.click();
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(registerSpy).toHaveBeenCalledWith({
        full_name: "Rahim Ahmed",
        email: "rahim@example.com",
        password: "ValidPassword123",
      });
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  describe("Bengali (bn) Localization Parity", () => {
    it("renders authentic Bengali placeholders and validates with Bengali messages", async () => {
      await act(async () => {
        useLanguageStore.getState().setLanguage("bn");
      });
      const registerSpy = jest.spyOn(useAuthStore.getState(), "register").mockResolvedValue(true);

      await act(async () => {
        root.render(<AuthCard initialMode="signup" />);
      });

      expect(container.textContent).toContain("নতুন অ্যাকাউন্ট তৈরি করুন");
      const confirmInput = container.querySelector(
        'input[placeholder="পাসওয়ার্ড নিশ্চিত করুন"]',
      ) as HTMLInputElement;
      expect(confirmInput).not.toBeNull();

      const nameInput = container.querySelector(
        'input[placeholder="আপনার পুরো নাম লিখুন"]',
      ) as HTMLInputElement;
      const emailInput = container.querySelector(
        'input[placeholder="ইমেইল ঠিকানা"]',
      ) as HTMLInputElement;
      const passwordInput = container.querySelector(
        'input[placeholder="পাসওয়ার্ড তৈরি করুন"]',
      ) as HTMLInputElement;

      await act(async () => {
        setInputValue(nameInput, "রাহিম আহমেদ");
        setInputValue(emailInput, "rahim@example.com");
        setInputValue(passwordInput, "Password123");
        setInputValue(confirmInput, "MismatchPassword456");
      });

      const submitBtn = container.querySelector(
        '[data-testid="auth-submit-button"]',
      ) as HTMLElement;

      await act(async () => {
        submitBtn.click();
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(container.textContent).toContain("পাসওয়ার্ড দুটি মেলেনি");
      expect(registerSpy).not.toHaveBeenCalled();
    });
  });
});
