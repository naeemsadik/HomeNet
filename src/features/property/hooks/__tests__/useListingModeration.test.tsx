import React from "react";
import renderer, { act } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useListingModeration } from "@/features/property/hooks/useListingModeration";
import { staffArchiveProperty, staffRestoreProperty } from "@/services/propertyApi";
import { useToastStore } from "@/lib/toast";
import type { Property } from "@/features/property/types/property";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/services/propertyApi", () => ({
  staffArchiveProperty: jest.fn(),
  staffRestoreProperty: jest.fn(),
  adminDeleteProperty: jest.fn(),
}));

const archive = staffArchiveProperty as jest.Mock;
const unarchive = staffRestoreProperty as jest.Mock;
const listing = { id: "p1", title: "Flat in Gulshan" } as Property;

/** A promise the test settles by hand, standing in for a request still on its way. */
function pending() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  client.setQueryData(["properties", "feed"], { items: [listing], total: 1 });
  let api!: ReturnType<typeof useListingModeration>;
  const Harness = () => {
    api = useListingModeration();
    return null;
  };
  act(() => {
    renderer.create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  const items = () => (client.getQueryData(["properties", "feed"]) as { items: Property[] }).items;
  const pressUndo = () => act(() => useToastStore.getState().toast!.action!.onPress());
  return { api: () => api, items, pressUndo };
}

const flush = () => act(async () => {});

beforeEach(() => jest.clearAllMocks());

describe("archive and Undo", () => {
  it("does not send the restore until the archive has reached the server", async () => {
    const request = pending();
    archive.mockReturnValue(request.promise);
    unarchive.mockResolvedValue({});
    const { api, items, pressUndo } = setup();

    let done!: Promise<void>;
    act(() => {
      done = api().archive(listing);
    });
    expect(items()).toEqual([]);

    // Undo pressed while the archive is still on its way.
    pressUndo();
    expect(items()).toEqual([listing]);
    await flush();
    expect(unarchive).not.toHaveBeenCalled();

    request.resolve();
    await act(async () => {
      await done;
    });
    await flush();
    expect(unarchive).toHaveBeenCalledWith("p1");
    expect(items()).toEqual([listing]);
  });

  it("sends no restore when the archive itself failed", async () => {
    const request = pending();
    archive.mockReturnValue(request.promise);
    const { api, items, pressUndo } = setup();

    let done!: Promise<void>;
    act(() => {
      done = api().archive(listing);
    });
    pressUndo();
    request.reject(new Error("Forbidden"));
    await act(async () => {
      await done;
    });
    await flush();
    expect(unarchive).not.toHaveBeenCalled();
    expect(items()).toEqual([listing]);
  });

  it("puts the listing back and says so when the archive fails", async () => {
    archive.mockRejectedValue(new Error("You do not have permission"));
    const { api, items } = setup();
    await act(async () => {
      await api().archive(listing);
    });
    expect(items()).toEqual([listing]);
    expect(useToastStore.getState().toast?.message).toBeTruthy();
    expect(useToastStore.getState().toast?.action).toBeUndefined();
  });
});

describe("the routes it calls (backend PR 93)", () => {
  it("archives and restores through the staff routes, not the owner ones that refuse other people's listings", () => {
    const source = require("fs").readFileSync(require("path").resolve(__dirname, "../useListingModeration.ts"), "utf8");
    expect(source).toContain("staffArchiveProperty(property.id)");
    expect(source).toContain("staffRestoreProperty(property.id)");
    expect(source).not.toMatch(/\b(archiveProperty|unarchiveProperty)\(/);
  });
});
