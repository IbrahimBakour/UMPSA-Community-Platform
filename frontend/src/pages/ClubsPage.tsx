import { useClubs } from '../services/clubs';
import ClubCard from '../components/ClubCard';
import CreateClubModal from '../components/CreateClubModal';
import { useAuth } from '../hooks/useAuth';

const ClubsPage = () => {
  const { isAdmin } = useAuth();
  const { data: clubsData, isLoading, error } = useClubs();

  // Handle the response structure - it could be clubs or data
  const clubs = clubsData?.clubs || clubsData?.data || [];
  const clubsArray = Array.isArray(clubs) ? clubs : [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading clubs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Failed to load clubs. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clubs</h1>
        {isAdmin && <CreateClubModal />}
      </div>
      {clubsArray.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No clubs available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubsArray.map((club) => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubsPage;