import api from "./api";
import { Post, IPoll, ApiResponse } from "../types";
import { API_ENDPOINTS } from "../utils/constants";

// Vote on a poll
export const votePoll = async (postId: string, optionIndexes: number[]): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(
    `${API_ENDPOINTS.POLLS}/${postId}/vote`,
    { optionIndexes }
  );
  return response.data;
};

// Get poll results
export const getPollResults = async (postId: string): Promise<{
  poll: IPoll;
  isPollEnded: boolean;
  optionsWithPercentages: Array<{
    text: string;
    votes: number;
    percentage: number;
    voters: string[];
  }>;
  userVote?: number[];
}> => {
  const response = await api.get(`${API_ENDPOINTS.POLLS}/${postId}/results`);
  return response.data;
};

// Update poll (admin/author only)
export const updatePoll = async (postId: string, pollData: Partial<IPoll>): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(
    `${API_ENDPOINTS.POLLS}/${postId}`,
    pollData
  );
  return response.data;
};

// Delete poll (admin/author only)
export const deletePoll = async (postId: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`${API_ENDPOINTS.POLLS}/${postId}`);
  return response.data;
};

// Get all polls with filters
export const getAllPolls = async (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  author?: string;
}): Promise<{
  polls: Array<Post & { poll: IPoll }>;
  pagination: {
    totalPages: number;
    currentPage: number;
    totalPolls: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  const response = await api.get(API_ENDPOINTS.POLLS, { params });
  return response.data;
};

// Get poll analytics (admin only)
export const getPollAnalytics = async (params?: {
  days?: number;
}): Promise<{
  totalPolls: number;
  activePolls: number;
  totalVotes: number;
  pollsByType: Array<{ _id: string; count: number }>;
  votesOverTime: Array<{ date: string; count: number }>;
}> => {
  const response = await api.get(`${API_ENDPOINTS.POLLS}/analytics`, { params });
  return response.data;
};

// Get user poll history
export const getUserPollHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  polls: Array<Post & { poll: IPoll }>;
  pagination: {
    totalPages: number;
    currentPage: number;
    totalPolls: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  const response = await api.get(`${API_ENDPOINTS.POLLS}/history`, { params });
  return response.data;
};
