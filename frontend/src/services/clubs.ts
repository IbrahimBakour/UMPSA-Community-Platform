import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import { Club, ClubPost, User } from "../types";

// API functions
const getClubs = async (): Promise<Club[]> => {
  const { data } = await api.get("/api/clubs");
  return data;
};

const getClub = async (clubId: string): Promise<Club> => {
  const { data } = await api.get(`/api/clubs/${clubId}`);
  return data;
};

const createClub = async (clubData: Partial<Club>): Promise<Club> => {
  const { data } = await api.post("/api/clubs", clubData);
  return data;
};

const addMember = async ({
  clubId,
  userId,
}: {
  clubId: string;
  userId: string;
}): Promise<User> => {
  const { data } = await api.post(`/api/clubs/${clubId}/members`, { userId });
  return data;
};

const getClubPosts = async (clubId: string): Promise<ClubPost[]> => {
  const { data } = await api.get(`/api/clubs/${clubId}/posts`);
  return data;
};

const createClubPost = async ({
  clubId,
  content,
}: {
  clubId: string;
  content: string;
}): Promise<ClubPost> => {
  const { data } = await api.post(`/api/clubs/${clubId}/posts`, { content });
  return data;
};

// React Query hooks
export const useClubs = () => {
  return useQuery<Club[], Error>({
    queryKey: ["clubs"],
    queryFn: getClubs,
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
  return useMutation<Club, Error, Partial<Club>>({
    mutationFn: createClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
};

export const useAddMember = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, string>({
    mutationFn: (userId) => addMember({ clubId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
};

export const useClubPosts = (clubId: string) => {
  return useQuery<ClubPost[], Error>({
    queryKey: ["clubPosts", clubId],
    queryFn: () => getClubPosts(clubId),
    enabled: !!clubId,
  });
};

export const useCreateClubPost = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ClubPost, Error, string>({
    mutationFn: (content) => createClubPost({ clubId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubPosts", clubId] });
    },
  });
};
