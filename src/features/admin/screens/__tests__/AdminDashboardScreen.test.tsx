import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useAuthStore } from "@/stores/authStore";
import { AdminDashboardScreen } from "../AdminDashboardScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let mockTabParam: string | undefined;
jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => <div data-testid="redirect" data-href={href} />,
  useLocalSearchParams: () => ({ tab: mockTabParam }),
}));
jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const role = (name: string, permissions: string[] = []) => ({
  id: name,
  user_id: "u",
  role_id: name,
  role: { id: name, name, role_permissions: permissions.map((p) => ({ permission: { name: p } })) },
});

function renderAs(roles: unknown[], tab?: string) {
  mockTabParam = tab;
  useAuthStore.setState({ userRoles: roles as never, hydrated: true });
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<AdminDashboardScreen />));
  const href = container.querySelector('[data-testid="redirect"]')?.getAttribute("data-href");
  act(() => root.unmount());
  container.remove();
  return href;
}

describe("AdminDashboardScreen", () => {
  it("sends an admin to the first tab, and an old ?tab= link to that tab's own page", () => {
    expect(renderAs([role("admin")])).toBe("/admin/properties");
    expect(renderAs([role("admin")], "users")).toBe("/admin/users");
  });

  it("does not send anyone to a tab their permissions do not open", () => {
    expect(renderAs([role("moderator", ["moderate_listing"])], "users")).toBe("/admin/properties");
  });
});
