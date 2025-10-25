import { useClubs, useDeleteClub } from '../../services/clubs';
import { useState } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal';
import toast from 'react-hot-toast';
import CreateClubModal from '../../components/CreateClubModal';
import EditClubModal from '../../components/EditClubModal';
import { Club } from '../../types';

const ClubsManagementPage = () => {
  const { data: clubsData, isLoading, error } = useClubs();
  const deleteClubMutation = useDeleteClub();
  
  // Handle the response structure
  const clubs = clubsData?.clubs || clubsData?.data || [];
  const clubsArray = Array.isArray(clubs) ? clubs : [];
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = () => {
    if (selectedClub) {
      deleteClubMutation.mutate(selectedClub._id, {
        onSuccess: () => {
          toast.success('Club deleted successfully!');
          setSelectedClub(null);
          setDeleteConfirmationOpen(false);
        },
        onError: () => {
          toast.error('Failed to delete club. Please try again.');
        },
      });
    }
  };

  if (isLoading) {
    return <div>Loading clubs...</div>;
  }

  if (error) {
    return <div>Error fetching clubs: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clubs Management</h2>
        <CreateClubModal />
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Description</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clubsArray.map((club) => (
            <tr key={club._id}>
              <td className="border px-4 py-2">{club.name}</td>
              <td className="border px-4 py-2">{club.description || 'N/A'}</td>
              <td className="border px-4 py-2">
                <button 
                  onClick={() => {
                    setSelectedClub(club);
                    setEditModalOpen(true);
                  }}
                  className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button 
                  onClick={() => {
                    setSelectedClub(club);
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
      {selectedClub && (
        <ConfirmationModal
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setDeleteConfirmationOpen(false)}
          onConfirm={handleDelete}
          title="Delete Club"
          message={`Are you sure you want to delete the club "${selectedClub.name}"? This action cannot be undone.`}
        />
      )}
      {selectedClub && (
        <EditClubModal club={selectedClub} />
      )}
    </div>
  );
};

export default ClubsManagementPage;