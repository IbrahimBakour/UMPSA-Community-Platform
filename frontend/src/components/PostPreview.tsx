/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyPost } from "../types";
import { API_BASE_URL } from "../utils/constants";
import { formatDateTime } from "../lib/utils";

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

const PostPreview = ({ post }: PostPreviewProps) => {
  // Get author information (handle both populated and non-populated cases)
  const rawAuthor = (post as any).author as
    | string
    | PopulatedAuthor
    | undefined;
  const author: PopulatedAuthor | null =
    rawAuthor && typeof rawAuthor === "object" ? rawAuthor : null;
  const authorName = author?.nickname || "Unknown User";
  const profilePicture = author?.profilePicture;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Author Info */}
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
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
        <div className="flex-1">
          <p className="text-sm font-semibold text-surface-900">{authorName}</p>
          <p className="text-xs text-surface-500">
            {getRelativeTime(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="text-base leading-relaxed text-surface-800 mb-3">
        {post.content}
      </div>

      {/* Poll Preview (view-only) */}
      {post.poll && post.poll.question && (
        <div className="mt-3 border border-indigo-100 rounded-lg bg-indigo-50/60 p-4">
          <p className="text-sm font-semibold text-indigo-900 mb-2">
            {post.poll.question}
          </p>
          <div className="space-y-2">
            {post.poll.options.map((option, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-indigo-800"
              >
                <span className="mt-0.5 h-2 w-2 rounded-full bg-indigo-500" />
                <span>{option.text}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-indigo-700 mt-3">
            Voting disabled in review.
          </p>
        </div>
      )}

      {/* Media (match PostCard dimensions to avoid cropping) */}
      {post.media && post.media.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-3">
          {post.media.slice(0, 3).map((mediaUrl, index) => {
            const fullUrl = getImageUrl(mediaUrl);
            const isVideo = /\.mp4$/i.test(fullUrl);
            const isSingle = post.media?.length === 1;

            // Full-width media with consistent aspect ratios; single gets a bit more height (same as PostCard)
            const aspectRatio = isSingle ? "4 / 3" : "4 / 3";
            const maxHeight = isSingle ? "420px" : "340px";

            return (
              <div
                key={index}
                className="relative w-full overflow-hidden rounded-md bg-surface-100"
                style={{ aspectRatio, maxHeight }}
              >
                {isVideo ? (
                  <video
                    src={fullUrl}
                    className="absolute inset-0 w-full h-full object-contain bg-surface-100"
                    controls
                  />
                ) : (
                  <img
                    src={fullUrl}
                    alt={`Media ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain bg-surface-100"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            );
          })}
          {post.media.length > 3 && (
            <div
              className="relative w-full overflow-hidden rounded-md bg-gray-100 flex items-center justify-center"
              style={{ aspectRatio: "4 / 3", maxHeight: "340px" }}
            >
              <span className="text-gray-500 text-sm font-medium">
                +{post.media.length - 3} more
              </span>
            </div>
          )}
        </div>
      )}

      {/* Event Preview */}
      {post.calendarEvent && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="font-semibold text-green-900">
            Event: {post.calendarEvent.title}
          </p>
          <p className="text-sm text-green-700">
            {formatDateTime(post.calendarEvent.date, {
              weekday: "long",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostPreview;
