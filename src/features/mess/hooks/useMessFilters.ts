import { useCallback, useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useMessFilterStore } from "../stores/messFilterStore";
import type { MessFilters } from "../types/mess";
import { filtersFromParams, filtersToParamPatch, type MessSearchParams } from "../utils/filterParams";

/**
 * The committed search: the URL's filters over the seeker's remembered campus
 * and gender. A shared link's campus wins over the remembered one, but only an
 * explicit change is remembered.
 */
export function useMessFilters() {
  const params = useLocalSearchParams() as MessSearchParams;
  const campusId = useMessFilterStore((s) => s.campusId);
  const gender = useMessFilterStore((s) => s.gender);
  const paramsKey = JSON.stringify(params);

  const filters = useMemo<MessFilters>(() => {
    const fromUrl = filtersFromParams(params);
    return {
      ...(campusId ? { campus_id: campusId } : {}),
      ...(gender ? { gender } : {}),
      ...fromUrl,
    };
    // paramsKey stands in for params, whose identity changes on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, campusId, gender]);

  const commit = useCallback(
    (next: MessFilters) => {
      const store = useMessFilterStore.getState();
      if ((next.campus_id ?? null) !== store.campusId) store.setCampus(next.campus_id ?? null);
      if ((next.gender ?? null) !== store.gender) store.setGender(next.gender ?? null);
      router.setParams(filtersToParamPatch(next, params));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramsKey],
  );

  return { filters, commit };
}
