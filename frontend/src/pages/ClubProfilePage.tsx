/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useParams } from "react-router-dom";
import { useClub, useClubPosts, useRemoveMember } from "../services/clubs";
import PostCard from "../components/PostCard";
import { AnyPost } from "../types";
import { useAuth } from "../hooks/useAuth";
import EditClubModal from "../components/EditClubModal";
import AddMemberModal from "../components/AddMemberModal";
import CreateClubPostModal from "../components/CreateClubPostModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { API_BASE_URL } from "../utils/constants";
import { motion } from "framer-motion";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Helper function to get full image URL
const getImageUrl = (path?: string): string => {
  if (!path) return "";

  // If it's already a full URL, return it
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Normalize the path to always start with a single /
  let cleanPath = path.replace(/\/+/g, "/");
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  // Combine with API_BASE_URL
  return `${API_BASE_URL}${cleanPath}`;
};

const ClubProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: club,
    isLoading: isLoadingClub,
    error: clubError,
  } = useClub(id!);
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useClubPosts(id!);
  const { user } = useAuth();
  const removeMemberMutation = useRemoveMember(id!);

  // State for remove member confirmation
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Debug logging
  console.log("Club data:", club);
  console.log("Club error:", clubError);
  console.log("Posts data:", postsData);
  console.log("Posts error:", postsError);

  // Extract posts array from possible response shapes
  const pd = postsData as Record<string, unknown> | undefined;
  const postsRaw: unknown[] = Array.isArray(postsData)
    ? postsData
    : pd && Array.isArray(pd.data as unknown)
    ? (pd.data as unknown[])
    : pd && Array.isArray(pd.posts as unknown)
    ? (pd.posts as unknown[])
    : [];
  const postsArray: AnyPost[] = Array.isArray(postsRaw)
    ? (postsRaw as AnyPost[])
    : [];

  // Fix member check - members may be strings (User IDs) or populated user objects
  const userIdStr = user?._id
    ? String(user._id)
    : user?.id
    ? String(user.id)
    : undefined;
  type MemberShape =
    | string
    | {
        nickname?: string;
        studentId?: string;
        profilePicture?: string;
        _id?: string;
        id?: string;
      };
  const membersArray: MemberShape[] = Array.isArray(club?.members)
    ? (club!.members as MemberShape[])
    : [];

  const isClubMember = membersArray.some((member) => {
    if (typeof member === "string") return member === userIdStr;
    const mObj = member as Exclude<MemberShape, string>;
    const mid = mObj._id ?? mObj.id;
    return mid ? String(mid) === userIdStr : false;
  });

  // Permission checks for club leader, members, and admin
  const isAdmin = !!user && user.role === "admin";
  const isClubLeader =
    !!club && !!userIdStr
      ? typeof club.clubLeader === "string"
        ? club.clubLeader === userIdStr
        : (club.clubLeader as any)?._id === userIdStr ||
          (club.clubLeader as any)?.id === userIdStr
      : false;

  // Define granular permissions
  // Admins have all permissions regardless of club membership
  const canEditClub = isAdmin || isClubLeader;
  const canManageMembers = isAdmin || isClubLeader;
  const canCreatePost = isAdmin || isClubLeader || isClubMember;

  // Handle remove member
  const handleRemoveMember = () => {
    if (memberToRemove) {
      removeMemberMutation.mutate(memberToRemove.id, {
        onSuccess: () => {
          setMemberToRemove(null);
        },
        onError: () => {
          setMemberToRemove(null);
        },
      });
    }
  };

  if (isLoadingClub || isLoadingPosts) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-surface-600">Loading club...</p>
          </div>
        </div>
      </div>
    );
  }

  if (clubError || postsError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-state-error/10 border border-state-error/20 rounded-lg p-4 text-center">
          <p className="text-state-error">
            Failed to load club data. Please try again.
          </p>
          {clubError && (
            <p className="text-state-error/80 text-sm mt-2">
              {clubError.message}
            </p>
          )}
          {postsError && (
            <p className="text-state-error/80 text-sm mt-2">
              {postsError.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-state-warning/10 border border-state-warning/20 rounded-lg p-4 text-center">
          <p className="text-state-warning">Club not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6 mb-4 border border-surface-100"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
            {club.profilePicture ? (
              <img
                key={club.profilePicture}
                src={getImageUrl(club.profilePicture)}
                alt={club.name}
                className="w-28 h-28 rounded-full mr-0 sm:mr-4 mb-4 sm:mb-0 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/default-club-avatar.png";
                }}
              />
            ) : (
              <div className="w-28 h-28 rounded-full mr-4 bg-primary-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="ml-2">
              <h1 className="text-3xl font-bold">{club.name}</h1>
              {club.description && (
                <p className="text-surface-600 mt-1">{club.description}</p>
              )}
              {club.memberCount !== undefined && (
                <p className="text-sm text-surface-500 mt-2">
                  {club.memberCount}{" "}
                  {club.memberCount === 1 ? "member" : "members"}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {canEditClub && <EditClubModal club={club} />}
            {canManageMembers && <AddMemberModal clubId={club._id} />}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4"
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
        {/* Members Section */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-bold mb-3">Members</h3>
          {membersArray && membersArray.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {membersArray.slice(0, 8).map((member, index) => {
                const mem =
                  typeof member === "object" && member !== null
                    ? (member as Exclude<MemberShape, string>)
                    : undefined;
                const memberId =
                  mem?._id ??
                  mem?.id ??
                  (typeof member === "string" ? member : undefined);
                const nickname =
                  mem?.nickname ??
                  mem?.studentId ??
                  (typeof member === "string" ? member : "User");
                const initial = nickname
                  ? nickname.charAt(0).toUpperCase()
                  : "?";
                const idText = mem?.studentId ?? "";
                const profilePicture = mem?.profilePicture
                  ? getImageUrl(mem.profilePicture)
                  : undefined;

                // Check if this member is the club leader
                const clubLeaderId =
                  typeof club.clubLeader === "string"
                    ? club.clubLeader
                    : (club.clubLeader as any)?._id ||
                      (club.clubLeader as any)?.id;
                const isThisClubLeader = memberId === clubLeaderId;

                const content = (
                  <>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mr-3 text-sm font-semibold text-primary-700">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt={nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {nickname}
                        </span>
                        {isThisClubLeader && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded whitespace-nowrap">
                            Leader
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-500 truncate">
                        {idText}
                      </p>
                    </div>
                    {canManageMembers && !isThisClubLeader && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMemberToRemove({
                            id: memberId!,
                            name: nickname,
                          });
                        }}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove member"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </>
                );

                return memberId ? (
                  <Link
                    key={index}
                    to={`/users/${memberId}`}
                    className="flex items-center p-2 hover:bg-surface-50 rounded"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={index}
                    className="flex items-center p-2 hover:bg-surface-50 rounded"
                  >
                    {content}
                  </div>
                );
              })}
              {membersArray.length > 8 && (
                <div className="flex items-center justify-center p-2 text-sm text-gray-500">
                  +{membersArray.length - 8} more
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No members yet</p>
          )}
        </motion.div>

        {/* Contact Details Section */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-bold mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Club Name</p>
              <p className="text-sm text-gray-600">{club.name}</p>
            </div>
            {club.description && (
              <div>
                <p className="text-sm font-medium text-gray-700">About</p>
                <p className="text-sm text-gray-600">{club.description}</p>
              </div>
            )}
            {club.contact && (
              <div>
                <p className="text-sm font-medium text-gray-700">Contact</p>
                <p className="text-sm text-gray-600">{club.contact}</p>
              </div>
            )}
            {club.about && (
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Additional Info
                </p>
                <p className="text-sm text-gray-600">{club.about}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Club Stats */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-bold mb-3">Club Statistics</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Members</p>
              <p className="text-2xl font-bold text-indigo-600">
                {club.memberCount || club.members?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Posts</p>
              <p className="text-2xl font-bold text-indigo-600">
                {postsArray.length}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Posts Section */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Club Posts</h2>
          {canCreatePost && <CreateClubPostModal clubId={club._id} />}
        </div>
        {postsArray.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">
                No posts yet. Be the first to post!
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {postsArray.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Remove Member Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this club?`}
      />
    </div>
  );
};

export default ClubProfilePage;
