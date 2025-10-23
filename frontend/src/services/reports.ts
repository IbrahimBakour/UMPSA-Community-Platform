import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { Report, CreateReportForm, PaginatedResponse } from '../types';
import { API_ENDPOINTS } from '../utils/constants';
import toast from 'react-hot-toast';

const createReport = async (reportData: CreateReportForm): Promise<{ message: string; report: Report }> => {
  const response = await api.post(API_ENDPOINTS.REPORTS, reportData);
  return response.data;
};

const getReports = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  targetType?: string;
}): Promise<PaginatedResponse<Report>> => {
  const response = await api.get(API_ENDPOINTS.REPORTS, { params });
  return response.data;
};

const getReportById = async (reportId: string): Promise<Report> => {
  const response = await api.get(`${API_ENDPOINTS.REPORTS}/${reportId}`);
  return response.data;
};

const updateReport = async ({
  reportId,
  reportData,
}: {
  reportId: string;
  reportData: Partial<Report>;
}): Promise<{ message: string; report: Report }> => {
  const response = await api.put(`${API_ENDPOINTS.REPORTS}/${reportId}`, reportData);
  return response.data;
};

const restrictUserFromReport = async (reportId: string): Promise<{ message: string }> => {
  const response = await api.post(`${API_ENDPOINTS.REPORTS}/${reportId}/restrictUser`);
  return response.data;
};

const unrestrictUserFromReport = async (reportId: string): Promise<{ message: string }> => {
  const response = await api.post(`${API_ENDPOINTS.REPORTS}/${reportId}/unrestrictUser`);
  return response.data;
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; report: Report }, Error, CreateReportForm>({
    mutationFn: createReport,
    onSuccess: () => {
      toast.success("Report submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: () => {
      toast.error("Failed to submit report. Please try again.");
    },
  });
};

export const useReports = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  targetType?: string;
}) => {
  return useQuery<PaginatedResponse<Report>, Error>({
    queryKey: ['reports', params],
    queryFn: () => getReports(params),
  });
};

export const useReportById = (reportId: string) => {
  return useQuery<Report, Error>({
    queryKey: ['report', reportId],
    queryFn: () => getReportById(reportId),
    enabled: !!reportId,
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; report: Report }, Error, { reportId: string; reportData: Partial<Report> }>({
    mutationFn: updateReport,
    onSuccess: (data, variables) => {
      toast.success("Report updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
    onError: () => {
      toast.error("Failed to update report. Please try again.");
    },
  });
};

export const useRestrictUserFromReport = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: restrictUserFromReport,
    onSuccess: () => {
      toast.success("User restricted successfully!");
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error("Failed to restrict user. Please try again.");
    },
  });
};

export const useUnrestrictUserFromReport = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: unrestrictUserFromReport,
    onSuccess: () => {
      toast.success("User unrestricted successfully!");
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error("Failed to unrestrict user. Please try again.");
    },
  });
};