/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useUpdateUser } from "../services/users";
import { uploadFile } from "../services/uploads";
import { changePassword } from "../services/auth";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "../utils/helpers";
import api from "../services/api";
import { API_ENDPOINTS } from "../utils/constants";

const profileSchema = z.object({
  nickname: z.string().min(1, "Nickname cannot be empty"),
  profilePicture: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, updateUser, isInitialized } = useAuth();
  const updateUserMutation = useUpdateUser();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(
    getMediaUrl(user?.profilePicture)
  );
  const [userActivity, setUserActivity] = useState<any>(null);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname,
      profilePicture: user?.profilePicture,
    },
  });

  const onSubmit = (data: ProfileFormInputs) => {
    updateUserMutation.mutate(data, {
      onSuccess: (updatedUser) => {
        toast.success("Profile updated successfully!");
        updateUser(updatedUser);
        setShowEditModal(false);
      },
      onError: () => {
        toast.error("Failed to update profile. Please try again.");
      },
    });
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Password change form
  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters"),
      confirmPassword: z.string().min(1, "Please confirm new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type PasswordForm = z.infer<typeof passwordSchema>;

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    formState: { errors: passErrors, isSubmitting: isChanging },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  // Fetch user activity data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      // Wait for auth to be initialized
      if (!isInitialized) {
        console.log("ProfilePage: Auth not initialized yet");
        return;
      }

      const userId = user?.id || user?._id;
      if (!userId) {
        console.log("ProfilePage: No user ID available", { user });
        return;
      }

      console.log("ProfilePage: Fetching data for user", userId);

      try {
        // Fetch user activity stats
        const activityResponse = await api.get(
          API_ENDPOINTS.USER_ACTIVITY.replace(":userId", userId)
        );
        console.log("Activity data received:", activityResponse.data);
        setUserActivity(activityResponse.data?.activity || null);

        // Fetch clubs
        const clubsResponse = await api.get(API_ENDPOINTS.CLUBS, {
          params: { limit: 100 },
        });
        const allClubs = Array.isArray(clubsResponse.data?.data)
          ? clubsResponse.data.data
          : [];
        console.log("Clubs fetched:", allClubs.length);

        const userClubsList = allClubs.filter((club: any) => {
          const members = Array.isArray(club.members) ? club.members : [];
          return members.some((member: any) => {
            const memberId =
              typeof member === "string" ? member : member?._id || member?.id;
            return memberId?.toString() === userId.toString();
          });
        });
        console.log("User clubs found:", userClubsList.length);
        setUserClubs(userClubsList);

        // Mock activity history (in a real app, this would come from a timeline endpoint)
        const mockHistory = [
          {
            type: "post",
            action: "Created a post",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            type: "club",
            action: "Joined a club",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          },
          {
            type: "comment",
            action: "Commented on a post",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        ];
        setActivityHistory(mockHistory);

        console.log("ProfilePage: All data fetched successfully");
      } catch (error: any) {
        console.error("Failed to fetch user data:", error);
        if (error?.response) {
          console.error(
            "Error response:",
            error.response.status,
            error.response.data
          );
        }
        toast.error("Failed to load profile data. Please refresh the page.");
      }
    };

    fetchUserData();
  }, [user?.id, user?._id, isInitialized]);

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedFile = await uploadFile(file);
      // uploadFile returns either a url or an object with url depending on implementation
      const url = (uploadedFile as any).url ?? (uploadedFile as any);
      setPreview(getMediaUrl(url));
      setValue("profilePicture", url);
      toast.success("Profile picture uploaded successfully!");
    } catch {
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully");
      resetPass();
      setShowPasswordModal(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to change password. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <img
              src={getMediaUrl(user?.profilePicture)}
              alt={user?.nickname}
              className="w-24 h-24 rounded-full mr-6"
            />
            <div>
              <h1 className="text-3xl font-bold">{user?.nickname}</h1>
              <p className="text-gray-600">{user?.studentId}</p>
              {/* Option A: Compact Stat Badges */}
              <div className="flex gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  📝 {userActivity?.postsCreated || 0} posts
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  👥 {userActivity?.clubsJoined || 0} clubs
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">
                  🚩 {userActivity?.reportsSubmitted || 0} reports
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
        {/* Account Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-6 border border-indigo-100"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Account Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-block w-3 h-3 rounded-full transition-all ${
                    (user?.status || "active") === "active"
                      ? "bg-green-500 shadow-md shadow-green-400"
                      : "bg-red-500 shadow-md shadow-red-400"
                  }`}
                ></span>
                <span className="font-medium capitalize">
                  {user?.status || "active"}
                </span>
              </div>
              {user?.status === "restricted" && user?.restriction && (
                <p className="text-xs text-red-600 mt-1">
                  {user.restriction.type === "temporary" &&
                  user.restriction.until
                    ? `Until: ${new Date(
                        user.restriction.until
                      ).toLocaleDateString()}`
                    : "Permanent"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize mt-1">
                <span className="inline-block px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-sm">
                  {user?.role}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium mt-1">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Activity & Engagement Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-6 border border-blue-100"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Activity & Engagement
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {userActivity?.postsCreated || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Posts Created</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {userActivity?.clubsJoined || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Clubs Joined</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-600">
                {userActivity?.reportsSubmitted || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Reports Submitted</p>
            </div>
          </div>
        </motion.div>

        {/* Option B: Collapsible Activity History Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-100"
        >
          <button
            onClick={() => setShowActivityHistory(!showActivityHistory)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Activity History
            </h2>
            <span className="text-2xl text-gray-600">
              {showActivityHistory ? "−" : "+"}
            </span>
          </button>

          <AnimatePresence>
            {showActivityHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                {/* Option C: Recent Activity Timeline */}
                {activityHistory.length > 0 ? (
                  activityHistory.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-purple-300 flex items-center justify-center">
                          <span className="text-sm">
                            {activity.type === "post"
                              ? "📝"
                              : activity.type === "club"
                              ? "👥"
                              : "💬"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-md p-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-800">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Club Affiliations Section */}
        {userClubs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 mb-6 border border-green-100"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Club Affiliations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {userClubs.map((club: any) => (
                <div
                  key={club._id}
                  className="flex items-center p-3 bg-white rounded-md border border-green-200 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-bold text-green-700">
                      {club.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {club.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {club.memberCount || club.members?.length || 0} members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Edit Profile</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Update your visible profile details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close edit profile dialog"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="nickname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nickname
                  </label>
                  <input
                    {...register("nickname")}
                    id="nickname"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.nickname && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.nickname.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <img
                      src={preview}
                      alt={user?.nickname}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                    <div>
                      <label
                        htmlFor="profilePicture"
                        className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        Upload new
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="profilePicture"
                        onChange={handleProfilePictureChange}
                        accept="image/*"
                        disabled={isUploading}
                        className="hidden"
                      />
                      {isUploading && (
                        <p className="text-sm text-gray-500 mt-1">
                          Uploading profile picture...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setShowPasswordModal(true);
                    }}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={updateUserMutation.isPending || isUploading}
                  >
                    {updateUserMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold">Change Password</h2>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close password dialog"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitPass(onPasswordSubmit)}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...registerPass("currentPassword")}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {passErrors.currentPassword && (
                    <p className="text-red-500 text-sm">
                      {passErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...registerPass("newPassword")}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {passErrors.newPassword && (
                    <p className="text-red-500 text-sm">
                      {passErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...registerPass("confirmPassword")}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {passErrors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {passErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={isChanging}
                  >
                    {isChanging ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
