import { useParams } from "react-router-dom";
import { useClub, useClubPosts } from "../services/clubs";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import EditClubModal from "../components/EditClubModal";
import AddMemberModal from "../components/AddMemberModal";
import { API_BASE_URL } from "../utils/constants";

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

const ClubProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: club,
    isLoading: isLoadingClub,
    error: clubError,
  } = useClub(id!);
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useClubPosts(id!);
  const { user } = useAuth();

  // Debug logging
  console.log('Club data:', club);
  console.log('Club error:', clubError);
  console.log('Posts data:', postsData);
  console.log('Posts error:', postsError);

  // Extract posts array from PaginatedResponse
  const posts: any[] = Array.isArray(postsData) ? postsData : (Array.isArray(postsData?.data) ? postsData.data : (postsData?.posts ? postsData.posts : []));
  
  // Fix member check - members is an array of strings (User IDs)
  const isClubMember = club?.members?.some((memberId) => {
    // Handle both string IDs and populated user objects
    const memberIdStr = typeof memberId === 'string' ? memberId : (memberId as any)._id?.toString();
    return memberIdStr === user?._id;
  });

  if (isLoadingClub || isLoadingPosts) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading club...</p>
          </div>
        </div>
      </div>
    );
  }

  if (clubError || postsError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Failed to load club data. Please try again.</p>
          {clubError && <p className="text-red-500 text-sm mt-2">{clubError.message}</p>}
          {postsError && <p className="text-red-500 text-sm mt-2">{postsError.message}</p>}
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">Club not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {club.profilePicture ? (
              <img 
                src={getImageUrl(club.profilePicture)} 
                alt={club.name} 
                className="w-24 h-24 rounded-full mr-4 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-club-avatar.png';
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full mr-4 bg-indigo-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600">{club.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="ml-4">
              <h1 className="text-3xl font-bold">{club.name}</h1>
              {club.description && <p className="text-gray-600 mt-1">{club.description}</p>}
              {club.memberCount !== undefined && (
                <p className="text-sm text-gray-500 mt-2">
                  {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
                </p>
              )}
            </div>
          </div>
          {isClubMember && (
            <div className="flex gap-2">
              <EditClubModal club={club} />
              <AddMemberModal clubId={club._id} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default ClubProfilePage;
