import { AnyPost } from '../types';
import CommentList from './CommentList';
import CommentInput from './CommentInput';
import ReactionButtons from './ReactionButtons';

interface PostCardProps {
  post: AnyPost;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        <img src={post.author.profilePicture} alt={post.author.nickname} className="w-10 h-10 rounded-full mr-4" />
        <div>
          <p className="font-bold">{post.author.nickname}</p>
          <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <p>{post.content}</p>
      {post.media && post.media.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {post.media.map((mediaItem, index) => (
            <img key={index} src={mediaItem} alt="Post media" className="w-full h-auto rounded-md" />
          ))}
        </div>
      )}
      <ReactionButtons post={post} />
      <CommentList comments={post.comments} />
      <CommentInput postId={post._id} postType={post.type} />
    </div>
  );
};

export default PostCard;
