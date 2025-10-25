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
  const addReactionMutation = useAddReaction(post._id);

  const handleReaction = (reactionType: 'like' | 'love' | 'laugh' | 'dislike') => {
    if (user?.status === 'restricted') {
      return;
    }
    addReactionMutation.mutate(reactionType);
  };

  const getReactionCount = (reactionType: 'like' | 'love' | 'laugh' | 'dislike') => {
    if (!post.interactions || post.interactions.length === 0) return 0;
    return post.interactions.filter(r => r.type === reactionType).length;
  };

  const userHasReacted = (reactionType: 'like' | 'love' | 'laugh' | 'dislike') => {
    if (!post.interactions || !user) return false;
    return post.interactions.some(r => r.user === user._id && r.type === reactionType);
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
