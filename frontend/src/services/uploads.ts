
import api from "./api";
import { API_ENDPOINTS } from "../utils/constants";

export const uploadProfilePicture = async (file: File): Promise<{ message: string; url: string }> => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const response = await api.post(API_ENDPOINTS.UPLOAD_PROFILE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadClubMedia = async (clubId: string, files: { profilePicture?: File; banner?: File }): Promise<{ message: string; urls: { profilePicture?: string; banner?: string } }> => {
  const formData = new FormData();
  if (files.profilePicture) formData.append("profilePicture", files.profilePicture);
  if (files.banner) formData.append("banner", files.banner);

  const response = await api.post(API_ENDPOINTS.UPLOAD_CLUB.replace(':clubId', clubId), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadPostMedia = async (files: File[]): Promise<{ message: string; urls: string[] }> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("postMedia", file);
  });

  const response = await api.post(API_ENDPOINTS.UPLOAD_POST, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteFile = async (fileUrl: string): Promise<{ message: string }> => {
  const response = await api.delete(API_ENDPOINTS.UPLOAD_DELETE, {
    data: { fileUrl }
  });
  return response.data;
};

export const getFileInfo = async (filePath: string): Promise<{ message: string; fileInfo: any }> => {
  const response = await api.get(API_ENDPOINTS.UPLOAD_INFO.replace(':filePath', filePath));
  return response.data;
};

// Legacy export for backward compatibility
// This function appears to be a legacy export for backward compatibility, as per the comment above.
// It's not strictly needed if all usages of `uploadFile` have been replaced with the newer, more specific upload functions (e.g., uploadPostMedia, uploadClubMedia).
// If no code in your project imports/uses `uploadFile`, or all usage has been migrated away, you can safely delete this function.
