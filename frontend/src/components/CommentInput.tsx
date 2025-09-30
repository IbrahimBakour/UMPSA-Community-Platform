import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAddComment } from '../services/posts';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

type CommentFormInputs = z.infer<typeof commentSchema>;

interface CommentInputProps {
  postId: string;
  postType: 'feed' | 'club';
}

const CommentInput = ({ postId, postType }: CommentInputProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormInputs>({
    resolver: zodResolver(commentSchema),
  });
  const addCommentMutation = useAddComment(postType, postId);

  const onSubmit = (data: CommentFormInputs) => {
    addCommentMutation.mutate(data.content, {
      onSuccess: () => {
        toast.success('Comment added!');
        reset();
      },
      onError: () => {
        toast.error('Failed to add comment.');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center mt-4">
      <input
        type="text"
        {...register('content')}
        placeholder="Add a comment..."
        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        disabled={addCommentMutation.isPending}
      >
        {addCommentMutation.isPending ? 'Adding...' : 'Comment'}
      </button>
      {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
    </form>
  );
};

export default CommentInput;
