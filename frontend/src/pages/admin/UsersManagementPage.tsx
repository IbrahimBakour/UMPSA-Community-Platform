
import { useUsers, usePromoteUser } from '../../services/users';
import { useRestrictUser } from '../../services/reports';
import { useState } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal';
import toast from 'react-hot-toast';
import RestrictUserModal from '../../components/RestrictUserModal';
import AssignClubModal from '../../components/AssignClubModal';
import { User } from '../../types';

const UsersManagementPage = () => {
  const { data: users, isLoading, error } = useUsers();
  const promoteUserMutation = usePromoteUser();
  const restrictUserMutation = useRestrictUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPromoteConfirmationOpen, setPromoteConfirmationOpen] = useState(false);
  const [isRestrictModalOpen, setRestrictModalOpen] = useState(false);
  const [isAssignClubModalOpen, setAssignClubModalOpen] = useState(false);

  const handlePromote = () => {
    if (selectedUser) {
      promoteUserMutation.mutate(selectedUser._id, {
        onSuccess: () => {
          toast.success('User promoted to admin successfully!');
          setSelectedUser(null);
          setPromoteConfirmationOpen(false);
        },
        onError: () => {
          toast.error('Failed to promote user. Please try again.');
        },
      });
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error fetching users: {error.message}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Nickname</th>
            <th className="py-2">Student ID</th>
            <th className="py-2">Role</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user.nickname}</td>
              <td className="border px-4 py-2">{user.studentId}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                <button 
                  onClick={() => {
                    setSelectedUser(user);
                    setPromoteConfirmationOpen(true);
                  }}
                  className="mr-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Promote to Admin
                </button>
                <AssignClubModal userId={user._id} />
                <button 
                  onClick={() => {
                    setSelectedUser(user);
                    setRestrictModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Restrict
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <ConfirmationModal
          isOpen={isPromoteConfirmationOpen}
          onClose={() => setPromoteConfirmationOpen(false)}
          onConfirm={handlePromote}
          title="Promote User"
          message={`Are you sure you want to promote ${selectedUser.nickname} to admin?`}
        />
      )}
      {selectedUser && (
        <RestrictUserModal
          isOpen={isRestrictModalOpen}
          onClose={() => setRestrictModalOpen(false)}
          userId={selectedUser._id}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;
