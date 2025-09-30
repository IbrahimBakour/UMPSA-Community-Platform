import { usePendingFeedPosts, useApproveFeedPost, useRejectFeedPost } from '../../services/posts';
import PostCard from '../../components/PostCard';
import toast from 'react-hot-toast';

const PendingPostsPage = () => {
  const { data: posts, isLoading, error } = usePendingFeedPosts();
  const approvePostMutation = useApproveFeedPost();
  const rejectPostMutation = useRejectFeedPost();

  const handleApprove = (postId: string) => {
    approvePostMutation.mutate(postId, {
      onSuccess: () => {
        toast.success('Post approved successfully!');
      },
      onError: () => {
        toast.error('Failed to approve post. Please try again.');
      },
    });
  };

  const handleReject = (postId: string) => {
    rejectPostMutation.mutate(postId, {
      onSuccess: () => {
        toast.success('Post rejected successfully!');
      },
      onError: () => {
        toast.error('Failed to reject post. Please try again.');
      },
    });
  };

  if (isLoading) {
    return <div>Loading pending posts...</div>;
  }

  if (error) {
    return <div>Error fetching pending posts: {error.message}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Posts</h2>
      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md p-4">
              <PostCard post={post} />
              <div className="mt-4 flex justify-end space-x-4">
                <button 
                  onClick={() => handleApprove(post._id)} 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={approvePostMutation.isPending}
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleReject(post._id)} 
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={rejectPostMutation.isPending}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No pending posts.</p>
      )}
    </div>
  );
};

export default PendingPostsPage;