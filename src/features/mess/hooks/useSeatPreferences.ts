import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getSeatPreferences, putSeatPreferences } from "../api/messApi";
import { useMessFilterStore } from "../stores/messFilterStore";

const keyOf = (campusId: string | null, gender: string | null) => JSON.stringify([campusId, gender]);

/**
 * Keeps the remembered campus and gender in step with the signed-in account
 * (GET and PUT /v1/me/seat-preferences). On sign-in the device's choice wins
 * where it has one and the account fills the gaps; after that, a change on the
 * device is saved to the account. Failures are silent: the device copy still works.
 */
export function useSyncSeatPreferences() {
  const userId = useAuthStore((s) => s.user?.id);
  const campusId = useMessFilterStore((s) => s.campusId);
  const gender = useMessFilterStore((s) => s.gender);
  const lastSaved = useRef<string | null>(null);
  const mergedFor = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ["mess", "seat-preferences", userId],
    queryFn: getSeatPreferences,
    enabled: Boolean(userId),
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (!userId || !query.isSuccess) return;
    const saved = query.data;
    const store = useMessFilterStore.getState();
    let nextCampus = store.campusId;
    let nextGender = store.gender;

    if (mergedFor.current !== userId) {
      mergedFor.current = userId;
      lastSaved.current = keyOf(saved?.campus_id ?? null, saved?.gender ?? null);
      nextCampus = store.campusId ?? saved?.campus_id ?? null;
      nextGender = store.gender ?? saved?.gender ?? null;
      if (nextCampus !== store.campusId) store.setCampus(nextCampus);
      if (nextGender !== store.gender) store.setGender(nextGender);
    }

    const key = keyOf(nextCampus, nextGender);
    if (key === lastSaved.current) return;
    lastSaved.current = key;
    putSeatPreferences({
      campus_id: nextCampus,
      gender: nextGender,
      max_all_in: saved?.max_all_in ?? null,
      lifestyle_tags: saved?.lifestyle_tags ?? [],
    }).catch(() => undefined);
    // campusId and gender re-run the effect; it reads their latest values from the store.
  }, [userId, campusId, gender, query.isSuccess, query.data]);
}
