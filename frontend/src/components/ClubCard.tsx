import { Club } from '../types';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/constants';

interface ClubCardProps {
  club: Club;
}

// Helper function to get full image URL
const getImageUrl = (path?: string): string => {
  if (!path) return '';
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Normalize the path to always start with a single /
  let cleanPath = path.replace(/\/+/g, '/');
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // Combine with API_BASE_URL
  return `${API_BASE_URL}${cleanPath}`;
};

const ClubCard = ({ club }: ClubCardProps) => {
  return (
    <Link to={`/clubs/${club._id}`}>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center mb-4">
          <img 
            src={club.profilePicture ? getImageUrl(club.profilePicture) : '/default-club-avatar.png'} 
            alt={club.name} 
            className="w-16 h-16 rounded-full mr-4 object-cover" 
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              (e.target as HTMLImageElement).src = '/default-club-avatar.png';
            }}
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