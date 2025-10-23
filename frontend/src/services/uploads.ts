
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

export const uploadClubMedia = async (files: { profilePicture?: File; banner?: File }): Promise<{ message: string; urls: { profilePicture?: string; banner?: string } }> => {
  const formData = new FormData();
  if (files.profilePicture) formData.append("profilePicture", files.profilePicture);
  if (files.banner) formData.append("banner", files.banner);

  const response = await api.post(API_ENDPOINTS.UPLOAD_CLUB, formData, {
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
  const response = await api.delete(`${API_ENDPOINTS.UPLOADS}/delete`, {
    data: { fileUrl }
  });
  return response.data;
};

export const getFileInfo = async (fileUrl: string): Promise<{ message: string; fileInfo: any }> => {
  const response = await api.get(`${API_ENDPOINTS.UPLOADS}/info`, {
    params: { fileUrl }
  });
  return response.data;
};

// Legacy export for backward compatibility
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(API_ENDPOINTS.UPLOADS, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url;
};
