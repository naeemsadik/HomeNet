import apiClient from "./apiClient";
import type {
  ApiResponse,
  AssignPermissionDto,
  AssignRoleDto,
  Role,
  UserRole,
} from "@/types/api";

export async function getRoles() {
  const { data } = await apiClient.get<ApiResponse<Role[]>>("/v1/roles");
  return data;
}

export async function getRole(id: string) {
  const { data } = await apiClient.get<ApiResponse<Role>>(`/v1/roles/${id}`);
  return data;
}

export async function getUserRoles(userId: string) {
  const { data } = await apiClient.get<ApiResponse<UserRole[]>>(`/v1/roles/user/${userId}`);
  return data;
}

export async function assignRole(dto: AssignRoleDto) {
  const { data } = await apiClient.post<ApiResponse<unknown>>("/v1/roles/assign", dto);
  return data;
}

export async function revokeRole(dto: AssignRoleDto) {
  const { data } = await apiClient.delete<ApiResponse<unknown>>("/v1/roles/revoke", { data: dto });
  return data;
}

export async function assignPermission(roleId: string, dto: AssignPermissionDto) {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/v1/roles/${roleId}/permissions`,
    dto,
  );
  return data;
}

export async function revokePermission(roleId: string, permissionId: string) {
  const { data } = await apiClient.delete<ApiResponse<unknown>>(
    `/v1/roles/${roleId}/permissions/${permissionId}`,
  );
  return data;
}
