import React from "react";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import { useFeedPosts } from "../services/posts";
import { motion } from "framer-motion";

// Simple visual skeleton for posts (keeps layout and appearance consistent)
const PostSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-lg shadow-sm p-4">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const FeedPage: React.FC = () => {
  const {
    data: postsData,
    isLoading,
    error,
  } = useFeedPosts({
    page: 1,
    limit: 10,
    status: "approved",
  });

  // Handle the response structure - it could be posts, feedPosts, or data
  const posts =
    postsData?.posts || postsData?.feedPosts || postsData?.data || [];
  const postsArray = Array.isArray(posts) ? posts : [];

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">
            Failed to load posts. Please try again.
          </p>
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
          <p className="text-gray-600">
            Stay updated with the latest from your community
          </p>
        </div>

        {/* Create Post Card (styled) */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <CreatePostModal />
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {isLoading ? (
            // show skeletons while loading
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : postsArray.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto mb-4 w-32 h-32 flex items-center justify-center bg-gray-50 rounded-full">
                <svg
                  className="w-12 h-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600">
                Be the first to share something with the community!
              </p>
              <div className="mt-4">
                <CreatePostModal />
              </div>
            </div>
          ) : (
            postsArray.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
