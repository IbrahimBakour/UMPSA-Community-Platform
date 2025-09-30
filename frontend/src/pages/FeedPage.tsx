import { useFeedPosts, useCreateFeedPost } from '../services/posts';
import PostCard from '../components/PostCard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty'),
});

type CreatePostFormInputs = z.infer<typeof createPostSchema>;

const FeedPage = () => {
  const { data: posts, isLoading, error } = useFeedPosts();
  const createPostMutation = useCreateFeedPost();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePostFormInputs>({
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit = (data: CreatePostFormInputs) => {
    createPostMutation.mutate(data.content, {
      onSuccess: () => {
        toast.success('Post created successfully!');
        reset();
      },
      onError: () => {
        toast.error('Failed to create post. Please try again.');
      },
    });
  };

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  if (error) {
    return <div>Error fetching posts: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-bold mb-4">Create Post</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <textarea
            {...register('content')}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="What's on your mind?"
          ></textarea>
          {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
      <div>
        {posts?.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
