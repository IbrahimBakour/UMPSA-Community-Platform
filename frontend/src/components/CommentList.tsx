import { Comment } from '../types';

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  return (
    <div className="mt-4">
      {comments && comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        comments && comments.map((comment) => (
          <div key={comment._id} className="flex items-start mt-2 border-b pb-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
              <span className="text-xs text-gray-600">U</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">User</p>
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
