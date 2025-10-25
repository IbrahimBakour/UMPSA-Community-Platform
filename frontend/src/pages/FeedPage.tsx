import React from 'react';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { useFeedPosts } from '../services/posts';

const FeedPage: React.FC = () => {
  const { data: postsData, isLoading, error } = useFeedPosts({
    page: 1,
    limit: 10,
    status: 'approved',
  });

  // Handle the response structure - it could be posts, feedPosts, or data
  const posts = postsData?.posts || postsData?.feedPosts || postsData?.data || [];
  
  // Ensure posts is an array
  const postsArray = Array.isArray(posts) ? posts : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Failed to load posts. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Feed</h1>
          <p className="text-gray-600">Stay updated with the latest from your community</p>
        </div>

        {/* Create Post Modal */}
        <div className="mb-6">
          <CreatePostModal />
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {postsArray.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share something with the community!</p>
            </div>
          ) : (
            postsArray.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;