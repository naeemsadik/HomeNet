import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { AdminShell } from "../AdminShell";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/i18n";
import { router } from "expo-router";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
  usePathname: () => "/admin",
  Link: ({ children }: any) => children,
}));

jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ children }: any) => <div data-testid="app-chrome">{children}</div>,
}));

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

jest.mock("@/features/notification/hooks/useNotifications", () => ({
  useUnreadCount: () => ({ data: { data: { count: 3 } } }),
}));

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  useAuthStore.setState({
    user: { id: "u-admin", email: "admin@test.com", full_name: "Admin Tester" } as any,
    userRoles: [
      {
        id: "ur1",
        user_id: "u-admin",
        role_id: "r-admin",
        role: {
          id: "r-admin",
          name: "admin",
          role_permissions: [],
        },
      },
    ],
    hydrated: true,
  });

  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("AdminShell", () => {
  it("renders within AppChrome and displays header, tabs, and content", async () => {
    await act(async () => {
      root.render(
        <AdminShell activeTab="properties">
          <div data-testid="admin-child-content">Admin Content Here</div>
        </AdminShell>,
      );
    });

    expect(container.querySelector('[data-testid="app-chrome"]')).not.toBeNull();
    // One heading, and it names the page: the old "Admin Dashboard" banner is gone.
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelector("h1")?.textContent).toBe("Properties");
    expect(container.textContent).not.toContain("Admin Dashboard");
    expect(container.querySelector('[data-testid="admin-child-content"]')).not.toBeNull();
  });

  it("renders contextual back button when backAction is supplied", async () => {
    const mockBack = jest.fn();

    await act(async () => {
      root.render(
        <AdminShell
          activeTab="properties"
          backAction={{
            label: "Back to Notifications",
            onPress: mockBack,
          }}
        >
          <div>Content</div>
        </AdminShell>,
      );
    });

    expect(container.textContent).toContain("Back to Notifications");
    const backBtn = container.querySelector('[aria-label="Back to Notifications"]') as HTMLElement;
    expect(backBtn).not.toBeNull();

    await act(async () => {
      backBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it("opens the page of the tab that is clicked, replacing the current one", async () => {
    await act(async () => {
      root.render(
        <AdminShell activeTab="properties">
          <div>Content</div>
        </AdminShell>,
      );
    });

    const notifTab = Array.from(container.querySelectorAll('[role="tab"]')).find((el) =>
      el.textContent?.includes("Notifications"),
    );
    expect(notifTab).toBeDefined();

    await act(async () => {
      notifTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(router.replace).toHaveBeenCalledWith("/admin/notifications");
    expect(router.push).not.toHaveBeenCalled();
  });
});
