
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRestrictUser } from '../services/reports';

const restrictUserSchema = z.object({
  restrictionType: z.enum(['temporary', 'permanent']),
  restrictionEndDate: z.string().optional(),
});

type RestrictUserFormInputs = z.infer<typeof restrictUserSchema>;

interface RestrictUserFormProps {
  userId: string;
  closeModal: () => void;
}

const RestrictUserForm = ({ userId, closeModal }: RestrictUserFormProps) => {
  const restrictUserMutation = useRestrictUser();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RestrictUserFormInputs>({
    resolver: zodResolver(restrictUserSchema),
  });

  const restrictionType = watch('restrictionType');

  const onSubmit = (data: RestrictUserFormInputs) => {
    restrictUserMutation.mutate({ userId, restriction: data }, {
      onSuccess: () => {
        toast.success('User restricted successfully!');
        closeModal();
      },
      onError: () => {
        toast.error('Failed to restrict user. Please try again.');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Restriction Type</label>
        <div className="flex items-center mt-2">
          <input
            {...register('restrictionType')}
            type="radio"
            value="temporary"
            id="temporary"
            className="mr-2"
          />
          <label htmlFor="temporary" className="mr-4">Temporary</label>
          <input
            {...register('restrictionType')}
            type="radio"
            value="permanent"
            id="permanent"
            className="mr-2"
          />
          <label htmlFor="permanent">Permanent</label>
        </div>
      </div>

      {restrictionType === 'temporary' && (
        <div className="mb-4">
          <label htmlFor="restrictionEndDate" className="block text-sm font-medium text-gray-700">Restriction End Date</label>
          <input
            {...register('restrictionEndDate')}
            type="date"
            id="restrictionEndDate"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.restrictionEndDate && <p className="text-red-500 text-sm">{errors.restrictionEndDate.message}</p>}
        </div>
      )}

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
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          disabled={restrictUserMutation.isPending}
        >
          {restrictUserMutation.isPending ? 'Restricting...' : 'Restrict User'}
        </button>
      </div>
    </form>
  );
};

export default RestrictUserForm;
