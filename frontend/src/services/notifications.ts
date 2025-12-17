/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import { Notification, ApiResponse, NotificationAnalytics } from "../types";
import { API_ENDPOINTS } from "../utils/constants";
import toast from "react-hot-toast";

// Get user notifications
export const getUserNotifications = async (params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
}): Promise<{ notifications: Notification[]; pagination: any }> => {
  const response = await api.get<{
    notifications: Notification[];
    pagination: any;
  }>(API_ENDPOINTS.NOTIFICATIONS, { params });
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
export const markNotificationAsRead = async (
  notificationId: string
): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(
    API_ENDPOINTS.NOTIFICATION_READ.replace(":notificationId", notificationId)
  );
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(
    API_ENDPOINTS.NOTIFICATION_READ_ALL
  );
  return response.data;
};

// Delete notification
export const deleteNotification = async (
  notificationId: string
): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(
    API_ENDPOINTS.NOTIFICATION_DELETE.replace(":notificationId", notificationId)
  );
  return response.data;
};

// Clean up expired notifications (admin only)
export const cleanupExpiredNotifications = async (): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(
    API_ENDPOINTS.NOTIFICATION_CLEANUP
  );
  return response.data;
};

// Get notification analytics (admin only)
export const getNotificationAnalytics = async (params?: {
  days?: number;
}): Promise<NotificationAnalytics> => {
  const response = await api.get(API_ENDPOINTS.NOTIFICATION_ANALYTICS, {
    params,
  });
  return response.data;
};

// React Query hooks
export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
}) => {
  return useQuery<{ notifications: Notification[]; pagination: any }, Error>({
    queryKey: ["notifications", params],
    queryFn: () => getUserNotifications(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: ["notifications", "stats"],
    queryFn: getNotificationStats,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, string>({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error>({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, string>({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });
};
