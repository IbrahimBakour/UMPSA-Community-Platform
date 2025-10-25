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
          <img 
            src={club.profilePicture || '/default-club-avatar.png'} 
            alt={club.name} 
            className="w-16 h-16 rounded-full mr-4 object-cover" 
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold">{club.name}</h3>
            {club.description && (
              <p className="text-gray-600">{club.description}</p>
            )}
            {club.memberCount !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClubCard;