
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useUpdateClub } from '../services/clubs';
import { Club } from '../types';

const editClubSchema = z.object({
  name: z.string().min(1, 'Club name cannot be empty'),
  description: z.string().min(1, 'Club description cannot be empty'),
  profilePicture: z.string().optional(),
});

type EditClubFormInputs = z.infer<typeof editClubSchema>;

interface EditClubFormProps {
  club: Club;
  closeModal: () => void;
}

const EditClubForm = ({ club, closeModal }: EditClubFormProps) => {
  const updateClubMutation = useUpdateClub(club._id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditClubFormInputs>({
    resolver: zodResolver(editClubSchema),
    defaultValues: {
      name: club.name,
      description: club.description,
      profilePicture: club.profilePicture,
    },
  });

  const onSubmit = (data: EditClubFormInputs) => {
    updateClubMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Club updated successfully!');
        reset();
        closeModal();
      },
      onError: () => {
        toast.error('Failed to update club. Please try again.');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Club Name</label>
        <input
          {...register('name')}
          id="name"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          id="description"
          className="w-full p-2 border border-gray-300 rounded-md"
        ></textarea>
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
        <input
          {...register('profilePicture')}
          id="profilePicture"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.profilePicture && <p className="text-red-500 text-sm">{errors.profilePicture.message}</p>}
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
          disabled={updateClubMutation.isPending}
        >
          {updateClubMutation.isPending ? 'Updating...' : 'Update'}
        </button>
      </div>
    </form>
  );
};

export default EditClubForm;
