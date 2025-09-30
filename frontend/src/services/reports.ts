import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { Report } from '../types';

// API functions
const createReport = async (reportData: Partial<Report>): Promise<Report> => {
  const { data } = await api.post('/reports', reportData);
  return data;
};

const getReports = async (): Promise<Report[]> => {
  const { data } = await api.get('/reports');
  return data;
};

const resolveReport = async (reportId: string): Promise<void> => {
  await api.post(`/reports/${reportId}/resolve`);
};

const restrictUser = async (userId: string): Promise<void> => {
  await api.post(`/users/${userId}/restrict`);
};

// React Query hooks
export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation<Report, Error, Partial<Report>>({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useReports = () => {
  return useQuery<Report[], Error>({
    queryKey: ['reports'],
    queryFn: getReports,
  });
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useRestrictUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: restrictUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      // You might want to invalidate user queries as well
    },
  });
};
