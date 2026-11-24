import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { PaginatedResponse, Property } from "@/features/property/types/property";
import type { UploadInput } from "@/services/upload";
import type { ApiResponse } from "@/types/api";
import {
  archiveMess,
  confirmAvailable,
  deleteMess,
  deleteMessMedia,
  publishMess,
  reportMess,
  setSeatStatus,
  submitMess,
  uploadMessMedia,
  upsertMess,
} from "../api/messApi";
import type { MediaLabel, ReportReason, SeatStatus, UpsertMessDto } from "../types/mess";
import { messKeys } from "./useMessQueries";

/** My listings' property pages (useMyProperties). */
const MY_PROPERTIES_KEY = ["my-properties"] as const;

type MyPropertiesPages = InfiniteData<ApiResponse<PaginatedResponse<Property>>>;

/**
 * Any write can change a card, a detail page and the seller's list: refetch the
 * module, and My listings, which shows a seat listing as a property row too. The
 * write waits only for the mess side: My listings' property pages refetch in the
 * background, so a seat button is not held disabled while every loaded page reloads.
 */
function useInvalidateMess() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: MY_PROPERTIES_KEY });
    return client.invalidateQueries({ queryKey: messKeys.all });
  };
}

/**
 * Archive, delete and publish change the listing's Property row, which property
 * search, the admin list and the property page cache show too, as the property
 * mutations refresh them.
 */
function useInvalidateListing() {
  const client = useQueryClient();
  const invalidateMess = useInvalidateMess();
  return (id: string) => {
    void client.invalidateQueries({ queryKey: ["properties"] });
    void client.invalidateQueries({ queryKey: ["admin", "properties"] });
    void client.invalidateQueries({ queryKey: ["property", id] });
    return invalidateMess();
  };
}

export function useUpsertMess() {
  const invalidate = useInvalidateMess();
  return useMutation({ mutationFn: (dto: UpsertMessDto) => upsertMess(dto), onSuccess: invalidate });
}

export function useSubmitMess() {
  const invalidate = useInvalidateMess();
  return useMutation({ mutationFn: (id: string) => submitMess(id), onSuccess: invalidate });
}

export function useArchiveMess() {
  const invalidate = useInvalidateListing();
  return useMutation({ mutationFn: (id: string) => archiveMess(id), onSuccess: (_, id) => invalidate(id) });
}

export function useDeleteMess() {
  const client = useQueryClient();
  const invalidate = useInvalidateListing();
  return useMutation({
    mutationFn: (id: string) => deleteMess(id),
    onSuccess: (_, id) => {
      // The two lists refetch separately. Drop the listing from the property pages
      // first, or it shows again as a property row once the seat list comes back
      // without it and before the property pages do.
      client.setQueriesData<MyPropertiesPages>({ queryKey: MY_PROPERTIES_KEY }, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) =>
                page.data ? { ...page, data: { ...page.data, items: page.data.items.filter((item) => item.id !== id) } } : page,
              ),
            }
          : data,
      );
      return invalidate(id);
    },
  });
}

export function usePublishMess() {
  const invalidate = useInvalidateListing();
  return useMutation({ mutationFn: (id: string) => publishMess(id), onSuccess: (_, id) => invalidate(id) });
}

export function useUploadMessMedia() {
  return useMutation({
    mutationFn: (input: { id: string; file: UploadInput; label: MediaLabel; displayOrder?: number }) =>
      uploadMessMedia(input.id, input.file, input.label, input.displayOrder),
  });
}

export function useDeleteMessMedia() {
  return useMutation({ mutationFn: (mediaId: string) => deleteMessMedia(mediaId) });
}

export function useSetSeatStatus() {
  const invalidate = useInvalidateMess();
  return useMutation({
    mutationFn: (input: { id: string; seatId: string; status: SeatStatus }) => setSeatStatus(input.id, input.seatId, input.status),
    onSuccess: invalidate,
  });
}

export function useConfirmAvailable() {
  const invalidate = useInvalidateMess();
  return useMutation({ mutationFn: (id: string) => confirmAvailable(id), onSuccess: invalidate });
}

export function useReportMess() {
  return useMutation({
    mutationFn: (input: { id: string; reason: ReportReason; note?: string }) => reportMess(input.id, input.reason, input.note),
  });
}
