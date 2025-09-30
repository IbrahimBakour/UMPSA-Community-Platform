import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { Report } from '../types';

const createReport = async (reportData: Partial<Report>): Promise<Report> => {
  const { data } = await api.post("/api/reports", reportData);
  return data;
};

const getReports = async (): Promise<Report[]> => {
    const { data } = await api.get("/api/reports");
    return data;
};

const resolveReport = async (reportId: string): Promise<void> => {
    await api.post(`/api/reports/${reportId}/resolve`);
};

const restrictUser = async (userId: string, restriction: any): Promise<void> => {
    await api.post(`/api/users/${userId}/restrict`, restriction);
};

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
    return useMutation<void, Error, { userId: string, restriction: any }>({
        mutationFn: ({ userId, restriction }) => restrictUser(userId, restriction),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
};