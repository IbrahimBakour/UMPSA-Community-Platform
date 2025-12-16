import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useCreateReport,
  useReports,
  useUpdateReport,
  useRestrictUserFromReport,
} from "../services/reports";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../components/ConfirmationModal";
import PostCard from "../components/PostCard";
import { usePostById } from "../services/posts";
import { Report } from "../types";

// Helper function to format relative time
const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now.getTime() - postDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

// Small skeleton used while loading reports
const ReportSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-lg shadow-sm p-4">
    <div className="flex justify-between items-center mb-3">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-1/6" />
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-3/4" />
  </div>
);

const TABS = {
  SUBMIT: "submit",
  MANAGE: "manage",
} as const;

const STATUS_FILTERS = {
  ALL: "all",
  PENDING: "pending",
  RESOLVED: "resolved",
} as const;

const TYPE_FILTERS = {
  ALL: "all",
  USER: "user",
  CLUB: "club",
  POST: "post",
} as const;

const reportSchema = z.object({
  targetType: z.enum(["user", "club"]),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(1, "Reason cannot be empty"),
});

type ReportFormInputs = z.infer<typeof reportSchema>;

// Post Review Modal Component
const PostReviewModal = ({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) => {
  const { data: post, isLoading, error } = usePostById(postId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4"
      >
        <motion.div
          initial={{ y: "-100vh" }}
          animate={{ y: "0" }}
          exit={{ y: "100vh" }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl my-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Review Reported Post</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {isLoading && <div className="text-center py-8">Loading post...</div>}
          {error && (
            <div className="text-red-600 text-center py-8">
              Error loading post
            </div>
          )}
          {post && <PostCard post={post} />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ReportsPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const createReportMutation = useCreateReport();

  // State management
  const [activeTab, setActiveTab] = useState<string>(TABS.SUBMIT);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_FILTERS.ALL);
  const [typeFilter, setTypeFilter] = useState<string>(TYPE_FILTERS.ALL);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReportPost, setSelectedReportPost] = useState<string | null>(
    null
  );
  const [isResolveConfirmationOpen, setResolveConfirmationOpen] =
    useState(false);
  const [isRestrictConfirmationOpen, setRestrictConfirmationOpen] =
    useState(false);

  // Fetch reports with filters
  const {
    data: reportsData,
    isLoading,
    error,
  } = useReports({
    status: statusFilter !== STATUS_FILTERS.ALL ? statusFilter : undefined,
    targetType: typeFilter !== TYPE_FILTERS.ALL ? typeFilter : undefined,
  });

  const updateReportMutation = useUpdateReport();
  const restrictUserMutation = useRestrictUserFromReport();

  // Debug logging
  // Handle response structure - backend returns array directly, not wrapped
  let reportsArray: Report[] = [];

  if (Array.isArray(reportsData)) {
    // Backend returns array directly
    reportsArray = reportsData;
  } else if (reportsData?.reports) {
    // Wrapped in reports property
    reportsArray = Array.isArray(reportsData.reports)
      ? reportsData.reports
      : [];
  } else if (reportsData?.data) {
    // Wrapped in data property
    reportsArray = Array.isArray(reportsData.data) ? reportsData.data : [];
  }

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
        toast.success("Report submitted successfully!");
        reset();
      },
      onError: () => {
        toast.error("Failed to submit report. Please try again.");
      },
    });
  };

  const handleResolve = () => {
    if (selectedReportId) {
      updateReportMutation.mutate(
        {
          reportId: selectedReportId,
          reportData: { status: "resolved" },
        },
        {
          onSuccess: () => {
            toast.success("Report resolved successfully!");
            setSelectedReportId(null);
            setResolveConfirmationOpen(false);
          },
          onError: () => {
            toast.error("Failed to resolve report. Please try again.");
          },
        }
      );
    }
  };

  const handleRestrictUser = () => {
    if (selectedReportId) {
      restrictUserMutation.mutate(selectedReportId, {
        onSuccess: () => {
          toast.success("User restricted successfully!");
          setSelectedReportId(null);
          setRestrictConfirmationOpen(false);
        },
        onError: () => {
          toast.error("Failed to restrict user. Please try again.");
        },
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab(TABS.SUBMIT)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === TABS.SUBMIT
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Submit Report
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab(TABS.MANAGE)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === TABS.MANAGE
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Manage Reports
            </button>
          )}
        </nav>
      </div>

      {/* Submit Report Tab */}
      {activeTab === TABS.SUBMIT && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Submit a Report</h2>
          <p className="text-gray-600 mb-6">
            Report inappropriate user behavior or club content.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label
                htmlFor="targetType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Report Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("targetType")}
                id="targetType"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select report type...</option>
                <option value="user">User</option>
                <option value="club">Club</option>
              </select>
              {errors.targetType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.targetType.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="targetId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Target <span className="text-red-500">*</span>
              </label>
              <input
                {...register("targetId")}
                id="targetId"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="For User: Enter Student ID (e.g., CB22000) | For Club: Enter Club Name"
              />
              {errors.targetId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.targetId.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Enter the student ID for user reports or club name for club
                reports
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("reason")}
                id="reason"
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Please describe why you are reporting this content or user..."
              ></textarea>
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.reason.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending
                ? "Submitting..."
                : "Submit Report"}
            </button>
          </form>
        </div>
      )}

      {/* Manage Reports Tab */}
      {activeTab === TABS.MANAGE && isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Reports</h2>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100"
              >
                <option value={STATUS_FILTERS.ALL}>All Status</option>
                <option value={STATUS_FILTERS.PENDING}>Pending</option>
                <option value={STATUS_FILTERS.RESOLVED}>Resolved</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100"
              >
                <option value={TYPE_FILTERS.ALL}>All Types</option>
                <option value={TYPE_FILTERS.USER}>User</option>
                <option value={TYPE_FILTERS.CLUB}>Club</option>
                <option value={TYPE_FILTERS.POST}>Post</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-3">
              <ReportSkeleton />
              <ReportSkeleton />
              <ReportSkeleton />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">
                Error fetching reports: {error.message}
              </p>
            </div>
          )}

          {!isLoading && !error && reportsArray.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reports found
              </h3>
              <p className="text-gray-600">
                There are no reports matching your current filters.
              </p>
              {(statusFilter !== STATUS_FILTERS.ALL ||
                typeFilter !== TYPE_FILTERS.ALL) && (
                <button
                  onClick={() => {
                    setStatusFilter(STATUS_FILTERS.ALL);
                    setTypeFilter(TYPE_FILTERS.ALL);
                  }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && reportsArray.length > 0 && (
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {reportsArray.map((report: Report) => (
                <motion.div
                  key={report._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.targetType === "user"
                            ? "bg-blue-100 text-blue-800"
                            : report.targetType === "club"
                            ? "bg-purple-100 text-purple-800"
                            : report.targetType === "post"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.targetType.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {getRelativeTime(report.createdAt)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Target:</strong> {report.targetId}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Reason:</strong> {report.reason}
                    </p>
                  </div>

                  {report.status !== "resolved" && (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedReportId(report._id);
                          setResolveConfirmationOpen(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        Mark Resolved
                      </button>
                      {report.targetType === "user" && (
                        <button
                          onClick={() => {
                            setSelectedReportId(report._id);
                            setRestrictConfirmationOpen(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                        >
                          Restrict User
                        </button>
                      )}
                      {report.targetType === "club" && (
                        <button
                          onClick={() => navigate(`/clubs/${report.targetId}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                          Review Club
                        </button>
                      )}
                      {report.targetType === "post" && (
                        <button
                          onClick={() => setSelectedReportPost(report.targetId)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                        >
                          Review Post
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Confirmation Modals */}
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
        message="Are you sure you want to restrict this user based on this report? This action cannot be undone."
      />

      {/* Post Review Modal */}
      {selectedReportPost && (
        <PostReviewModal
          postId={selectedReportPost}
          onClose={() => setSelectedReportPost(null)}
        />
      )}
    </div>
  );
};

export default ReportsPage;
