import { queryOptions, useQuery } from "@tanstack/react-query";
import { getUniversities } from "../api/messApi";
import type { Campus, University } from "../types/mess";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The university catalogue changes rarely: cached for a day (PRD 2.3). */
export const universitiesQuery = queryOptions({
  queryKey: ["mess", "universities"],
  queryFn: getUniversities,
  staleTime: DAY_MS,
  gcTime: DAY_MS,
});

export function useUniversities({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...universitiesQuery, enabled });
}

export interface CampusChoice {
  university: University;
  campus: Campus;
}

export function findCampus(universities: readonly University[] | undefined, campusId: string | null | undefined): CampusChoice | null {
  if (!universities || !campusId) return null;
  for (const university of universities) {
    const campus = university.campuses.find((row) => row.id === campusId);
    if (campus) return { university, campus };
  }
  return null;
}

/** "UIU", or "DU, Curzon Hall gate" when the university has more than one campus. */
export function campusLabel(choice: CampusChoice | null): string {
  if (!choice) return "";
  return choice.university.campuses.length > 1 ? `${choice.university.short_name}, ${choice.campus.name}` : choice.university.short_name;
}

/** Search by short or full name, either language's spacing and case. */
export function searchUniversities(universities: readonly University[], query: string): University[] {
  const needle = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!needle) return [...universities];
  return universities.filter(
    (university) => university.short_name.toLowerCase().includes(needle) || university.name.toLowerCase().includes(needle),
  );
}
