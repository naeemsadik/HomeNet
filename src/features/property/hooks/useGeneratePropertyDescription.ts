import { useMutation } from "@tanstack/react-query";
import { generatePropertyDescription } from "@/services/aiApi";
import type { AiParseError, AiParsedProperty } from "../types/aiListing";

/** Quick listing. Loading and error state live here, not in the sheet. */
export function useGeneratePropertyDescription() {
  return useMutation<AiParsedProperty, AiParseError, string>({
    mutationFn: generatePropertyDescription,
  });
}
