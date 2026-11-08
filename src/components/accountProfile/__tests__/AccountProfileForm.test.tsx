import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { Text } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { updateUser } from "@/services/userApi";
import { AccountProfileForm, ProfileBadge } from "../AccountProfileForm";

// The icon package ships ES modules Jest does not transform; every icon renders nothing here.
jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock("@/services/userApi", () => ({ updateUser: jest.fn(), uploadAvatar: jest.fn() }));
jest.mock("@/lib/alert", () => ({ notify: jest.fn(), confirmAction: jest.fn() }));
jest.mock("@/components/ChangePasswordModal", () => ({ ChangePasswordModal: () => null }));
jest.mock("@/components/DeleteAccountDialog", () => ({ DeleteAccountDialog: () => null }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const deleteCopy = {
  description: "Your listings will be removed.",
  confirmTitle: "Delete?",
  confirmMessage: "Sure?",
  confirmLabel: "Delete",
  deletedTitle: "Deleted",
  deletedMessage: "Gone",
};

describe("AccountProfileForm: the one profile buyers and sellers share", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const fetchMe = jest.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    (updateUser as jest.Mock).mockReset().mockResolvedValue({});
    useAuthStore.setState({
      user: { id: "u1", full_name: "Rahim Uddin", email: "rahim@example.com", avatar_url: null },
      fetchMe,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        <QueryClientProvider client={new QueryClient()}>
        <AccountProfileForm
          badge={<ProfileBadge icon={() => null} label="Buyer" tone="neutral" />}
          deleteCopy={deleteCopy}
          footerStart={<Text>Logout here</Text>}
        >
          <Text>Listing as section</Text>
        </AccountProfileForm>
        </QueryClientProvider>,
      );
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    useAuthStore.setState({ user: null });
  });

  const text = () => container.textContent ?? "";
  const input = (label: string) => container.querySelector(`input[aria-label="${label}"]`) as HTMLInputElement;

  it("puts the role's own section between Personal and Contact information", () => {
    const t = text();
    const order = ["Personal information", "Buyer", "Listing as section", "Contact information", "Account security", "Logout here", "Save changes"];
    const positions = order.map((words) => t.indexOf(words));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(t).toContain(deleteCopy.description);
  });

  it("shows the email without letting it be edited, since Save never sent it", () => {
    expect(text()).toContain("rahim@example.com");
    expect(input("Email")).toBeNull();
    expect(container.querySelectorAll("input")).toHaveLength(1); // the name is the only field
  });

  it("saves the edited name", async () => {
    const name = input("Full name");
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    await act(async () => {
      setValue.call(name, "Rahim Uddin Khan");
      name.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const save = container.querySelector('[aria-label="Save changes"]') as HTMLElement;
    await act(async () => save.click());

    expect(updateUser).toHaveBeenCalledWith("u1", { full_name: "Rahim Uddin Khan" });
    expect(fetchMe).toHaveBeenCalled();
  });

  it("starts an unnamed account with an empty name, so Save cannot store a placeholder", async () => {
    await act(async () => root.unmount());
    useAuthStore.setState({ user: { id: "u2", full_name: "", email: "x@example.com", avatar_url: null }, fetchMe });
    root = createRoot(container);
    await act(async () => {
      root.render(
        <QueryClientProvider client={new QueryClient()}>
          <AccountProfileForm badge={null} deleteCopy={deleteCopy} />
        </QueryClientProvider>,
      );
    });

    expect(input("Full name").value).toBe("");
    const save = container.querySelector('[aria-label="Save changes"]') as HTMLElement;
    await act(async () => save.click());
    expect(updateUser).not.toHaveBeenCalled();
  });
});
