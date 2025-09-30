import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import api from "./api";
import { FeedPost, Comment, Poll, Event } from "../types";
import toast from "react-hot-toast";
// import { get } from "react-hook-form";

interface CreatePostPayload {
  content: string;
  images?: string[];
  poll?: Poll;
  event?: Event;
}

// API functions
const getFeedPosts = async ({
  pageParam = 1,
  limit = 10,
}): Promise<{ posts: FeedPost[]; nextPage: number | null }> => {
  const { data } = await api.get(
    `/api/posts/club/68dadf9c9d7f65f91a877f81?page=${pageParam}&limit=${limit}`
  );
  return data.posts;
};

const createFeedPost = async (
  postData: CreatePostPayload
): Promise<FeedPost> => {
  const { data } = await api.post("/feed", postData);
  return data;
};

const getPendingFeedPosts = async (): Promise<FeedPost[]> => {
  const { data } = await api.get("/feed/pending");
  return data;
};

const approveFeedPost = async (postId: string): Promise<void> => {
  await api.post(`/feed/${postId}/approve`);
};

const rejectFeedPost = async (postId: string): Promise<void> => {
  await api.post(`/feed/${postId}/reject`);
};

const deleteFeedPost = async (postId: string): Promise<void> => {
  await api.delete(`/feed/${postId}`);
};

const addComment = async ({
  postId,
  content,
}: {
  postId: string;
  content: string;
}): Promise<Comment> => {
  const { data } = await api.post(`/api/posts/${postId}/comments`, {
    content,
  });
  return data;
};

const addReaction = async ({
  postId,
  reaction,
}: {
  postId: string;
  reaction: string;
}): Promise<void> => {
  await api.post(`/api/posts/${postId}/like`, { reaction });
};

// React Query hooks
export const useFeedPosts = () => {
  return useInfiniteQuery<
    { posts: FeedPost[]; nextPage: number | null },
    Error
  >({
    queryKey: ["feedPosts"],
    queryFn: () => getFeedPosts({ pageParam: 1, limit: 10 }),
    initialPageParam: 1, // ✅ required in React Query v5
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export const useCreateFeedPost = (
  isAdmin: boolean,
  closeModal: () => void,
  reset: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation<FeedPost, Error, CreatePostPayload>({
    mutationFn: createFeedPost,
    onSuccess: () => {
      if (isAdmin) {
        toast.success("Post created successfully!");
      } else {
        toast.success("Your post is submitted for review");
      }
      reset();
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
    onError: () => {
      toast.error("Failed to create post. Please try again.");
    },
  });
};

export const usePendingFeedPosts = () => {
  return useQuery<FeedPost[], Error>({
    queryKey: ["pendingFeedPosts"],
    queryFn: getPendingFeedPosts,
  });
};

export const useApproveFeedPost = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: approveFeedPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingFeedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
  });
};

export const useRejectFeedPost = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: rejectFeedPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingFeedPosts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteFeedPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFeedPosts"] });
    },
  });
};

export const useAddComment = (postType: "feed" | "club", postId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, string>({
    mutationFn: (content) => addComment({ postId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] }); // This could be more specific
      queryClient.invalidateQueries({
        queryKey: ["clubPosts", postType === "club" ? postId : undefined],
      });
    },
  });
};

export const useAddReaction = (postType: "feed" | "club", postId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (reaction) => addReaction({ postId, reaction }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] }); // This could be more specific
      queryClient.invalidateQueries({
        queryKey: ["clubPosts", postType === "club" ? postId : undefined],
      });
    },
  });
};
