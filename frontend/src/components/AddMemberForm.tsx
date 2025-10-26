
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAddMember } from '../services/clubs';

const addMemberSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
});

type AddMemberFormInputs = z.infer<typeof addMemberSchema>;

interface AddMemberFormProps {
  clubId: string;
  closeModal: () => void;
}

const AddMemberForm = ({ clubId, closeModal }: AddMemberFormProps) => {
  const addMemberMutation = useAddMember(clubId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormInputs>({
    resolver: zodResolver(addMemberSchema),
  });

  const onSubmit = (data: AddMemberFormInputs) => {
    // Send studentId to the backend
    addMemberMutation.mutate(data.studentId, {
      onSuccess: () => {
        toast.success('Member added successfully!');
        reset();
        closeModal();
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Failed to add member. Please try again.';
        toast.error(errorMessage);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
          Student ID <span className="text-red-500">*</span>
        </label>
        <input
          {...register('studentId')}
          id="studentId"
          type="text"
          placeholder="e.g., CB22000"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter the student ID of the member to add
        </p>
        {errors.studentId && <p className="text-red-500 text-sm">{errors.studentId.message}</p>}
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
          disabled={addMemberMutation.isPending}
        >
          {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
        </button>
      </div>
    </form>
  );
};

export default AddMemberForm;
