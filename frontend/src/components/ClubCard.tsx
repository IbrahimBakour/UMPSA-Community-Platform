import { Club } from '../types';
import { Link } from 'react-router-dom';

interface ClubCardProps {
  club: Club;
}

const ClubCard = ({ club }: ClubCardProps) => {
  return (
    <Link to={`/clubs/${club._id}`}>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center mb-4">
          <img src={club.profilePicture} alt={club.name} className="w-16 h-16 rounded-full mr-4" />
          <div>
            <h3 className="text-xl font-bold">{club.name}</h3>
            <p className="text-gray-600">{club.description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClubCard;