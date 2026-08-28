import type { UploadableFile } from "@/types/api";

export type UploadInput = UploadableFile | Blob | File;

export function appendUpload(
  formData: FormData,
  field: string,
  file: UploadInput,
  fallbackName: string,
) {
  if ("uri" in file) {
    formData.append(field, file as unknown as Blob);
    return;
  }

  const name = typeof File !== "undefined" && file instanceof File ? file.name : fallbackName;
  formData.append(field, file, name);
}
