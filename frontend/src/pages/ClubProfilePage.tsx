import { useParams } from "react-router-dom";
import { useClub, useClubPosts } from "../services/clubs";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";

const ClubProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: club,
    isLoading: isClubLoading,
    error: clubError,
  } = useClub(id || "");
  const {
    data: clubPosts,
    isLoading: isPostsLoading,
    error: postsError,
  } = useClubPosts(id || "");
  const { user } = useAuth();

  const isClubMember = club?.members.some((member) => member._id === user?._id);
  const isAdmin = user?.role === "admin";

  if (isClubLoading || isPostsLoading) {
    return <div>Loading club details...</div>;
  }

  if (clubError) {
    return <div>Error fetching club: {clubError.message}</div>;
  }

  if (postsError) {
    return <div>Error fetching club posts: {postsError.message}</div>;
  }

  if (!club) {
    return <div>Club not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <img
          src={club.banner}
          alt={`${club.name} banner`}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <div className="flex items-center mb-4">
            <img
              src={club.profilePicture}
              alt={club.name}
              className="w-24 h-24 rounded-full -mt-12 border-4 border-white"
            />
            <h1 className="text-3xl font-bold ml-4">{club.name}</h1>
          </div>
          <p className="text-gray-700 mb-4">{club.description}</p>

          {(isClubMember || isAdmin) && (
            <div className="flex space-x-2 mb-4">
              {/* Placeholder for Edit Club and Add Member buttons */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Edit Club
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md">
                Add Member
              </button>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-2">Members</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {club.members.map((member) => (
              <span
                key={member._id}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm"
              >
                {member.nickname}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-2">Posts</h2>
          <div>
            {clubPosts && clubPosts.length > 0 ? (
              clubPosts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p>No posts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfilePage;
