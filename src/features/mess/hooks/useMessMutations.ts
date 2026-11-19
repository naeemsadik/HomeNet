import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UploadInput } from "@/services/upload";
import {
  confirmAvailable,
  deleteMessMedia,
  reportMess,
  setSeatStatus,
  submitMess,
  uploadMessMedia,
  upsertMess,
} from "../api/messApi";
import type { MediaLabel, ReportReason, SeatStatus, UpsertMessDto } from "../types/mess";
import { messKeys } from "./useMessQueries";

/** Any write can change a card, a detail page and the dashboard: refetch the module. */
function useInvalidateMess() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: messKeys.all });
}

export function useUpsertMess() {
  const invalidate = useInvalidateMess();
  return useMutation({ mutationFn: (dto: UpsertMessDto) => upsertMess(dto), onSuccess: invalidate });
}

export function useSubmitMess() {
  const invalidate = useInvalidateMess();
  return useMutation({ mutationFn: (id: string) => submitMess(id), onSuccess: invalidate });
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
