
import { useAllUsers, useUpdateUserRole, useUpdateUserStatus, useDeleteUser } from '../../services/users';
import { useState } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal';
import toast from 'react-hot-toast';
import { User } from '../../types';

const UsersManagementPage = () => {
  const { data: usersData, isLoading, error } = useAllUsers();
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  
  // Handle the response structure
  const users = usersData?.users || usersData?.data || [];
  const usersArray = Array.isArray(users) ? users : [];
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPromoteConfirmationOpen, setPromoteConfirmationOpen] = useState(false);
  const [isRestrictModalOpen, setRestrictModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handlePromote = () => {
    if (selectedUser) {
      updateRoleMutation.mutate({ userId: selectedUser._id, role: 'admin' }, {
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

  const handleRestrict = () => {
    if (selectedUser) {
      updateStatusMutation.mutate({ userId: selectedUser._id, status: 'restricted' }, {
        onSuccess: () => {
          toast.success('User restricted successfully!');
          setSelectedUser(null);
          setRestrictModalOpen(false);
        },
        onError: () => {
          toast.error('Failed to restrict user. Please try again.');
        },
      });
    }
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser._id, {
        onSuccess: () => {
          toast.success('User deleted successfully!');
          setSelectedUser(null);
          setDeleteConfirmationOpen(false);
        },
        onError: () => {
          toast.error('Failed to delete user. Please try again.');
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
          {usersArray.map((user) => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user.nickname || 'N/A'}</td>
              <td className="border px-4 py-2">{user.studentId}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                {user.role !== 'admin' && (
                  <button 
                    onClick={() => {
                      setSelectedUser(user);
                      setPromoteConfirmationOpen(true);
                    }}
                    className="mr-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Promote to Admin
                  </button>
                )}
                {user.status === 'active' && (
                  <button 
                    onClick={() => {
                      setSelectedUser(user);
                      setRestrictModalOpen(true);
                    }}
                    className="mr-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Restrict
                  </button>
                )}
                <button 
                  onClick={() => {
                    setSelectedUser(user);
                    setDeleteConfirmationOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
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
        <ConfirmationModal
          isOpen={isRestrictModalOpen}
          onClose={() => setRestrictModalOpen(false)}
          onConfirm={handleRestrict}
          title="Restrict User"
          message={`Are you sure you want to restrict user ${selectedUser.nickname || selectedUser.studentId}?`}
        />
      )}
      {selectedUser && (
        <ConfirmationModal
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setDeleteConfirmationOpen(false)}
          onConfirm={handleDelete}
          title="Delete User"
          message={`Are you sure you want to delete user ${selectedUser.nickname || selectedUser.studentId}? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;
