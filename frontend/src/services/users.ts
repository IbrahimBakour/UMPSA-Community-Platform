
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { User } from '../types';

const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get("/api/users");
  return data;
};

const searchUsers = async (searchTerm: string): Promise<User[]> => {
  const { data } = await api.get(`/api/users/search?q=${searchTerm}`);
  return data;
};

const updateUser = async (userData: Partial<User>): Promise<User> => {
  const { data } = await api.put(`/api/users/me`, userData);
  return data;
};

const promoteUser = async (userId: string): Promise<User> => {
  const { data } = await api.post(`/api/users/${userId}/promote`);
  return data;
};

const assignUserToClub = async ({ userId, clubId }: { userId: string, clubId: string }): Promise<User> => {
  const { data } = await api.post(`/api/users/${userId}/assign-club`, { clubId });
  return data;
};

export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: getUsers,
  });
};

export const useSearchUsers = (searchTerm: string) => {
  return useQuery<User[], Error>({
    queryKey: ['users', searchTerm],
    queryFn: () => searchUsers(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Partial<User>>({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
};

export const usePromoteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, string>({
    mutationFn: promoteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useAssignUserToClub = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { userId: string, clubId: string }>({
    mutationFn: assignUserToClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
