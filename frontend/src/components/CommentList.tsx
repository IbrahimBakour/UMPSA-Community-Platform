/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Comment } from "../types";
import { API_BASE_URL } from "../utils/constants";

interface CommentListProps {
  comments: Comment[];
}

// Build full media URL similarly to other components
const getImageUrl = (path?: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  let cleanPath = path.replace(/\/+/g, "/");
  if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Helper function to format relative time
const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now.getTime() - postDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

const CommentList = ({ comments }: CommentListProps) => {
  const { user: authUser } = useAuth();

  return (
    <div className="mt-4">
      {comments && comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        comments &&
        comments.map((comment) => {
          const author: any = (comment as any).author;
          const authorObj =
            author && typeof author === "object" ? author : null;
          const authorId =
            authorObj?._id ||
            authorObj?.id ||
            (typeof author === "string" ? author : undefined);
          const authorName =
            authorObj?.nickname ||
            authorObj?.studentId ||
            (typeof author === "string" ? author : "Unknown User");
          const authorPic = authorObj?.profilePicture
            ? getImageUrl(authorObj.profilePicture)
            : undefined;
          const initial = authorName ? authorName.charAt(0).toUpperCase() : "?";

          const profileHref = authorId
            ? authorId === (authUser?.id || authUser?._id)
              ? "/users/me"
              : `/users/${authorId}`
            : undefined;

          const avatar = (
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-3 flex items-center justify-center">
              {authorPic ? (
                <img
                  src={authorPic}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-600">{initial}</span>
              )}
            </div>
          );

          const content = (
            <div className="flex-1">
              <p className="font-bold text-sm">{authorName}</p>
              <p className="text-gray-700 text-sm">{comment.content}</p>
              <p className="text-xs text-gray-500">
                {getRelativeTime(comment.createdAt)}
              </p>
            </div>
          );

          return (
            <div
              key={comment._id}
              className="flex items-start mt-2 border-b pb-2"
            >
              {profileHref ? (
                <Link to={profileHref} className="flex items-start flex-1">
                  {avatar}
                  {content}
                </Link>
              ) : (
                <>
                  {avatar}
                  {content}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CommentList;
