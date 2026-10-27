import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  archiveProperty,
  createProperty,
  deleteProperty,
  deletePropertyMedia,
  submitProperty,
  updateProperty,
  uploadMedia,
} from "@/services/propertyApi";
import type { UploadInput } from "@/services/upload";
import type { UpsertPropertyDto } from "@/types/api";

function useInvalidateProperties() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["properties"] });
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    if (id) queryClient.invalidateQueries({ queryKey: ["property", id] });
  };
}

export function useCreateProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({ mutationFn: createProperty, onSuccess: () => invalidate() });
}

export function useUpdateProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertPropertyDto }) => updateProperty(id, dto),
    onSuccess: (_, variables) => invalidate(variables.id),
  });
}

export function useArchiveProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({ mutationFn: archiveProperty, onSuccess: (_, id) => invalidate(id) });
}

export function useDeleteProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({ mutationFn: deleteProperty, onSuccess: () => invalidate() });
}

export function useUploadMedia() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: ({
      file,
      type = "image",
    }: {
      propertyId?: string;
      file: UploadInput;
      type?: "image" | "video";
      displayOrder?: number;
    }) => uploadMedia(file, type),
    onSuccess: (_, variables) => {
      if (variables.propertyId) invalidate(variables.propertyId);
    },
  });
}

export function useDeleteMedia() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: ({ mediaId }: { mediaId: string; propertyId?: string }) => deletePropertyMedia(mediaId),
    onSuccess: (_, variables) => invalidate(variables.propertyId),
  });
}

export function useSubmitForVerification() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: submitProperty,
    onSuccess: (_, propertyId) => invalidate(propertyId),
  });
}
