import api from "./api";
import { Notification, PaginatedResponse, ApiResponse } from "../types";
import { API_ENDPOINTS } from "../utils/constants";

// Get user notifications
export const getUserNotifications = async (params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}): Promise<PaginatedResponse<Notification>> => {
  const response = await api.get<PaginatedResponse<Notification>>(
    API_ENDPOINTS.NOTIFICATIONS,
    { params }
  );
  return response.data;
};

// Get notification statistics
export const getNotificationStats = async (): Promise<{
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Array<{ _id: string; count: number }>;
  notificationsByPriority: Array<{ _id: string; count: number }>;
  recentNotifications: Notification[];
}> => {
  const response = await api.get(`${API_ENDPOINTS.NOTIFICATIONS}/stats`);
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(
    `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`
  );
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
  return response.data;
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(
    `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`
  );
  return response.data;
};

// Clean up expired notifications (admin only)
export const cleanupExpiredNotifications = async (): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`${API_ENDPOINTS.NOTIFICATIONS}/cleanup/expired`);
  return response.data;
};

// Get notification analytics (admin only)
export const getNotificationAnalytics = async (params?: {
  days?: number;
}): Promise<{
  totalNotifications: number;
  notificationsByType: Array<{ _id: string; count: number }>;
  notificationsByPriority: Array<{ _id: string; count: number }>;
  notificationsOverTime: Array<{ date: string; count: number }>;
}> => {
  const response = await api.get(`${API_ENDPOINTS.NOTIFICATIONS}/analytics`, { params });
  return response.data;
};
