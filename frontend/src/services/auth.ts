import api from "./api";
import { AuthResponse } from "../types";

export const login = async (
  studentId: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/api/auth/login", {
    studentId,
    password,
  });
  return response.data;
};
