import React, { useState } from 'react';
import { Button, Card, CardContent, Avatar, Badge, LoadingPage } from '../components/ui';
import { useFeedPosts } from '../services/posts';
import { 
  PlusIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const FeedPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'controversial'>('recent');

  const { data: postsData, isLoading, error } = useFeedPosts({
    page: 1,
    limit: 10,
    status: 'approved',
  });

  const posts = postsData?.data || [];

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load posts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
          <p className="text-gray-600">Stay updated with the latest from your community</p>
        </div>
        <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
          Create Post
        </Button>
      </div>

      {/* Filters and Sort */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex space-x-2">
                {['all', 'following', 'trending'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      filter === filterOption
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="recent">Recent</option>
                <option value="popular">Popular</option>
                <option value="controversial">Controversial</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
              <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

interface PostCardProps {
  post: any; // We'll type this properly later
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'poll':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'event':
        return <CalendarIcon className="w-4 h-4" />;
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPostTypeColor = (postType: string) => {
    switch (postType) {
      case 'poll':
        return 'bg-blue-100 text-blue-700';
      case 'event':
        return 'bg-green-100 text-green-700';
      case 'link':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="hover:shadow-medium transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar
              src={post.author?.profilePicture}
              alt={post.author?.nickname || post.author?.studentId}
              fallback={post.author?.nickname || post.author?.studentId}
              size="md"
            />
            <div>
              <h3 className="font-medium text-gray-900">
                {post.author?.nickname || post.author?.studentId}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()} • {post.postType}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {post.postType !== 'text' && (
              <Badge variant="default" className={getPostTypeColor(post.postType)}>
                {getPostTypeIcon(post.postType)}
                <span className="ml-1 capitalize">{post.postType}</span>
              </Badge>
            )}
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          
          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {post.media.slice(0, 4).map((media: any, index: number) => (
                <div key={index} className="relative">
                  <img
                    src={media.url}
                    alt={`Post media ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {post.media.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium">
                        +{post.media.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Poll */}
          {post.poll && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">{post.poll.question}</h4>
              <div className="space-y-2">
                {post.poll.options.map((option: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm text-gray-700">{option.text}</span>
                    <span className="text-xs text-gray-500">{option.votes} votes</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Event */}
          {post.calendarEvent && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Event</span>
              </div>
              <h4 className="font-medium text-gray-900">{post.calendarEvent.title}</h4>
              <p className="text-sm text-gray-600">{post.calendarEvent.description}</p>
              <p className="text-sm text-blue-600 mt-1">
                {new Date(post.calendarEvent.startDate).toLocaleDateString()} - {new Date(post.calendarEvent.endDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Link Preview */}
          {post.link && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <LinkIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Link</span>
              </div>
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                {post.link}
              </a>
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors duration-200 ${
                isLiked
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {post.interactions?.length || 0}
              </span>
            </button>
            
            <button
              onClick={handleComment}
              className="flex items-center space-x-2 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {post.comments?.length || 0}
              </span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200">
              <ShareIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              {/* Comment input */}
              <div className="flex items-center space-x-3">
                <Avatar size="sm" fallback="You" />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <Button size="sm">Post</Button>
              </div>
              
              {/* Existing comments */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-3">
                  {post.comments.map((comment: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Avatar size="sm" fallback={comment.author?.nickname || comment.author?.studentId} />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {comment.author?.nickname || comment.author?.studentId}
                          </h4>
                          <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{new Date(comment.createdAt).toLocaleString()}</span>
                          <button className="hover:text-gray-700">Like</button>
                          <button className="hover:text-gray-700">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedPage;