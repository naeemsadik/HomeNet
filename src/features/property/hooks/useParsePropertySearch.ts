import { useMutation } from "@tanstack/react-query";
import { parsePropertySearch } from "@/services/aiApi";
import type { AiParseError } from "../types/aiListing";
import type { AiParsedSearch } from "../types/aiSearch";

/** AI search. Loading and error state live here, not in the finder. */
export function useParsePropertySearch() {
  return useMutation<AiParsedSearch, AiParseError, string>({
    mutationFn: parsePropertySearch,
  });
}
