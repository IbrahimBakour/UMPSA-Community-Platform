import api from "./api";
import { AuthResponse, LoginForm, RegisterForm, User } from "../types";
import { API_ENDPOINTS } from "../utils/constants";

export const login = async (loginData: LoginForm): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(API_ENDPOINTS.LOGIN, loginData);
  return response.data;
};

// Note: Register endpoint not implemented in backend - using import instead
export const register = async (_registerData: RegisterForm): Promise<AuthResponse> => {
  throw new Error("Registration not implemented. Use admin import instead.");
};

// Note: Refresh endpoint not implemented in backend
export const refreshToken = async (): Promise<AuthResponse> => {
  throw new Error("Token refresh not implemented in backend.");
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>(API_ENDPOINTS.USER_PROFILE);
  return response.data;
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put<User>(API_ENDPOINTS.USER_PROFILE, userData);
  return response.data;
};

export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(API_ENDPOINTS.USER_CHANGE_PASSWORD, passwordData);
  return response.data;
};

// Admin-only function for importing users
export const importUsers = async (file: File): Promise<{ message: string; imported: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ message: string; imported: number }>(API_ENDPOINTS.IMPORT_USERS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
