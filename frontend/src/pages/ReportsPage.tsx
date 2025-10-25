import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCreateReport, useReports, useUpdateReport, useRestrictUserFromReport } from '../services/reports';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

const reportSchema = z.object({
  targetType: z.enum(['user', 'post', 'club']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string().min(1, 'Reason cannot be empty'),
});

type ReportFormInputs = z.infer<typeof reportSchema>;

const ReportsPage = () => {
  const { isAdmin } = useAuth();
  const createReportMutation = useCreateReport();
  const { data: reportsData, isLoading, error } = useReports();
  const updateReportMutation = useUpdateReport();
  const restrictUserMutation = useRestrictUserFromReport();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isResolveConfirmationOpen, setResolveConfirmationOpen] = useState(false);
  const [isRestrictConfirmationOpen, setRestrictConfirmationOpen] = useState(false);
  
  // Handle response structure
  const reports = reportsData?.reports || reportsData?.data || [];
  const reportsArray = Array.isArray(reports) ? reports : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormInputs>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = (data: ReportFormInputs) => {
    createReportMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Report submitted successfully!');
        reset();
      },
      onError: () => {
        toast.error('Failed to submit report. Please try again.');
      },
    });
  };

  const handleResolve = () => {
    if (selectedReportId) {
      updateReportMutation.mutate({ 
        reportId: selectedReportId, 
        reportData: { status: 'resolved' } 
      }, {
        onSuccess: () => {
          toast.success('Report resolved successfully!');
          setSelectedReportId(null);
          setResolveConfirmationOpen(false);
        },
        onError: () => {
          toast.error('Failed to resolve report. Please try again.');
        },
      });
    }
  };

  const handleRestrictUser = () => {
    if (selectedReportId) {
      restrictUserMutation.mutate(selectedReportId, {
        onSuccess: () => {
          toast.success('User restricted successfully!');
          setSelectedReportId(null);
          setRestrictConfirmationOpen(false);
        },
        onError: () => {
          toast.error('Failed to restrict user. Please try again.');
        },
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h1 className="text-3xl font-bold mb-4">Submit a Report</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="targetType" className="block text-sm font-medium text-gray-700">Report Type</label>
            <select {...register('targetType')} id="targetType" className="w-full p-2 border border-gray-300 rounded-md">
              <option value="user">User</option>
              <option value="club">Club</option>
            </select>
            {errors.targetType && <p className="text-red-500 text-sm">{errors.targetType.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="targetId" className="block text-sm font-medium text-gray-700">Target</label>
            <input
              {...register('targetId')}
              id="targetId"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="For User: Student ID (e.g., CB22000) | For Club: Club name"
            />
            {errors.targetId && <p className="text-red-500 text-sm">{errors.targetId.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              {...register('reason')}
              id="reason"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Please describe why you are reporting this"
            ></textarea>
            {errors.reason && <p className="text-red-500 text-sm">{errors.reason.message}</p>}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={createReportMutation.isPending}
          >
            {createReportMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-2xl font-bold mb-4">Open Reports</h2>
          {isLoading && <p>Loading reports...</p>}
          {error && <p>Error fetching reports: {error.message}</p>}
          {reportsArray.length > 0 && (
            <ul>
              {reportsArray.map((report) => (
                <li key={report._id} className="border-b py-2">
                  <p><strong>Target Type:</strong> {report.targetType}</p>
                  <p><strong>Target ID:</strong> {report.targetId}</p>
                  <p><strong>Reason:</strong> {report.reason}</p>
                  <p><strong>Status:</strong> {report.status}</p>
                  <div className="mt-2">
                    {report.status !== 'resolved' && (
                    <button 
                      onClick={() => {
                        setSelectedReportId(report._id);
                        setResolveConfirmationOpen(true);
                      }}
                      className="mr-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                    )}
                    {report.targetType === 'user' && report.status !== 'resolved' && (
                    <button 
                      onClick={() => {
                        setSelectedReportId(report._id);
                          setRestrictConfirmationOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Restrict User
                    </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <ConfirmationModal
        isOpen={isResolveConfirmationOpen}
        onClose={() => setResolveConfirmationOpen(false)}
        onConfirm={handleResolve}
        title="Resolve Report"
        message="Are you sure you want to mark this report as resolved?"
      />
      <ConfirmationModal
        isOpen={isRestrictConfirmationOpen}
        onClose={() => setRestrictConfirmationOpen(false)}
        onConfirm={handleRestrictUser}
        title="Restrict User"
        message="Are you sure you want to restrict this user based on this report?"
      />
    </div>
  );
};

export default ReportsPage;