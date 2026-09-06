import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProperty,
  deleteProperty,
  deletePropertyMedia,
  submitProperty,
  updateProperty,
  uploadPropertyMedia,
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

export function useDeleteProperty() {
  const invalidate = useInvalidateProperties();
  return useMutation({ mutationFn: deleteProperty, onSuccess: () => invalidate() });
}

export function useUploadMedia() {
  const invalidate = useInvalidateProperties();
  return useMutation({
    mutationFn: ({
      propertyId,
      file,
      type = "image",
      displayOrder,
    }: {
      propertyId: string;
      file: UploadInput;
      type?: "image" | "video";
      displayOrder?: number;
    }) => uploadPropertyMedia(propertyId, file, type, displayOrder),
    onSuccess: (_, variables) => invalidate(variables.propertyId),
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
