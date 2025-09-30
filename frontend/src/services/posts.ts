import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { FeedPost, Comment, Reaction } from '../types';

// API functions
const getFeedPosts = async (): Promise<FeedPost[]> => {
  const { data } = await api.get('/feed');
  return data;
};

const createFeedPost = async (content: string): Promise<FeedPost> => {
  const { data } = await api.post('/feed', { content });
  return data;
};

const getPendingFeedPosts = async (): Promise<FeedPost[]> => {
  const { data } = await api.get('/feed/pending');
  return data;
};

const approveFeedPost = async (postId: string): Promise<void> => {
  await api.post(`/feed/${postId}/approve`);
};

const deleteFeedPost = async (postId: string): Promise<void> => {
  await api.delete(`/feed/${postId}`);
};

const addComment = async ({ postType, postId, content }: { postType: 'feed' | 'club', postId: string, content: string }): Promise<Comment> => {
  const { data } = await api.post(`/posts/${postType}/${postId}/comments`, { content });
  return data;
};

const addReaction = async ({ postType, postId, reaction }: { postType: 'feed' | 'club', postId: string, reaction: Reaction['reaction'] }): Promise<void> => {
  await api.post(`/posts/${postType}/${postId}/reactions`, { reaction });
};

// React Query hooks
export const useFeedPosts = () => {
  return useQuery<FeedPost[], Error>({
    queryKey: ['feedPosts'],
    queryFn: getFeedPosts,
  });
};

export const useCreateFeedPost = () => {
  const queryClient = useQueryClient();
  return useMutation<FeedPost, Error, string>({
    mutationFn: createFeedPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
    },
  });
};

export const usePendingFeedPosts = () => {
  return useQuery<FeedPost[], Error>({
    queryKey: ['pendingFeedPosts'],
    queryFn: getPendingFeedPosts,
  });
};

export const useApproveFeedPost = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: approveFeedPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingFeedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteFeedPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['pendingFeedPosts'] });
    },
  });
};

export const useAddComment = (postType: 'feed' | 'club', postId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, string>({
    mutationFn: (content) => addComment({ postType, postId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] }); // This could be more specific
      queryClient.invalidateQueries({ queryKey: ['clubPosts', (postType === 'club' ? postId : undefined)] });
    },
  });
};

export const useAddReaction = (postType: 'feed' | 'club', postId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Reaction['reaction']>({
    mutationFn: (reaction) => addReaction({ postType, postId, reaction }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] }); // This could be more specific
      queryClient.invalidateQueries({ queryKey: ['clubPosts', (postType === 'club' ? postId : undefined)] });
    },
  });
};
