import { Comment } from '../types';

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  return (
    <div className="mt-4">
      {comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="flex items-start mt-2">
            <img src={comment.author.profilePicture} alt={comment.author.nickname} className="w-8 h-8 rounded-full mr-3" />
            <div>
              <p className="font-bold text-sm">{comment.author.nickname}</p>
              <p className="text-gray-700 text-sm">{comment.content}</p>
              <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList;
