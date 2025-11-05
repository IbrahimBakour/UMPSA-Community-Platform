import { useClubs } from "../services/clubs";
import ClubCard from "../components/ClubCard";
import CreateClubModal from "../components/CreateClubModal";
import { useAuth } from "../hooks/useAuth";
import React from "react";
import { motion } from "framer-motion";

// Lightweight skeleton for club cards
const ClubSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-lg shadow-sm p-4 h-40" />
);

const ClubsPage = () => {
  const { isAdmin } = useAuth();
  const { data: clubsData, isLoading, error } = useClubs();

  // Handle the response structure - it could be clubs or data
  const clubs = clubsData?.clubs || clubsData?.data || [];
  const clubsArray = Array.isArray(clubs) ? clubs : [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ClubSkeleton />
          <ClubSkeleton />
          <ClubSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">
            Failed to load clubs. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clubs</h1>
          <p className="text-gray-600">Discover and join campus clubs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <input
              type="search"
              placeholder="Search clubs..."
              className="px-3 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-2">
              <CreateClubModal />
            </div>
          )}
        </div>
      </div>
      {clubsArray.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No clubs available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubsArray.map((club, index) => (
            <motion.div
              key={club._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ClubCard club={club} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubsPage;
