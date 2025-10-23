import api from "./api";
import { AuthResponse, LoginForm, RegisterForm, User } from "../types";
import { API_ENDPOINTS } from "../utils/constants";

export const login = async (loginData: LoginForm): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(API_ENDPOINTS.LOGIN, loginData);
  return response.data;
};

export const register = async (registerData: RegisterForm): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(API_ENDPOINTS.REGISTER, registerData);
  return response.data;
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(API_ENDPOINTS.REFRESH);
  return response.data;
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
