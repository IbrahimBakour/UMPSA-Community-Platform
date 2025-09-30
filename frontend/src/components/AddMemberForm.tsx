
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAddMember } from '../services/clubs';
import { useSearchUsers } from '../services/users';
import { useState } from 'react';
import { User } from '../types';

const addMemberSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
});

type AddMemberFormInputs = z.infer<typeof addMemberSchema>;

interface AddMemberFormProps {
  clubId: string;
  closeModal: () => void;
}

const AddMemberForm = ({ clubId, closeModal }: AddMemberFormProps) => {
  const addMemberMutation = useAddMember(clubId);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users, isLoading } = useSearchUsers(searchTerm);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddMemberFormInputs>({
    resolver: zodResolver(addMemberSchema),
  });

  const onSubmit = (data: AddMemberFormInputs) => {
    addMemberMutation.mutate(data.userId, {
      onSuccess: () => {
        toast.success('Member added successfully!');
        closeModal();
      },
      onError: () => {
        toast.error('Failed to add member. Please try again.');
      },
    });
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setValue('userId', user._id);
    setSearchTerm('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for a user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {isLoading && <p>Loading...</p>}
        {users && users.length > 0 && (
          <ul className="mt-2 border border-gray-300 rounded-md">
            {users.map((user) => (
              <li
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {user.nickname}
              </li>
            ))}
          </ul>
        )}
        {selectedUser && <p className="mt-2">Selected user: {selectedUser.nickname}</p>}
        {errors.userId && <p className="text-red-500 text-sm">{errors.userId.message}</p>}
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
