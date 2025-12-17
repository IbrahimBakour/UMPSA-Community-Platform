/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useUpdateClub } from "../services/clubs";
import { Club } from "../types";
import { useState, useEffect } from "react";
import { uploadClubMedia } from "../services/uploads";
import { API_BASE_URL } from "../utils/constants";

// Helper function to get full image URL
const getImageUrl = (path?: string): string => {
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

const editClubSchema = z.object({
  name: z.string().min(1, "Club name cannot be empty"),
  description: z.string().optional(),
  contact: z.string().optional(),
  about: z.string().optional(),
});

type EditClubFormInputs = z.infer<typeof editClubSchema>;

interface EditClubFormProps {
  club: Club;
  closeModal: () => void;
}

const EditClubForm = ({ club, closeModal }: EditClubFormProps) => {
  const updateClubMutation = useUpdateClub(club._id);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditClubFormInputs>({
    resolver: zodResolver(editClubSchema),
    defaultValues: {
      name: club.name,
      description: club.description || "",
      contact: club.contact || "",
      about: club.about || "",
    },
  });

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const preview = URL.createObjectURL(file);
      setProfilePicturePreview(preview);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const preview = URL.createObjectURL(file);
      setBannerPreview(preview);
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [profilePicturePreview, bannerPreview]);

  const onSubmit = async (data: EditClubFormInputs) => {
    try {
      setIsUploading(true);
      let profilePictureUrl = club.profilePicture;
      let bannerUrl = club.banner;

      // Upload media if a new file is selected
      if (profilePictureFile || bannerFile) {
        try {
          const uploadResponse = await uploadClubMedia(club._id, {
            profilePicture: profilePictureFile || undefined,
            banner: bannerFile || undefined,
          });
          console.log("Upload response:", uploadResponse);
          profilePictureUrl =
            uploadResponse.club?.profilePicture || profilePictureUrl;
          bannerUrl = uploadResponse.club?.banner || bannerUrl;
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Failed to upload media. Please try again.");
          setIsUploading(false);
          return;
        }
      }

      const payload = {
        ...data,
        profilePicture: profilePictureUrl,
        banner: bannerUrl,
      } as any;

      updateClubMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Club updated successfully!");
          reset();
          setProfilePictureFile(null);
          setBannerFile(null);
          setProfilePicturePreview(null);
          setBannerPreview(null);
          closeModal();
        },
        onError: (error) => {
          console.error("Update error:", error);
          toast.error("Failed to update club. Please try again.");
        },
      });
    } catch (error) {
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Club Name
        </label>
        <input
          {...register("name")}
          id="name"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md"
        ></textarea>
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="contact"
          className="block text-sm font-medium text-gray-700"
        >
          Contact Information
        </label>
        <input
          {...register("contact")}
          id="contact"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Email, phone, or social media"
        />
        {errors.contact && (
          <p className="text-red-500 text-sm">{errors.contact.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="about"
          className="block text-sm font-medium text-gray-700"
        >
          About Club
        </label>
        <textarea
          {...register("about")}
          id="about"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Additional information about the club"
        ></textarea>
        {errors.about && (
          <p className="text-red-500 text-sm">{errors.about.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="profilePicture"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Profile Picture
        </label>
        <input
          id="profilePicture"
          type="file"
          accept="image/*"
          onChange={handleProfileImageChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload a new profile picture for the club
        </p>
        {(profilePicturePreview || club.profilePicture) && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {profilePicturePreview ? "New Preview:" : "Current:"}
            </p>
            <img
              src={profilePicturePreview || getImageUrl(club.profilePicture)}
              alt="Profile preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-indigo-300"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="banner"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Banner Image
        </label>
        <input
          id="banner"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <p className="text-sm text-gray-500 mt-1">
          Recommended aspect ratio 3:1 for best fit
        </p>
        {(bannerPreview || club.banner) && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {bannerPreview ? "New Preview:" : "Current:"}
            </p>
            <div className="w-full max-w-md h-32 rounded-lg overflow-hidden border border-indigo-100">
              <img
                src={bannerPreview || getImageUrl(club.banner)}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={updateClubMutation.isPending || isUploading}
        >
          {updateClubMutation.isPending || isUploading
            ? "Updating..."
            : "Update Club"}
        </button>
      </div>
    </form>
  );
};

export default EditClubForm;
