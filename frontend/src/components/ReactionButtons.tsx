import { useAddReaction } from '../services/posts';
import { AnyPost } from '../types';
import { FaThumbsUp, FaHeart, FaLaugh, FaThumbsDown } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

interface ReactionButtonsProps {
  post: AnyPost;
}

const ReactionButtons = ({ post }: ReactionButtonsProps) => {
  const { user } = useAuth();
  const addReactionMutation = useAddReaction(post.type, post._id);

  const handleReaction = (reactionType: 'like') => {
    if (user?.restriction?.status) {
      return;
    }
    addReactionMutation.mutate(reactionType);
  };

  const getReactionCount = () => {
    return post.likes.length;
  };

  const userHasLiked = post.likes.includes(user?._id || '');

  return (
    <div className="flex items-center space-x-4 mt-4">
      <button
        onClick={() => handleReaction('like')}
        className={`flex items-center space-x-1 ${userHasLiked ? 'text-blue-600' : 'text-gray-500'}`}
        disabled={user?.restriction?.status}
      >
        <FaThumbsUp />
        <span>{getReactionCount()}</span>
      </button>
      {/* Other reaction types (love, laugh, dislike) are not supported by the current backend 'likes' array */}
    </div>
  );
};

export default ReactionButtons;
