import { useState } from "react";
import apiClient from "@/services/apiClient";

export function useMediaDelete() {
  const [deleting, setDeleting] = useState(false);

  const deleteMedia = async (mediaId: string) => {
    setDeleting(true);
    try {
      await apiClient.delete(`/v1/properties/media/${mediaId}`);
      return { success: true as const };
    } catch (error) {
      return { success: false as const, error };
    } finally {
      setDeleting(false);
    }
  };

  return { deleteMedia, deleting };
}
