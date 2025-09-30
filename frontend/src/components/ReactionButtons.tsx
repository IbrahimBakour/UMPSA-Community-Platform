import { useAddReaction } from '../services/posts';
import { AnyPost, Reaction } from '../types';
import { FaThumbsUp, FaHeart, FaLaugh, FaThumbsDown } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

interface ReactionButtonsProps {
  post: AnyPost;
}

const ReactionButtons = ({ post }: ReactionButtonsProps) => {
  const { user } = useAuth();
  const addReactionMutation = useAddReaction(post.type, post._id);

  const handleReaction = (reactionType: Reaction['reaction']) => {
    if (user?.restriction?.status) {
      return;
    }
    addReactionMutation.mutate(reactionType);
  };

  const getReactionCount = (reactionType: Reaction['reaction']) => {
    return post.reactions.filter((r) => r.reaction === reactionType).length;
  };

  const userReaction = post.reactions.find((r) => r.userId === user?._id)?.reaction;

  return (
    <div className="flex items-center space-x-4 mt-4">
      <button
        onClick={() => handleReaction('like')}
        className={`flex items-center space-x-1 ${userReaction === 'like' ? 'text-blue-600' : 'text-gray-500'}`}
        disabled={user?.restriction?.status}
      >
        <FaThumbsUp />
        <span>{getReactionCount('like')}</span>
      </button>
      <button
        onClick={() => handleReaction('love')}
        className={`flex items-center space-x-1 ${userReaction === 'love' ? 'text-red-600' : 'text-gray-500'}`}
        disabled={user?.restriction?.status}
      >
        <FaHeart />
        <span>{getReactionCount('love')}</span>
      </button>
      <button
        onClick={() => handleReaction('laugh')}
        className={`flex items-center space-x-1 ${userReaction === 'laugh' ? 'text-yellow-600' : 'text-gray-500'}`}
        disabled={user?.restriction?.status}
      >
        <FaLaugh />
        <span>{getReactionCount('laugh')}</span>
      </button>
      <button
        onClick={() => handleReaction('dislike')}
        className={`flex items-center space-x-1 ${userReaction === 'dislike' ? 'text-gray-800' : 'text-gray-500'}`}
        disabled={user?.restriction?.status}
      >
        <FaThumbsDown />
        <span>{getReactionCount('dislike')}</span>
      </button>
    </div>
  );
};

export default ReactionButtons;
