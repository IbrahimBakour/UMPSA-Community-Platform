import { useAddReaction } from '../services/posts';
import { AnyPost } from '../types';
import { FaThumbsUp, FaHeart, FaLaugh, FaThumbsDown } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

interface ReactionButtonsProps {
  post: AnyPost;
}

const ReactionButtons = ({ post }: ReactionButtonsProps) => {
  const { user } = useAuth();
  const addReactionMutation = useAddReaction(post.type, post._id);

  const handleReaction = (reactionType: 'like' | 'love' | 'laugh' | 'dislike') => {
    if (user?.status === 'restricted') {
      return;
    }
    addReactionMutation.mutate(reactionType);
  };

  const getReactionCount = (reactionType: 'like' | 'love' | 'laugh' | 'dislike') => {
    // This is a simplified count. In a real app, you'd have a more complex structure
    // to store counts for each reaction type.
    return post.likes.length; // Assuming 'likes' array stores all reactions for now
  };

  const userHasReacted = (reactionType: 'like' | 'love' | 'laugh' | 'dislike') => {
    // Simplified check: assuming user can only have one reaction type per post
    return post.likes.includes(user?._id || '');
  };

  return (
    <div className="flex items-center space-x-4 mt-4">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleReaction('like')}
        className={`flex items-center space-x-1 ${userHasReacted('like') ? 'text-blue-600' : 'text-gray-500'}`}
        disabled={user?.status === 'restricted'}
      >
        <FaThumbsUp />
        <span>{getReactionCount('like')}</span>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleReaction('love')}
        className={`flex items-center space-x-1 ${userHasReacted('love') ? 'text-red-600' : 'text-gray-500'}`}
        disabled={user?.status === 'restricted'}
      >
        <FaHeart />
        <span>{getReactionCount('love')}</span>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleReaction('laugh')}
        className={`flex items-center space-x-1 ${userHasReacted('laugh') ? 'text-yellow-600' : 'text-gray-500'}`}
        disabled={user?.status === 'restricted'}
      >
        <FaLaugh />
        <span>{getReactionCount('laugh')}</span>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleReaction('dislike')}
        className={`flex items-center space-x-1 ${userHasReacted('dislike') ? 'text-gray-600' : 'text-gray-500'}`}
        disabled={user?.status === 'restricted'}
      >
        <FaThumbsDown />
        <span>{getReactionCount('dislike')}</span>
      </motion.button>
    </div>
  );
};

export default ReactionButtons;
