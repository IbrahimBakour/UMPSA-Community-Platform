import { useClubs } from '../services/clubs';
import ClubCard from '../components/ClubCard';

const ClubsPage = () => {
  const { data: clubs, isLoading, error } = useClubs();

  if (isLoading) {
    return <div>Loading clubs...</div>;
  }

  if (error) {
    return <div>Error fetching clubs: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Clubs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs?.map((club) => (
          <ClubCard key={club._id} club={club} />
        ))}
      </div>
    </div>
  );
};

export default ClubsPage;