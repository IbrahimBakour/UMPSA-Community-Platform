import api from "./api";
import { AdminStats, AdminAnalytics, SystemHealth, UserActivity, PaginatedResponse } from "../types";
import { API_ENDPOINTS } from "../utils/constants";
import { useQuery } from "@tanstack/react-query";

// Get admin dashboard statistics
export const getDashboardStats = async (): Promise<AdminStats> => {
  const response = await api.get(API_ENDPOINTS.ADMIN_DASHBOARD);
  return response.data;
};

// React Query hooks
export const useDashboardStats = () => {
  return useQuery<AdminStats, Error>({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: getDashboardStats,
    refetchInterval: 60000, // Refetch every minute
  });
};

// Get admin analytics
export const getAdminAnalytics = async (params?: {
  days?: number;
}): Promise<AdminAnalytics> => {
  const response = await api.get(API_ENDPOINTS.ADMIN_ANALYTICS, { params });
  return response.data;
};

// Get admin activities
export const getAdminActivities = async (params?: {
  page?: number;
  limit?: number;
  days?: number;
}): Promise<PaginatedResponse<any>> => {
  const response = await api.get(API_ENDPOINTS.ADMIN_ACTIVITIES, { params });
  return response.data;
};

// Get user activity analytics
export const getUserActivityAnalytics = async (params?: {
  page?: number;
  limit?: number;
  days?: number;
}): Promise<PaginatedResponse<UserActivity>> => {
  const response = await api.get(API_ENDPOINTS.ADMIN_USER_ACTIVITY, { params });
  return response.data;
};

// Get system health
export const getSystemHealth = async (): Promise<SystemHealth> => {
  const response = await api.get(API_ENDPOINTS.ADMIN_SYSTEM_HEALTH);
  return response.data;
};
