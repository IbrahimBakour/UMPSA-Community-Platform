import { useParams } from "react-router-dom";
import { useClub, useClubPosts } from "../services/clubs";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import EditClubModal from "../components/EditClubModal";
import AddMemberModal from "../components/AddMemberModal";
// import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const ClubProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: club,
    isLoading: isLoadingClub,
    error: clubError,
  } = useClub(id!);
  const {
    data: posts,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useClubPosts(id!);
  const { user } = useAuth();

  const isClubMember = club?.members.some((member) => member._id === user?._id);

  if (isLoadingClub || isLoadingPosts) {
    return <div>Loading...</div>;
  }

  if (clubError || postsError) {
    return <div>Error fetching data</div>;
  }

  if (!club) {
    return <div>Club not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {/* <Avatar className="w-24 h-24">
              <AvatarImage src={club.profilePicture} alt={club.name} />
              <AvatarFallback>{club.name.charAt(0)}</AvatarFallback>
            </Avatar> */}
            <div className="ml-4">
              <h1 className="text-3xl font-bold">{club.name}</h1>
              <p className="text-gray-600">{club.description}</p>
            </div>
          </div>
          {isClubMember && (
            <div>
              <EditClubModal club={club} />
              <AddMemberModal clubId={club._id} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        {posts?.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ClubProfilePage;
