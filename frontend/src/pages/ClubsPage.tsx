/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useClubs } from "../services/clubs";
import ClubCard from "../components/ClubCard";
import CreateClubModal from "../components/CreateClubModal";
import { useAuth } from "../hooks/useAuth";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Lightweight skeleton for club cards
const ClubSkeleton: React.FC = () => (
  <div className="animate-pulse bg-surface-100 rounded-lg shadow-sm p-4 h-40" />
);

const ClubsPage = () => {
  const { isAdmin, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: clubsData,
    isLoading,
    error,
    refetch,
  } = useClubs({
    search: debouncedSearch || undefined,
  });

  // Refetch clubs data when returning from other pages
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  // Handle the response structure - it could be clubs or data
  const clubs = clubsData?.clubs || clubsData?.data || [];
  const clubsArray = useMemo(
    () => (Array.isArray(clubs) ? clubs : []),
    [clubs]
  );

  const currentUserId = user?._id || user?.id;
  const myClubs = useMemo(
    () =>
      currentUserId
        ? clubsArray.filter((club) => {
            const members = Array.isArray(club.members) ? club.members : [];
            const isMember = members.some((member: any) => {
              const memberId =
                typeof member === "string" ? member : member?._id || member?.id;
              return memberId?.toString() === currentUserId.toString();
            });
            const isLeader =
              club.clubLeader?.toString() === currentUserId.toString();
            return isMember || isLeader;
          })
        : [],
    [clubsArray, currentUserId]
  );

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
        <div className="bg-state-error/10 border border-state-error/20 rounded-lg p-4 text-center">
          <p className="text-state-error">
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
          <p className="text-surface-600">Discover and join campus clubs</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-72">
            <input
              type="search"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-surface-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-2">
              <CreateClubModal />
            </div>
          )}
        </div>
      </div>
      {/* My Clubs (hidden while searching and for admins) */}
      {currentUserId && !debouncedSearch && !isAdmin && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">My Clubs</h2>
            <span className="text-sm text-surface-500">
              {myClubs.length} {myClubs.length === 1 ? "club" : "clubs"}
            </span>
          </div>
          {myClubs.length === 0 ? (
            <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 text-surface-600">
              You are not a member of any club yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClubs.map((club, index) => (
                <motion.div
                  key={club._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <ClubCard club={club} currentUserId={currentUserId} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* All Clubs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">All Clubs</h2>
          <span className="text-sm text-surface-500">
            {clubsArray.length} {clubsArray.length === 1 ? "club" : "clubs"}
          </span>
        </div>
        {clubsArray.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-surface-500 text-lg">
              {debouncedSearch
                ? `No clubs match "${debouncedSearch}".`
                : "No clubs available yet."}
            </p>
            {debouncedSearch && (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubsArray.map((club, index) => (
              <motion.div
                key={club._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ClubCard club={club} currentUserId={currentUserId} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ClubsPage;
