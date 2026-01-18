/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useAllUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
} from "../../services/users";
import { useEffect, useState } from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import { User } from "../../types";
import ImportUsersButton from "../../components/ImportUsersButton";
import { motion } from "framer-motion";

const UsersManagementPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [displayUsers, setDisplayUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const {
    data: usersData,
    isLoading,
    error,
    isFetching,
  } = useAllUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
  });
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  // Handle the response structure
  const users = usersData?.users || usersData?.data || [];
  const usersArray = Array.isArray(users) ? users : [];

  // Accumulate users across pages and de-duplicate by id
  useEffect(() => {
    if (page === 1) {
      setDisplayUsers(usersArray);
    } else if (usersArray.length > 0) {
      setDisplayUsers((prev) => {
        const merged = [...prev, ...usersArray];
        const seen = new Set<string>();
        return merged.filter((u) => {
          const id = (u as any)._id || (u as any).id;
          const key = String(id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
    }
  }, [usersArray, page]);

  // Debounce search term and reset pagination when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
      setDisplayUsers([]);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Refetch when debounced search changes
  useEffect(() => {
    // When search changes, call the hook with new params by updating page
    setPage(1);
  }, [debouncedSearch]);
  const [isPromoteConfirmationOpen, setPromoteConfirmationOpen] =
    useState(false);
  const [isRestrictModalOpen, setRestrictModalOpen] = useState(false);
  const [isUnrestrictModalOpen, setUnrestrictModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handlePromote = () => {
    if (selectedUser) {
      updateRoleMutation.mutate(
        { userId: selectedUser._id, role: "admin" },
        {
          onSuccess: () => {
            toast.success("User promoted to admin successfully!");
            setSelectedUser(null);
            setPromoteConfirmationOpen(false);
          },
          onError: () => {
            toast.error("Failed to promote user. Please try again.");
          },
        }
      );
    }
  };

  const handleRestrict = () => {
    if (selectedUser) {
      updateStatusMutation.mutate(
        { userId: selectedUser._id, status: "restricted" },
        {
          onSuccess: () => {
            toast.success("User restricted successfully!");
            setSelectedUser(null);
            setRestrictModalOpen(false);
          },
          onError: () => {
            toast.error("Failed to restrict user. Please try again.");
          },
        }
      );
    }
  };

  const handleUnrestrict = () => {
    if (selectedUser) {
      updateStatusMutation.mutate(
        { userId: selectedUser._id, status: "active" },
        {
          onSuccess: () => {
            toast.success("User unrestricted successfully!");
            setSelectedUser(null);
            setUnrestrictModalOpen(false);
          },
          onError: () => {
            toast.error("Failed to unrestrict user. Please try again.");
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser._id, {
        onSuccess: () => {
          toast.success("User deleted successfully!");
          // Remove the deleted user from the display list immediately
          setDisplayUsers((prev) =>
            prev.filter((u) => u._id !== selectedUser._id)
          );
          setSelectedUser(null);
          setDeleteConfirmationOpen(false);
        },
        onError: () => {
          toast.error("Failed to delete user. Please try again.");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Error loading users: {error.message}</p>
      </div>
    );
  }

  // Helper function to get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "club_member":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "restricted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination metadata
  const pagination = (usersData as any)?.pagination;
  const hasNext = !!(
    pagination?.hasNext || pagination?.currentPage < pagination?.totalPages
  );

  const handleShowMore = () => {
    if (hasNext && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Users Management
            </h2>
            <p className="text-gray-600 mt-1">Manage and organize all users</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by nickname or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
            )}
          </div>
          <ImportUsersButton />
        </div>
      </div>

      {/* Users Grid */}
      {displayUsers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-600">
            {debouncedSearch
              ? "No users match your search"
              : "Get started by importing users"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            >
              {/* User Header */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(user.nickname || user.studentId).charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {user.nickname || "No Nickname"}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {user.studentId}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                    user.status
                  )}`}
                >
                  {user.status}
                </span>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {user.role !== "admin" && (
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setPromoteConfirmationOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    Promote to Admin
                  </button>
                )}
                <div className="flex gap-2">
                  {user.status === "active" ? (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setRestrictModalOpen(true);
                        setUnrestrictModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium transition-colors"
                    >
                      Restrict
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setUnrestrictModalOpen(true);
                        setRestrictModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                      Unrestrict
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setDeleteConfirmationOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Show More pagination */}
      {displayUsers.length > 0 && (
        <div className="flex items-center justify-center mt-6">
          <button
            onClick={handleShowMore}
            disabled={!hasNext || isFetching}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching
              ? "Loading..."
              : hasNext
              ? "Show More"
              : "No More Users"}
          </button>
        </div>
      )}
      {selectedUser && (
        <ConfirmationModal
          isOpen={isPromoteConfirmationOpen}
          onClose={() => setPromoteConfirmationOpen(false)}
          onConfirm={handlePromote}
          title="Promote User"
          message={`Are you sure you want to promote ${selectedUser.nickname} to admin?`}
        />
      )}
      {selectedUser && (
        <ConfirmationModal
          isOpen={isRestrictModalOpen}
          onClose={() => setRestrictModalOpen(false)}
          onConfirm={handleRestrict}
          title="Restrict User"
          message={`Are you sure you want to restrict user ${
            selectedUser.nickname || selectedUser.studentId
          }?`}
        />
      )}
      {selectedUser && (
        <ConfirmationModal
          isOpen={isUnrestrictModalOpen}
          onClose={() => setUnrestrictModalOpen(false)}
          onConfirm={handleUnrestrict}
          title="Unrestrict User"
          message={`Are you sure you want to unrestrict user ${
            selectedUser.nickname || selectedUser.studentId
          }?`}
        />
      )}
      {selectedUser && (
        <ConfirmationModal
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setDeleteConfirmationOpen(false)}
          onConfirm={handleDelete}
          title="Delete User"
          message={`Are you sure you want to delete user ${
            selectedUser.nickname || selectedUser.studentId
          }? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;
