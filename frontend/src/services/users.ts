import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import { User, PaginatedResponse, UserStats, UserActivity } from "../types";
import { API_ENDPOINTS } from "../utils/constants";
import toast from "react-hot-toast";

const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<PaginatedResponse<User>> => {
  const response = await api.get(API_ENDPOINTS.USERS, { params });
  return response.data;
};

const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get(
    API_ENDPOINTS.USER_PUBLIC_PROFILE.replace(":userId", userId)
  );
  return response.data;
};

const getPublicUserProfile = async (userId: string): Promise<User> => {
  const response = await api.get(
    API_ENDPOINTS.USER_PUBLIC_PROFILE.replace(":userId", userId)
  );
  return response.data;
};

const updateUserRole = async ({
  userId,
  role,
}: {
  userId: string;
  role: string;
}): Promise<{ message: string; user: User }> => {
  const response = await api.put(`${API_ENDPOINTS.USERS}/${userId}/role`, {
    role,
  });
  return response.data;
};

const updateUserStatus = async ({
  userId,
  status,
}: {
  userId: string;
  status: string;
}): Promise<{ message: string; user: User }> => {
  const response = await api.put(`${API_ENDPOINTS.USERS}/${userId}/status`, {
    status,
  });
  return response.data;
};

const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get(API_ENDPOINTS.USER_STATS);
  return response.data;
};

const getUserActivity = async (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    days?: number;
  }
): Promise<PaginatedResponse<UserActivity>> => {
  const response = await api.get(`${API_ENDPOINTS.USERS}/${userId}/activity`, {
    params,
  });
  return response.data;
};

const deleteUser = async (userId: string): Promise<{ message: string }> => {
  const response = await api.delete(`${API_ENDPOINTS.USERS}/${userId}`);
  return response.data;
};

export const useAllUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: ["users", params],
    queryFn: () => getAllUsers(params),
  });
};

export const useUserById = (userId: string) => {
  return useQuery<User, Error>({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; user: User },
    Error,
    { userId: string; role: string }
  >({
    mutationFn: updateUserRole,
    onSuccess: (_, variables) => {
      toast.success(`User role updated to ${variables.role}!`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    },
    onError: () => {
      toast.error("Failed to update user role. Please try again.");
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; user: User },
    Error,
    { userId: string; status: string }
  >({
    mutationFn: updateUserStatus,
    onSuccess: (_, variables) => {
      toast.success(`User status updated to ${variables.status}!`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    },
    onError: () => {
      toast.error("Failed to update user status. Please try again.");
    },
  });
};

export const useUserStats = () => {
  return useQuery<UserStats, Error>({
    queryKey: ["userStats"],
    queryFn: () => getUserStats(),
  });
};

export const useUserActivity = (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    days?: number;
  }
) => {
  return useQuery<PaginatedResponse<UserActivity>, Error>({
    queryKey: ["userActivity", userId, params],
    queryFn: () => getUserActivity(userId, params),
    enabled: !!userId,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Failed to delete user. Please try again.");
    },
  });
};

// Legacy exports for backward compatibility
export const useUsers = useAllUsers;
export const useSearchUsers = (searchTerm: string) => {
  return useAllUsers({ search: searchTerm });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Partial<User>>({
    mutationFn: async (userData) => {
      const response = await api.put(API_ENDPOINTS.USER_PROFILE, userData);
      // Backend returns { message, user }, so unwrap the user object
      return response.data.user ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
export const usePromoteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; user: User },
    Error,
    { userId: string; role: string }
  >({
    mutationFn: async ({ userId, role }) => {
      const response = await api.put(`${API_ENDPOINTS.USERS}/${userId}/role`, {
        role,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
