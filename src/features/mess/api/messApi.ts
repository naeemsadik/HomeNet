/**
 * The mess API (PRD v1.0, section 2.3), one function per endpoint.
 *
 * Listing media, submit and saved listings reuse the existing /v1/properties
 * routes: a mess listing is a Property row. In a build made with
 * EXPO_PUBLIC_MESS_FIXTURES=true every call is answered by the in-memory demo
 * backend in ./fixtures instead (see fixtureBackend below).
 */
import apiClient, { ApiError } from "@/services/apiClient";
import {
  archiveProperty,
  deleteProperty,
  deletePropertyMedia,
  publishProperty,
  submitProperty,
  uploadPropertyMedia,
} from "@/services/propertyApi";
import type { UploadInput } from "@/services/upload";
import type { ApiResponse } from "@/types/api";
import type { PaginatedResponse } from "@/features/property/types/property";
import { MY_MESS_PAGE_SIZE } from "../constants/paging";
import { toApiParams } from "../utils/filterParams";
import type {
  Campus,
  CampusInput,
  ContactChannel,
  ContactResult,
  MediaLabel,
  MessCard,
  MessDetail,
  MessFilters,
  MessMedia,
  MessMutationResult,
  MyMessListing,
  ReportReason,
  SeatStatus,
  SeekerPreference,
  University,
  UniversityInput,
  UpsertMessDto,
} from "../types/mess";

export interface MessBackend {
  getUniversities(): Promise<University[]>;
  /** The admin catalogue (manage_areas): hidden universities too. */
  getAdminUniversities(): Promise<University[]>;
  createUniversity(input: UniversityInput): Promise<University>;
  updateUniversity(id: string, input: UniversityInput): Promise<University>;
  deleteUniversity(id: string): Promise<void>;
  createCampus(input: CampusInput): Promise<Campus>;
  updateCampus(id: string, input: Omit<CampusInput, "university_id">): Promise<Campus>;
  deleteCampus(id: string): Promise<void>;
  searchMess(filters: MessFilters, page: number, limit: number): Promise<PaginatedResponse<MessCard>>;
  getMessDetail(id: string): Promise<MessDetail>;
  getMyMessListings(page: number): Promise<PaginatedResponse<MyMessListing>>;
  upsertMess(dto: UpsertMessDto): Promise<MessMutationResult>;
  submitMess(id: string): Promise<MessMutationResult>;
  /** Owner archive: hides a live or closed listing but keeps it. */
  archiveMess(id: string): Promise<void>;
  /** Owner-only permanent delete, any status. */
  deleteMess(id: string): Promise<void>;
  /** Puts live a listing a moderator approved and held for its owner. */
  publishMess(id: string): Promise<void>;
  uploadMessMedia(id: string, file: UploadInput, label: MediaLabel, displayOrder?: number): Promise<MessMedia>;
  deleteMessMedia(mediaId: string): Promise<void>;
  setSeatStatus(id: string, seatId: string, status: SeatStatus): Promise<void>;
  confirmAvailable(id: string): Promise<void>;
  contactLister(id: string, channel: ContactChannel): Promise<ContactResult>;
  reportMess(id: string, reason: ReportReason, note?: string): Promise<void>;
  getSeatPreferences(): Promise<SeekerPreference | null>;
  putSeatPreferences(preferences: SeekerPreference): Promise<SeekerPreference>;
}

/** The envelope's data, or an error when a success carried none. */
function unwrap<T>(response: ApiResponse<T>): T {
  if (response.data === null || response.data === undefined) {
    throw new ApiError(response.message || "The server sent an empty response", null);
  }
  return response.data;
}

const enc = encodeURIComponent;

export const httpBackend: MessBackend = {
  async getUniversities() {
    const { data } = await apiClient.get<ApiResponse<University[]>>("/v1/universities");
    return unwrap(data);
  },

  async getAdminUniversities() {
    const { data } = await apiClient.get<ApiResponse<University[]>>("/v1/universities", { params: { include_inactive: true } });
    return unwrap(data);
  },

  async createUniversity(input) {
    const { data } = await apiClient.post<ApiResponse<University>>("/v1/universities", input);
    return unwrap(data);
  },

  async updateUniversity(id, input) {
    const { data } = await apiClient.patch<ApiResponse<University>>(`/v1/universities/${enc(id)}`, input);
    return unwrap(data);
  },

  async deleteUniversity(id) {
    await apiClient.delete(`/v1/universities/${enc(id)}`);
  },

  async createCampus(input) {
    const { data } = await apiClient.post<ApiResponse<Campus>>("/v1/campuses", input);
    return unwrap(data);
  },

  async updateCampus(id, input) {
    const { data } = await apiClient.patch<ApiResponse<Campus>>(`/v1/campuses/${enc(id)}`, input);
    return unwrap(data);
  },

  async deleteCampus(id) {
    await apiClient.delete(`/v1/campuses/${enc(id)}`);
  },

  async searchMess(filters, page, limit) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<MessCard>>>("/v1/mess", {
      params: toApiParams(filters, page, limit),
    });
    return unwrap(data);
  },

  async getMessDetail(id) {
    const { data } = await apiClient.get<ApiResponse<MessDetail>>(`/v1/mess/${enc(id)}`);
    return unwrap(data);
  },

  async getMyMessListings(page) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<MyMessListing>>>("/v1/mess/my", {
      params: { page, limit: MY_MESS_PAGE_SIZE },
    });
    return unwrap(data);
  },

  async upsertMess(dto) {
    const { data } = await apiClient.post<ApiResponse<MessMutationResult>>("/v1/mess", dto);
    return unwrap(data);
  },

  async submitMess(id) {
    return unwrap(await submitProperty(id));
  },

  // Archive, delete and publish are the owner's /v1/properties routes, like submit:
  // the mess API (PRD 2.3) adds none of its own.
  async archiveMess(id) {
    await archiveProperty(id);
  },

  async deleteMess(id) {
    await deleteProperty(id);
  },

  async publishMess(id) {
    await publishProperty(id);
  },

  async uploadMessMedia(id, file, label, displayOrder) {
    const media = unwrap(await uploadPropertyMedia(id, file, "image", displayOrder, label));
    return { id: media.id, url: media.url, label, display_order: media.display_order };
  },

  async deleteMessMedia(mediaId) {
    await deletePropertyMedia(mediaId);
  },

  async setSeatStatus(id, seatId, status) {
    await apiClient.patch(`/v1/mess/${enc(id)}/seats/${enc(seatId)}`, { status });
  },

  async confirmAvailable(id) {
    await apiClient.post(`/v1/mess/${enc(id)}/confirm`);
  },

  async contactLister(id, channel) {
    const { data } = await apiClient.post<ApiResponse<ContactResult>>(`/v1/mess/${enc(id)}/contact`, { channel });
    return unwrap(data);
  },

  async reportMess(id, reason, note) {
    await apiClient.post(`/v1/mess/${enc(id)}/report`, { reason, ...(note ? { note } : {}) });
  },

  async getSeatPreferences() {
    const { data } = await apiClient.get<ApiResponse<SeekerPreference | null>>("/v1/me/seat-preferences");
    return data.data ?? null;
  },

  async putSeatPreferences(preferences) {
    const { data } = await apiClient.put<ApiResponse<SeekerPreference>>("/v1/me/seat-preferences", preferences);
    return unwrap(data);
  },
};

/**
 * The demo backend, for development and demos before the API exists. Its
 * listings, phone numbers and campus coordinates are made up: never set
 * EXPO_PUBLIC_MESS_FIXTURES on a production deploy.
 *
 * The env check is written out here, not read from a constant elsewhere, so
 * the production build sees a branch that is always false and leaves the demo
 * module out of the bundle entirely.
 */
const fixtureBackend: MessBackend | null =
  process.env.EXPO_PUBLIC_MESS_FIXTURES === "true"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require("./fixtures/server") as typeof import("./fixtures/server")).fixtureBackend
    : null;

const backend = (): MessBackend => fixtureBackend ?? httpBackend;

export const getUniversities = () => backend().getUniversities();
export const getAdminUniversities = () => backend().getAdminUniversities();
export const createUniversity = (input: UniversityInput) => backend().createUniversity(input);
export const updateUniversity = (id: string, input: UniversityInput) => backend().updateUniversity(id, input);
export const deleteUniversity = (id: string) => backend().deleteUniversity(id);
export const createCampus = (input: CampusInput) => backend().createCampus(input);
export const updateCampus = (id: string, input: Omit<CampusInput, "university_id">) => backend().updateCampus(id, input);
export const deleteCampus = (id: string) => backend().deleteCampus(id);
export const searchMess = (filters: MessFilters, page: number, limit: number) => backend().searchMess(filters, page, limit);
export const getMessDetail = (id: string) => backend().getMessDetail(id);
export const getMyMessListings = (page = 1) => backend().getMyMessListings(page);
export const upsertMess = (dto: UpsertMessDto) => backend().upsertMess(dto);
export const submitMess = (id: string) => backend().submitMess(id);
export const archiveMess = (id: string) => backend().archiveMess(id);
export const deleteMess = (id: string) => backend().deleteMess(id);
export const publishMess = (id: string) => backend().publishMess(id);
export const uploadMessMedia = (id: string, file: UploadInput, label: MediaLabel, displayOrder?: number) =>
  backend().uploadMessMedia(id, file, label, displayOrder);
export const deleteMessMedia = (mediaId: string) => backend().deleteMessMedia(mediaId);
export const setSeatStatus = (id: string, seatId: string, status: SeatStatus) => backend().setSeatStatus(id, seatId, status);
export const confirmAvailable = (id: string) => backend().confirmAvailable(id);
export const contactLister = (id: string, channel: ContactChannel) => backend().contactLister(id, channel);
export const reportMess = (id: string, reason: ReportReason, note?: string) => backend().reportMess(id, reason, note);
export const getSeatPreferences = () => backend().getSeatPreferences();
export const putSeatPreferences = (preferences: SeekerPreference) => backend().putSeatPreferences(preferences);
