import { AnyPost } from "../types";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import ReactionButtons from "./ReactionButtons";
import { useAuth } from "../hooks/useAuth";
import { useDeletePost } from "../services/posts";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";

interface PostCardProps {
  post: AnyPost;
}

const PostCard = ({ post }: PostCardProps) => {
  const { isAdmin } = useAuth();
  const deletePostMutation = useDeletePost();
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  const handleDelete = () => {
    deletePostMutation.mutate(post._id, {
      onSuccess: () => {
        toast.success("Post deleted successfully!");
        setConfirmationOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete post. Please try again.");
      },
    });
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      className="bg-white rounded-lg shadow-md p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {/* <Avatar>
            <AvatarImage src={post.author.profilePicture} alt={post.author.nickname} />
            <AvatarFallback>{post.author.nickname.charAt(0)}</AvatarFallback>
          </Avatar> */}
          <div className="ml-4">
            <p className="font-bold"></p>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setConfirmationOpen(true)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
      <p>{post.content}</p>
      {post.images && post.images.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {post.images.map((imageItem, index) => (
            <img
              key={index}
              src={imageItem}
              alt="Post media"
              className="w-full h-auto rounded-md"
            />
          ))}
        </div>
      )}
      {post.poll && (
        <div className="mt-4">
          <h4 className="font-bold">{post.poll.question}</h4>
          <div className="mt-2 space-y-2">
            {post.poll.options.map((option, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{option}</span>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Vote
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {post.event && (
        <div className="mt-4">
          <h4 className="font-bold">{post.event.title}</h4>
          <p className="text-gray-600">
            {new Date(post.event.date).toLocaleDateString()}
          </p>
          <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Going
          </button>
        </div>
      )}
      <ReactionButtons post={post} />
      <CommentList comments={post.comments} />
      <CommentInput postId={post._id} postType={post.type} />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </motion.div>
  );
};

export default PostCard;
