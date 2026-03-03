import { apiClient } from "./api";
import type { ProfileFormData, PasswordFormData } from "@/types/profile";
import type { CurrentUser } from "@/types/auth";

export const editUserProfile = async (
  id: string,
  body: ProfileFormData,
): Promise<CurrentUser> => {
  const response = await apiClient(`/users/${id}/profile`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  const data: CurrentUser = await response.json();
  return data;
};

export const changeCurrentUserPassword = async (
  body: PasswordFormData,
): Promise<void> => {
  await apiClient("/currentUser/password", {
    method: "PUT",
    body: JSON.stringify({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    }),
  });
};
