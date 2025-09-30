import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCreateReport, useReports, useResolveReport } from '../services/reports';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';
import RestrictUserModal from '../components/RestrictUserModal';

const reportSchema = z.object({
  description: z.string().min(1, 'Description cannot be empty'),
  againstUser: z.string().optional(),
  postLink: z.string().optional(),
});

type ReportFormInputs = z.infer<typeof reportSchema>;

const ReportsPage = () => {
  const { isAdmin } = useAuth();
  const createReportMutation = useCreateReport();
  const { data: reports, isLoading, error } = useReports();
  const resolveReportMutation = useResolveReport();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isResolveConfirmationOpen, setResolveConfirmationOpen] = useState(false);
  const [isRestrictModalOpen, setRestrictModalOpen] = useState(false);

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
      resolveReportMutation.mutate(selectedReportId, {
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

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h1 className="text-3xl font-bold mb-4">Submit a Report</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              id="description"
              className="w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="againstUser" className="block text-sm font-medium text-gray-700">Against User (ID)</label>
            <input
              {...register('againstUser')}
              id="againstUser"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="postLink" className="block text-sm font-medium text-gray-700">Post Link</label>
            <input
              {...register('postLink')}
              id="postLink"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
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
          {reports && (
            <ul>
              {reports.map((report) => (
                <li key={report._id} className="border-b py-2">
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Against:</strong> {report.againstUser}</p>
                  <p><strong>Post:</strong> {report.postLink}</p>
                  <div className="mt-2">
                    <button 
                      onClick={() => {
                        setSelectedReportId(report._id);
                        setResolveConfirmationOpen(true);
                      }}
                      className="mr-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                    <button className="mr-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Dismiss</button>
                    <button 
                      onClick={() => {
                        setSelectedReportId(report._id);
                        setRestrictModalOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Restrict User
                    </button>
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
      {selectedReportId && (
        <RestrictUserModal
          isOpen={isRestrictModalOpen}
          onClose={() => setRestrictModalOpen(false)}
          userId={reports?.find(r => r._id === selectedReportId)?.againstUser || ''}
        />
      )}
    </div>
  );
};

export default ReportsPage;