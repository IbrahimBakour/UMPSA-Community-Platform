/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useUpdateUser } from "../services/users";
import { uploadFile } from "../services/uploads";
import { changePassword } from "../services/auth";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "../utils/helpers";

const profileSchema = z.object({
  nickname: z.string().min(1, "Nickname cannot be empty"),
  profilePicture: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const updateUserMutation = useUpdateUser();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(
    getMediaUrl(user?.profilePicture)
  );
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
      },
      onError: () => {
        toast.error("Failed to update profile. Please try again.");
      },
    });
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
        className="bg-white rounded-lg shadow-md p-4"
      >
        <div className="flex items-center mb-4">
          <img
            src={getMediaUrl(user?.profilePicture)}
            alt={user?.nickname}
            className="w-24 h-24 rounded-full mr-4"
          />
          <div>
            <h1 className="text-3xl font-bold">{user?.nickname}</h1>
            <p className="text-gray-600">{user?.studentId}</p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-4">
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700"
            >
              Nickname
            </label>
            <input
              {...register("nickname")}
              id="nickname"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.nickname && (
              <p className="text-red-500 text-sm">{errors.nickname.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Profile Picture
            </label>
            <div className="flex items-center gap-4 mt-2">
              <img
                src={preview}
                alt={user?.nickname}
                className="w-20 h-20 rounded-full object-cover"
              />

              <div>
                {/* Change Password button placed above upload control */}
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Change Password
                  </button>
                </div>

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
                    <p className="text-sm text-gray-500 mt-2">
                      Uploading profile picture...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={updateUserMutation.isPending || isUploading}
          >
            {updateUserMutation.isPending ? "Updating..." : "Update Profile"}
          </button>
        </motion.form>

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
      </motion.div>
    </div>
  );
};

export default ProfilePage;
