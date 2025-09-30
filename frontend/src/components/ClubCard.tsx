import { Link } from 'react-router-dom';
import { Club } from '../types';

interface ClubCardProps {
  club: Club;
}

const ClubCard = ({ club }: ClubCardProps) => {
  return (
    <Link to={`/clubs/${club._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <img src={club.profilePicture} alt={club.name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h2 className="text-xl font-bold">{club.name}</h2>
          <p className="text-gray-600 mt-2">{club.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default ClubCard;
