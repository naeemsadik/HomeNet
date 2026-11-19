import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCampus,
  createUniversity,
  deleteCampus,
  deleteUniversity,
  getAdminUniversities,
  updateCampus,
  updateUniversity,
} from "../api/messApi";
import type { CampusInput, UniversityInput } from "../types/mess";

/** Under ["mess", "universities"], so one invalidation also refreshes what students see. */
const ADMIN_KEY = ["mess", "universities", "admin"] as const;
const CATALOGUE_KEY = ["mess", "universities"] as const;

/** Every university, hidden ones too (manage_areas). */
export function useAdminUniversities() {
  return useQuery({ queryKey: ADMIN_KEY, queryFn: getAdminUniversities });
}

/** Create, edit and delete universities and campuses; each success refreshes the catalogue everywhere. */
export function useUniversityAdminMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: CATALOGUE_KEY });

  const saveUniversity = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: UniversityInput }) => (id ? updateUniversity(id, input) : createUniversity(input)),
    onSuccess: refresh,
  });
  const removeUniversity = useMutation({ mutationFn: (id: string) => deleteUniversity(id), onSuccess: refresh });

  const saveCampus = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CampusInput }) => {
      if (!id) return createCampus(input);
      const { name, lat, lng, is_primary } = input;
      return updateCampus(id, { name, lat, lng, is_primary });
    },
    onSuccess: refresh,
  });
  const removeCampus = useMutation({ mutationFn: (id: string) => deleteCampus(id), onSuccess: refresh });

  return { saveUniversity, removeUniversity, saveCampus, removeCampus };
}
