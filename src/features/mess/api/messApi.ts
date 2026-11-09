/**
 * The mess API (PRD v1.0, section 2.3), one function per endpoint.
 *
 * Listing media, submit and saved listings reuse the existing /v1/properties
 * routes: a mess listing is a Property row. With MESS_FIXTURES on, every call is
 * answered by the in-memory demo backend in ./fixtures instead.
 */
import apiClient, { ApiError } from "@/services/apiClient";
import { deletePropertyMedia, submitProperty, uploadPropertyMedia } from "@/services/propertyApi";
import type { UploadInput } from "@/services/upload";
import { MESS_FIXTURES } from "@/lib/features";
import type { ApiResponse } from "@/types/api";
import type { PaginatedResponse } from "@/features/property/types/property";
import { toApiParams } from "../utils/filterParams";
import type {
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
  UpsertMessDto,
} from "../types/mess";
import { fixtureBackend } from "./fixtures/server";

export interface MessBackend {
  getUniversities(): Promise<University[]>;
  searchMess(filters: MessFilters, page: number, limit: number): Promise<PaginatedResponse<MessCard>>;
  getMessDetail(id: string): Promise<MessDetail>;
  getMyMessListings(): Promise<PaginatedResponse<MyMessListing>>;
  upsertMess(dto: UpsertMessDto): Promise<MessMutationResult>;
  submitMess(id: string): Promise<MessMutationResult>;
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

  async getMyMessListings() {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<MyMessListing>>>("/v1/mess/my", {
      params: { page: 1, limit: 50 },
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

const backend = (): MessBackend => (MESS_FIXTURES ? fixtureBackend : httpBackend);

export const getUniversities = () => backend().getUniversities();
export const searchMess = (filters: MessFilters, page: number, limit: number) => backend().searchMess(filters, page, limit);
export const getMessDetail = (id: string) => backend().getMessDetail(id);
export const getMyMessListings = () => backend().getMyMessListings();
export const upsertMess = (dto: UpsertMessDto) => backend().upsertMess(dto);
export const submitMess = (id: string) => backend().submitMess(id);
export const uploadMessMedia = (id: string, file: UploadInput, label: MediaLabel, displayOrder?: number) =>
  backend().uploadMessMedia(id, file, label, displayOrder);
export const deleteMessMedia = (mediaId: string) => backend().deleteMessMedia(mediaId);
export const setSeatStatus = (id: string, seatId: string, status: SeatStatus) => backend().setSeatStatus(id, seatId, status);
export const confirmAvailable = (id: string) => backend().confirmAvailable(id);
export const contactLister = (id: string, channel: ContactChannel) => backend().contactLister(id, channel);
export const reportMess = (id: string, reason: ReportReason, note?: string) => backend().reportMess(id, reason, note);
export const getSeatPreferences = () => backend().getSeatPreferences();
export const putSeatPreferences = (preferences: SeekerPreference) => backend().putSeatPreferences(preferences);
