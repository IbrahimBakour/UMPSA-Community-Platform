
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useClubs } from '../services/clubs';
import { Club } from '../types';

const assignClubSchema = z.object({
  clubId: z.string().min(1, 'Please select a club'),
});

type AssignClubFormInputs = z.infer<typeof assignClubSchema>;

interface AssignClubFormProps {
  userId: string;
  closeModal: () => void;
}

const AssignClubForm = ({ userId, closeModal }: AssignClubFormProps) => {
  const { data: clubsData, isLoading } = useClubs();
  
  // Extract clubs array from PaginatedResponse
  const clubs: Club[] = Array.isArray(clubsData) ? clubsData : (Array.isArray(clubsData?.data) ? clubsData.data : []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignClubFormInputs>({
    resolver: zodResolver(assignClubSchema),
  });

  const onSubmit = async (data: AssignClubFormInputs) => {
    try {
      await api.post(`/api/clubs/${data.clubId}/members`, { userId });
        toast.success('User assigned to club successfully!');
        closeModal();
    } catch (error) {
        toast.error('Failed to assign user to club. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="clubId" className="block text-sm font-medium text-gray-700">Club</label>
        <select
          {...register('clubId')}
          id="clubId"
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a club</option>
          {isLoading ? (
            <option>Loading clubs...</option>
          ) : (
            clubs.map((club) => (
              <option key={club._id} value={club._id}>
                {club.name}
              </option>
            ))
          )}
        </select>
        {errors.clubId && <p className="text-red-500 text-sm">{errors.clubId.message}</p>}
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
        >
          Assign
        </button>
      </div>
    </form>
  );
};

export default AssignClubForm;
