import { AnyPost } from "../types";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import ReactionButtons from "./ReactionButtons";
import { useAuth } from "../hooks/useAuth";
import { useDeletePost } from "../services/posts";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateReport } from '../services/reports';
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";

interface PostCardProps {
  post: AnyPost;
}

const reportPostSchema = z.object({
  reason: z.string().min(1, 'Reason cannot be empty'),
});

type ReportPostFormInputs = z.infer<typeof reportPostSchema>;

const PostCard = ({ post }: PostCardProps) => {
  const { isAdmin } = useAuth();
  const deletePostMutation = useDeletePost();
  const createReportMutation = useCreateReport();
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReportPostFormInputs>({
    resolver: zodResolver(reportPostSchema),
  });

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

  const handleReportSubmit = (data: ReportPostFormInputs) => {
    createReportMutation.mutate({
      targetType: 'post',
      targetId: post._id,
      reason: data.reason,
    }, {
      onSuccess: () => {
        toast.success("Post reported successfully!");
        setReportModalOpen(false);
        reset();
      },
      onError: () => {
        toast.error("Failed to report post. Please try again.");
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
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="text-orange-500 hover:text-orange-700 text-sm"
          >
            Report
          </button>
          {isAdmin && (
            <button
              onClick={() => setConfirmationOpen(true)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="text-lg">{post.content}</p>
      {post.media && post.media.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {post.media.map((mediaUrl, index) => (
            <img
              key={index}
              src={mediaUrl}
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
                <span>{option.text}</span>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Vote
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {post.calendarEvent && (
        <div className="mt-4">
          <h4 className="font-bold">{post.calendarEvent.title}</h4>
          <p className="text-gray-600">
            {new Date(post.calendarEvent.date).toLocaleDateString()}
          </p>
          <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Going
          </button>
        </div>
      )}
      <ReactionButtons post={post} />
      <CommentList comments={post.comments} />
      <CommentInput postId={post._id} postType={post.postType} />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
      
      {/* Report Post Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Report Post</h2>
            <form onSubmit={handleSubmit(handleReportSubmit)}>
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <textarea
                  {...register('reason')}
                  id="reason"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Please describe why you are reporting this post"
                ></textarea>
                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createReportMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {createReportMutation.isPending ? 'Reporting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;
