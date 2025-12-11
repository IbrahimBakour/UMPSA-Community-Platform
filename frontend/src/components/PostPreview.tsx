/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyPost } from "../types";
import { API_BASE_URL } from "../utils/constants";

interface PostPreviewProps {
  post: AnyPost;
}

type PopulatedAuthor = {
  nickname?: string;
  studentId?: string;
  profilePicture?: string;
};

// Helper function to get full image URL
const getImageUrl = (path: string): string => {
  if (!path) return "";

  // If it's already a full URL, return it
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Normalize the path to always start with a single /
  let cleanPath = path.replace(/\/+/g, "/");
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  // Combine with API_BASE_URL
  return `${API_BASE_URL}${cleanPath}`;
};

const PostPreview = ({ post }: PostPreviewProps) => {
  // Get author information (handle both populated and non-populated cases)
  const rawAuthor = (post as any).author as
    | string
    | PopulatedAuthor
    | undefined;
  const author: PopulatedAuthor | null =
    rawAuthor && typeof rawAuthor === "object" ? rawAuthor : null;
  const authorName = author?.nickname || "Unknown User";
  const authorId = author?.studentId || "";
  const profilePicture = author?.profilePicture;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Author Info */}
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
          {profilePicture ? (
            <img
              src={getImageUrl(profilePicture)}
              alt={authorName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-gray-600 font-semibold">
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{authorName}</p>
          <p className="text-sm text-gray-500">{authorId || "N/A"}</p>
        </div>
        <span className="ml-auto text-xs text-gray-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Post Content */}
      <div className="text-gray-800 whitespace-pre-wrap">{post.content}</div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {post.media.slice(0, 4).map((mediaUrl, index) => {
            const fullUrl = getImageUrl(mediaUrl);
            const isVideo = /\.mp4$/i.test(fullUrl);
            return isVideo ? (
              <video
                key={index}
                src={fullUrl}
                className="w-full h-32 object-cover rounded-md"
                controls
              />
            ) : (
              <img
                key={index}
                src={fullUrl}
                alt={`Media ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            );
          })}
          {post.media.length > 4 && (
            <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                +{post.media.length - 4} more
              </span>
            </div>
          )}
        </div>
      )}

      {/* Poll Preview */}
      {post.poll && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-semibold text-blue-900 mb-2">
            Poll: {post.poll.question}
          </p>
          <div className="space-y-1">
            {post.poll.options.map((option, index) => (
              <div key={index} className="text-sm text-blue-800">
                • {option.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Preview */}
      {post.calendarEvent && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="font-semibold text-green-900">
            Event: {post.calendarEvent.title}
          </p>
          <p className="text-sm text-green-700">
            {new Date(post.calendarEvent.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostPreview;
