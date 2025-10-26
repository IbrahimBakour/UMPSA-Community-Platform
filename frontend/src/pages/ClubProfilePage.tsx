import { useParams } from "react-router-dom";
import { useClub, useClubPosts } from "../services/clubs";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import EditClubModal from "../components/EditClubModal";
import AddMemberModal from "../components/AddMemberModal";
import CreateClubPostModal from "../components/CreateClubPostModal";
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
                key={club.profilePicture} 
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Members Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold mb-3">Members</h3>
          {club.members && club.members.length > 0 ? (
            <div className="space-y-2">
              {club.members.slice(0, 5).map((member, index) => (
                <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                    <span className="text-sm font-bold text-indigo-600">
                      {typeof member === 'object' && member.studentId 
                        ? member.studentId.charAt(member.studentId.length - 1).toUpperCase()
                        : '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {typeof member === 'object' && member.nickname 
                        ? member.nickname 
                        : typeof member === 'object' && member.studentId 
                        ? member.studentId 
                        : 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {typeof member === 'object' && member.studentId ? member.studentId : ''}
                    </p>
                  </div>
                </div>
              ))}
              {club.members.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  +{club.members.length - 5} more members
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No members yet</p>
          )}
        </div>

        {/* Contact Details Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Club Name</p>
              <p className="text-sm text-gray-600">{club.name}</p>
            </div>
            {club.description && (
              <div>
                <p className="text-sm font-medium text-gray-700">About</p>
                <p className="text-sm text-gray-600">{club.description}</p>
              </div>
            )}
            {club.contact && (
              <div>
                <p className="text-sm font-medium text-gray-700">Contact</p>
                <p className="text-sm text-gray-600">{club.contact}</p>
              </div>
            )}
            {club.about && (
              <div>
                <p className="text-sm font-medium text-gray-700">Additional Info</p>
                <p className="text-sm text-gray-600">{club.about}</p>
              </div>
            )}
          </div>
        </div>

        {/* Club Stats */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold mb-3">Club Statistics</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Members</p>
              <p className="text-2xl font-bold text-indigo-600">{club.memberCount || club.members?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Posts</p>
              <p className="text-2xl font-bold text-indigo-600">{posts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Club Posts</h2>
          {isClubMember && <CreateClubPostModal clubId={club._id} />}
        </div>
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
            {isClubMember && (
              <div className="mt-4">
                <CreateClubPostModal clubId={club._id} />
              </div>
            )}
          </div>
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
