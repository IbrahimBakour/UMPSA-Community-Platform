
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useUpdateUser } from '../services/users';
import { uploadFile } from '../services/uploads';
import { useState } from 'react';

const profileSchema = z.object({
  nickname: z.string().min(1, 'Nickname cannot be empty'),
  profilePicture: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const updateUserMutation = useUpdateUser();
  const [isUploading, setIsUploading] = useState(false);

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
        toast.success('Profile updated successfully!');
        setUser(updatedUser);
      },
      onError: () => {
        toast.error('Failed to update profile. Please try again.');
      },
    });
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedFileUrl = await uploadFile(file);
      setValue('profilePicture', uploadedFileUrl);
    } catch (error) {
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4">
          <img src={user?.profilePicture} alt={user?.nickname} className="w-24 h-24 rounded-full mr-4" />
          <div>
            <h1 className="text-3xl font-bold">{user?.nickname}</h1>
            <p className="text-gray-600">{user?.studentId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">Nickname</label>
            <input
              {...register('nickname')}
              id="nickname"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.nickname && <p className="text-red-500 text-sm">{errors.nickname.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              id="profilePicture"
              onChange={handleProfilePictureChange}
              accept="image/*"
              disabled={isUploading}
            />
            {isUploading && <p>Uploading profile picture...</p>}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={updateUserMutation.isPending || isUploading}
          >
            {updateUserMutation.isPending ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;