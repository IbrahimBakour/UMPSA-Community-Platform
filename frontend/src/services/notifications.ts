import api from "./api";
import { Notification, PaginatedResponse, ApiResponse, NotificationAnalytics } from "../types";
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
  const response = await api.get(`${API_ENDPOINTS.NOTIFICATION_STATS}`);
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(
    API_ENDPOINTS.NOTIFICATION_READ.replace(':notificationId', notificationId)
  );
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(API_ENDPOINTS.NOTIFICATION_READ_ALL);
  return response.data;
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(
    API_ENDPOINTS.NOTIFICATION_DELETE.replace(':notificationId', notificationId)
  );
  return response.data;
};

// Clean up expired notifications (admin only)
export const cleanupExpiredNotifications = async (): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(API_ENDPOINTS.NOTIFICATION_CLEANUP);
  return response.data;
};

// Get notification analytics (admin only)
export const getNotificationAnalytics = async (params?: {
  days?: number;
}): Promise<NotificationAnalytics> => {
  const response = await api.get(API_ENDPOINTS.NOTIFICATION_ANALYTICS, { params });
  return response.data;
};
