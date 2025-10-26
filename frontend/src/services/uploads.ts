
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

export const uploadClubMedia = async (clubId: string, files: { profilePicture?: File; banner?: File }): Promise<{ message: string; club?: { _id: string; name: string; profilePicture?: string; banner?: string }; uploadedFiles?: any[] }> => {
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

// Legacy export for backward compatibility - for post media
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("postMedia", file); // Use correct field name

  const response = await api.post(API_ENDPOINTS.UPLOAD_POST, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Return the path from the uploaded file
  return response.data.mediaUrls?.[0] || response.data.uploadedFiles?.[0]?.path || '';
};
