import { useAddReaction } from "../services/posts";
import { AnyPost } from "../types";
import { FaThumbsUp, FaHeart, FaSmile, FaThumbsDown } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

interface ReactionButtonsProps {
  post: AnyPost;
}

const reactionMeta = {
  like: { icon: FaThumbsUp, title: "Like" },
  love: { icon: FaHeart, title: "Love" },
  laugh: { icon: FaSmile, title: "Haha" },
  dislike: { icon: FaThumbsDown, title: "Dislike" },
} as const;

const ReactionButtons = ({ post }: ReactionButtonsProps) => {
  const { user } = useAuth();
  const addReactionMutation = useAddReaction(post._id);

  const isDisabled =
    user?.status === "restricted" || addReactionMutation.status === "pending";

  const handleReaction = (reactionType: keyof typeof reactionMeta) => {
    if (isDisabled) return;
    addReactionMutation.mutate(reactionType);
  };

  const getReactionCount = (reactionType: keyof typeof reactionMeta) => {
    if (!post.interactions || post.interactions.length === 0) return 0;
    return post.interactions.filter((r) => r.type === reactionType).length;
  };

  const userHasReacted = (reactionType: keyof typeof reactionMeta) => {
    if (!post.interactions || !user) return false;
    return post.interactions.some(
      (r) => r.user === user._id && r.type === reactionType
    );
  };

  const totalReactions = post.interactions ? post.interactions.length : 0;

  const activeClassMap: Record<keyof typeof reactionMeta, string> = {
    like: "bg-blue-100 text-blue-600",
    love: "bg-red-100 text-red-600",
    laugh: "bg-yellow-100 text-yellow-600",
    dislike: "bg-gray-200 text-black-700",
  };

  const inactiveClassMap: Record<keyof typeof reactionMeta, string> = {
    like: "text-blue-600 hover:bg-blue-50",
    love: "text-red-600 hover:bg-red-50",
    laugh: "text-yellow-500 hover:bg-yellow-50",
    dislike: "text-gray-600 hover:bg-black-100",
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-3">
        {(Object.keys(reactionMeta) as Array<keyof typeof reactionMeta>).map(
          (key) => {
            const Meta = reactionMeta[key];
            const Icon = Meta.icon;
            const active = userHasReacted(key);
            const count = getReactionCount(key);

            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.1, rotate: active ? 0 : -5 }}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: active ? 1.1 : 1, rotate: active ? 5 : 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => handleReaction(key)}
                disabled={isDisabled}
                aria-pressed={active}
                title={`${Meta.title} — ${count}`}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  active ? activeClassMap[key] : inactiveClassMap[key]
                } disabled:opacity-60`}
              >
                <Icon />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="text-sm"
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            );
          }
        )}
      </div>

      <div className="text-sm text-gray-500">
        {totalReactions > 0
          ? `${totalReactions} reaction${totalReactions > 1 ? "s" : ""}`
          : ""}
      </div>
    </div>
  );
};

export default ReactionButtons;
