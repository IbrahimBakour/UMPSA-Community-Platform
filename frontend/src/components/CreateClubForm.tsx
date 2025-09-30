
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCreateClub } from '../services/clubs';

const createClubSchema = z.object({
  name: z.string().min(1, 'Club name cannot be empty'),
  description: z.string().min(1, 'Club description cannot be empty'),
});

type CreateClubFormInputs = z.infer<typeof createClubSchema>;

interface CreateClubFormProps {
  closeModal: () => void;
}

const CreateClubForm = ({ closeModal }: CreateClubFormProps) => {
  const createClubMutation = useCreateClub();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClubFormInputs>({
    resolver: zodResolver(createClubSchema),
  });

  const onSubmit = (data: CreateClubFormInputs) => {
    createClubMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Club created successfully!');
        reset();
        closeModal();
      },
      onError: () => {
        toast.error('Failed to create club. Please try again.');
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
          disabled={createClubMutation.isPending}
        >
          {createClubMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default CreateClubForm;
