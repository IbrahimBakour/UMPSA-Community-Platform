import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import { Club, ClubPost, User, PaginatedResponse, CreateClubForm } from "../types";
import { API_ENDPOINTS } from "../utils/constants";
import toast from "react-hot-toast";

// API functions
const getClubs = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Club>> => {
  const response = await api.get(API_ENDPOINTS.CLUBS, { params });
  return response.data;
};

const getClub = async (clubId: string): Promise<Club> => {
  const response = await api.get(`${API_ENDPOINTS.CLUBS}/${clubId}`);
  return response.data;
};

const createClub = async (clubData: CreateClubForm): Promise<{ message: string; club: Club }> => {
  const response = await api.post(API_ENDPOINTS.CLUBS, clubData);
  return response.data;
};

const updateClub = async ({
  clubId,
  clubData,
}: {
  clubId: string;
  clubData: Partial<CreateClubForm>;
}): Promise<{ message: string; club: Club }> => {
  const response = await api.put(`${API_ENDPOINTS.CLUBS}/${clubId}`, clubData);
  return response.data;
};

const deleteClub = async (clubId: string): Promise<{ message: string }> => {
  const response = await api.delete(`${API_ENDPOINTS.CLUBS}/${clubId}`);
  return response.data;
};

const addMember = async ({
  clubId,
  userId,
}: {
  clubId: string;
  userId: string;
}): Promise<{ message: string; member: User }> => {
  const response = await api.post(`${API_ENDPOINTS.CLUBS}/${clubId}/members`, { userId });
  return response.data;
};

const removeMember = async ({
  clubId,
  memberId,
}: {
  clubId: string;
  memberId: string;
}): Promise<{ message: string }> => {
  const response = await api.delete(`${API_ENDPOINTS.CLUBS}/${clubId}/members/${memberId}`);
  return response.data;
};

// React Query hooks
export const useClubs = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery<PaginatedResponse<Club>, Error>({
    queryKey: ["clubs", params],
    queryFn: () => getClubs(params),
  });
};

export const useClub = (clubId: string) => {
  return useQuery<Club, Error>({
    queryKey: ["club", clubId],
    queryFn: () => getClub(clubId),
    enabled: !!clubId,
  });
};

export const useCreateClub = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; club: Club }, Error, CreateClubForm>({
    mutationFn: createClub,
    onSuccess: () => {
      toast.success("Club created successfully!");
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: () => {
      toast.error("Failed to create club. Please try again.");
    },
  });
};

export const useUpdateClub = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; club: Club }, Error, Partial<CreateClubForm>>({
    mutationFn: (clubData) => updateClub({ clubId, clubData }),
    onSuccess: () => {
      toast.success("Club updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: () => {
      toast.error("Failed to update club. Please try again.");
    },
  });
};

export const useDeleteClub = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: deleteClub,
    onSuccess: () => {
      toast.success("Club deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: () => {
      toast.error("Failed to delete club. Please try again.");
    },
  });
};

export const useAddMember = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; member: User }, Error, string>({
    mutationFn: (userId) => addMember({ clubId, userId }),
    onSuccess: () => {
      toast.success("Member added successfully!");
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: () => {
      toast.error("Failed to add member. Please try again.");
    },
  });
};

export const useRemoveMember = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (memberId) => removeMember({ clubId, memberId }),
    onSuccess: () => {
      toast.success("Member removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: () => {
      toast.error("Failed to remove member. Please try again.");
    },
  });
};
