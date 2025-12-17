import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import {
  FeedPost,
  ClubPost,
  Comment,
  IReaction,
  CreatePostForm,
  PaginatedResponse,
} from "../types";
import { API_ENDPOINTS } from "../utils/constants";
import toast from "react-hot-toast";

// API functions
const getFeedPosts = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<FeedPost>> => {
  const response = await api.get(API_ENDPOINTS.FEED_POSTS, { params });
  return response.data;
};

const getClubPosts = async (
  clubId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<ClubPost>> => {
  const response = await api.get(
    API_ENDPOINTS.CLUB_POSTS.replace(":clubId", clubId),
    { params }
  );
  return response.data;
};

const createFeedPost = async (
  postData: CreatePostForm
): Promise<{ message: string; post: FeedPost }> => {
  const response = await api.post(API_ENDPOINTS.FEED_POSTS, postData);
  return response.data;
};

const createClubPost = async (
  clubId: string,
  postData: CreatePostForm
): Promise<{ message: string; post: ClubPost }> => {
  const response = await api.post(
    API_ENDPOINTS.CLUB_POST_CREATE.replace(":clubId", clubId),
    postData
  );
  return response.data;
};

const getPendingFeedPosts = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<FeedPost>> => {
  const response = await api.get(API_ENDPOINTS.FEED_PENDING_POSTS, { params });
  return response.data;
};

const approveFeedPost = async (
  postId: string
): Promise<{ message: string; post: FeedPost }> => {
  const response = await api.post(
    API_ENDPOINTS.FEED_POST_APPROVE.replace(":id", postId)
  );
  return response.data;
};

const rejectFeedPost = async (
  postId: string,
  reason?: string
): Promise<{ message: string; reason: string }> => {
  const response = await api.post(
    API_ENDPOINTS.FEED_POST_REJECT.replace(":id", postId),
    { reason }
  );
  return response.data;
};

const deletePost = async (postId: string): Promise<{ message: string }> => {
  const response = await api.delete(
    API_ENDPOINTS.POST_DELETE.replace(":id", postId)
  );
  return response.data;
};

const getPostById = async (postId: string): Promise<FeedPost | ClubPost> => {
  const response = await api.get(
    API_ENDPOINTS.POST_DELETE.replace(":id", postId).replace("/delete", "")
  );
  return response.data;
};

const addComment = async (
  postId: string,
  content: string
): Promise<{ message: string; comment: Comment }> => {
  const response = await api.post(
    API_ENDPOINTS.POST_COMMENT_CREATE.replace(":id", postId),
    {
      content,
    }
  );
  return response.data;
};

const addReaction = async (
  postId: string,
  reactionType: string
): Promise<{
  message: string;
  reactionType: string | null;
  reactionCounts: Record<string, number>;
  totalReactions: number;
}> => {
  const response = await api.post(
    API_ENDPOINTS.POST_REACTIONS.replace(":id", postId),
    {
      reactionType,
    }
  );
  return response.data;
};

const getPostReactions = async (
  postId: string
): Promise<{
  reactions: IReaction[];
  reactionCounts: Record<string, number>;
  totalReactions: number;
}> => {
  const response = await api.get(
    API_ENDPOINTS.POST_REACTIONS.replace(":id", postId)
  );
  return response.data;
};

const getComments = async (
  postId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<Comment>> => {
  const response = await api.get(
    API_ENDPOINTS.POST_COMMENTS.replace(":postId", postId),
    { params }
  );
  return response.data;
};

// React Query hooks
export const useFeedPosts = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery<PaginatedResponse<FeedPost>, Error>({
    queryKey: ["feedPosts", params],
    queryFn: () => getFeedPosts(params),
  });
};

export const useClubPosts = (
  clubId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery<PaginatedResponse<ClubPost>, Error>({
    queryKey: ["clubPosts", clubId, params],
    queryFn: () => getClubPosts(clubId, params),
    enabled: !!clubId,
  });
};

export const useCreateFeedPost = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; post: FeedPost },
    Error,
    CreatePostForm
  >({
    mutationFn: createFeedPost,
    onSuccess: (data) => {
      if (data.post.status === "approved") {
        toast.success("Post created and published successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
    onError: () => {
      toast.error("Failed to create post. Please try again.");
    },
  });
};

export const useCreateClubPost = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; post: ClubPost },
    Error,
    CreatePostForm
  >({
    mutationFn: (postData) => createClubPost(clubId, postData),
    onSuccess: () => {
      toast.success("Club post created successfully!");
      queryClient.invalidateQueries({ queryKey: ["clubPosts", clubId] });
    },
    onError: () => {
      toast.error("Failed to create club post. Please try again.");
    },
  });
};

export const usePendingFeedPosts = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery<PaginatedResponse<FeedPost>, Error>({
    queryKey: ["pendingFeedPosts", params],
    queryFn: () => getPendingFeedPosts(params),
  });
};

export const useApproveFeedPost = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; post: FeedPost }, Error, string>({
    mutationFn: approveFeedPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingFeedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
    onError: () => {
      toast.error("Failed to approve post. Please try again.");
    },
  });
};

export const useRejectFeedPost = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; reason: string },
    Error,
    { postId: string; reason?: string }
  >({
    mutationFn: ({ postId, reason }) => rejectFeedPost(postId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingFeedPosts"] });
    },
    onError: () => {
      toast.error("Failed to reject post. Please try again.");
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["clubPosts"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFeedPosts"] });
    },
    onError: () => {
      toast.error("Failed to delete post. Please try again.");
    },
  });
};

export const useAddComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; comment: Comment }, Error, string>({
    mutationFn: (content) => addComment(postId, content),
    onSuccess: () => {
      toast.success("Comment added successfully!");
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["clubPosts"] });
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => {
      toast.error("Failed to add comment. Please try again.");
    },
  });
};

export const useAddReaction = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    {
      message: string;
      reactionType: string | null;
      reactionCounts: Record<string, number>;
      totalReactions: number;
    },
    Error,
    string
  >({
    mutationFn: (reactionType) => addReaction(postId, reactionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["clubPosts"] });
      queryClient.invalidateQueries({ queryKey: ["reactions", postId] });
    },
    onError: () => {
      toast.error("Failed to add reaction. Please try again.");
    },
  });
};

export const usePostReactions = (postId: string) => {
  return useQuery<
    {
      reactions: IReaction[];
      reactionCounts: Record<string, number>;
      totalReactions: number;
    },
    Error
  >({
    queryKey: ["reactions", postId],
    queryFn: () => getPostReactions(postId),
    enabled: !!postId,
  });
};

export const useComments = (
  postId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery<PaginatedResponse<Comment>, Error>({
    queryKey: ["comments", postId, params],
    queryFn: () => getComments(postId, params),
    enabled: !!postId,
  });
};

export const usePostById = (postId: string) => {
  return useQuery<FeedPost | ClubPost, Error>({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};
