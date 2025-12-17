import { useClubs, useDeleteClub } from "../../services/clubs";
import { useState } from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import CreateClubModal from "../../components/CreateClubModal";
import EditClubForm from "../../components/EditClubForm";
import { Club } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../utils/constants";

// Helper function to get full image URL
const getImageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  let cleanPath = path.replace(/\/+/g, "/");
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }
  return `${API_BASE_URL}${cleanPath}`;
};

const ClubsManagementPage = () => {
  const { data: clubsData, isLoading, error } = useClubs();
  const deleteClubMutation = useDeleteClub();

  // Handle the response structure
  const clubs = clubsData?.clubs || clubsData?.data || [];
  const clubsArray = Array.isArray(clubs) ? clubs : [];
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = () => {
    if (selectedClub) {
      deleteClubMutation.mutate(selectedClub._id, {
        onSuccess: () => {
          toast.success("Club deleted successfully!");
          setSelectedClub(null);
          setDeleteConfirmationOpen(false);
        },
        onError: () => {
          toast.error("Failed to delete club. Please try again.");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Error loading clubs: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Clubs Management</h2>
          <p className="text-gray-600 mt-1">Manage and organize all clubs</p>
        </div>
        <CreateClubModal />
      </div>

      {/* Clubs Grid */}
      {clubsArray.length === 0 ? (
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No clubs found
          </h3>
          <p className="text-gray-600">Get started by creating a new club</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubsArray.map((club) => (
            <motion.div
              key={club._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            >
              {/* Club Header with Image */}
              <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
                {club.banner && (
                  <img
                    src={getImageUrl(club.banner)}
                    alt={club.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>

              {/* Club Info */}
              <div className="p-4">
                <div className="flex items-start mb-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-4 border-white -mt-8 relative ${
                      !club.profilePicture
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                        : ""
                    }`}
                  >
                    <img
                      src={
                        club.profilePicture
                          ? getImageUrl(club.profilePicture)
                          : "/default-club-avatar.svg"
                      }
                      alt={club.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/default-club-avatar.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 ml-4 mt-2">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {club.name}
                    </h3>
                    {club.memberCount !== undefined && (
                      <p className="text-sm text-gray-500">
                        {club.memberCount}{" "}
                        {club.memberCount === 1 ? "member" : "members"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {club.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {club.description}
                  </p>
                )}

                {/* Contact Info */}
                {club.contact && (
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">{club.contact}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedClub(club);
                      setEditModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClub(club);
                      setDeleteConfirmationOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {selectedClub && (
        <ConfirmationModal
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setDeleteConfirmationOpen(false)}
          onConfirm={handleDelete}
          title="Delete Club"
          message={`Are you sure you want to delete the club "${selectedClub.name}"? This action cannot be undone.`}
        />
      )}
      {selectedClub && isEditModalOpen && (
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
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg my-8"
            >
              <h2 className="text-xl font-bold mb-4">Edit Club</h2>
              <EditClubForm
                club={selectedClub}
                closeModal={() => {
                  setEditModalOpen(false);
                  setSelectedClub(null);
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ClubsManagementPage;
