/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyPost } from "../types";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import ReactionButtons from "./ReactionButtons";
import { useAuth } from "../hooks/useAuth";
import { useDeletePost } from "../services/posts";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateReport } from "../services/reports";
import { API_BASE_URL } from "../utils/constants";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { votePoll } from "../services/polls";
import { formatDateTime, toGoogleCalendarLink } from "../lib/utils";
import { translatePost, TargetLang } from "../services/translation";

// Helper to make links clickable and preserve formatting
const renderContentWithLinks = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-600 hover:text-accent-700 underline break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// Helper to normalize media URLs
const getImageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  let cleanPath = path.replace(/\/+/g, "/");
  if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Helper to format relative time
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

interface PostCardProps {
  post: AnyPost;
}

const reportPostSchema = z.object({
  reason: z.string().min(1, "Reason cannot be empty"),
});

type ReportPostFormInputs = z.infer<typeof reportPostSchema>;

const PostCard = ({ post }: PostCardProps) => {
  const { isAdmin, user: authUser } = useAuth();
  const deletePostMutation = useDeletePost();
  const createReportMutation = useCreateReport();
  const queryClient = useQueryClient();

  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isCommentsModalOpen, setCommentsModalOpen] = useState(false);
  const [isMediaModalOpen, setMediaModalOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translationTarget, setTranslationTarget] = useState<TargetLang | null>(
    null,
  );
  const [isTranslating, setIsTranslating] = useState(false);

  const votePollMutation = useMutation({
    mutationFn: ({
      postId,
      optionIndexes,
    }: {
      postId: string;
      optionIndexes: number[];
    }) => votePoll(postId, optionIndexes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["clubPosts"] });
      toast.success("Vote recorded successfully!");
    },
    onError: () => toast.error("Failed to vote. Please try again."),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportPostFormInputs>({
    resolver: zodResolver(reportPostSchema),
  });

  const handleDelete = () => {
    deletePostMutation.mutate(post._id, {
      onSuccess: () => {
        toast.success("Post deleted successfully!");
        setConfirmationOpen(false);
      },
      onError: () => toast.error("Failed to delete post. Please try again."),
    });
  };

  const handleReportSubmit = (data: ReportPostFormInputs) => {
    createReportMutation.mutate(
      { targetType: "post", targetId: post._id, reason: data.reason },
      {
        onSuccess: () => {
          toast.success("Post reported successfully!");
          setReportModalOpen(false);
          reset();
        },
        onError: () => toast.error("Failed to report post. Please try again."),
      },
    );
  };

  // Author resolution
  const authorObj =
    (post as any).author && typeof (post as any).author === "object"
      ? (post as any).author
      : null;
  const authorName =
    authorObj?.nickname || authorObj?.studentId || "Unknown User";
  const authorPic = authorObj?.profilePicture;
  const authorId =
    authorObj?._id ||
    authorObj?.id ||
    (typeof (post as any).author === "string"
      ? (post as any).author
      : undefined);

  const currentUserId = authUser?._id || authUser?.id;
  const isAuthor = currentUserId && authorId && currentUserId === authorId;
  const canDelete = isAdmin || (post.postType === "club" && isAuthor);

  const profileHref = authorId
    ? authorId === (authUser?.id || authUser?._id)
      ? "/users/me"
      : `/users/${authorId}`
    : undefined;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-100 flex-shrink-0">
            {profileHref ? (
              <Link to={profileHref} aria-label={`View ${authorName} profile`}>
                {authorPic ? (
                  <img
                    src={getImageUrl(authorPic)}
                    alt={authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-surface-600">
                    {authorName.charAt(0)}
                  </div>
                )}
              </Link>
            ) : authorPic ? (
              <img
                src={getImageUrl(authorPic)}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-surface-600">
                {authorName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            {profileHref ? (
              <Link
                to={profileHref}
                className="text-sm font-semibold text-surface-900 hover:text-accent-600"
              >
                {authorName}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-surface-900">
                {authorName}
              </p>
            )}
            <p className="text-xs text-surface-500">
              {getRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setReportModalOpen(true)}
            className="text-sm text-surface-500 hover:text-accent-600"
          >
            Report
          </button>
          {canDelete && (
            <button
              onClick={() => setConfirmationOpen(true)}
              className="text-sm text-surface-500 hover:text-state-error"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="text-base leading-relaxed text-surface-800 mb-2 whitespace-pre-wrap break-words">
        {renderContentWithLinks(translatedText ?? post.content)}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {translatedText ? (
          <>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              Translated to {translationTarget === "ms" ? "Malay" : "English"}
            </span>
            <button
              onClick={() => {
                setTranslatedText(null);
                setTranslationTarget(null);
              }}
              className="text-sm text-surface-500 hover:text-surface-700 underline"
            >
              Show Original
            </button>
          </>
        ) : (
          <>
            <button
              onClick={async () => {
                try {
                  setIsTranslating(true);
                  const text = await translatePost(post._id, "ms");
                  setTranslatedText(text);
                  setTranslationTarget("ms");
                } catch (e) {
                  toast.error("Failed to translate to Malay");
                } finally {
                  setIsTranslating(false);
                }
              }}
              disabled={isTranslating}
              className="text-sm px-3 py-1 rounded-md border border-surface-300 hover:bg-surface-50 disabled:opacity-50"
            >
              {isTranslating ? "Translating..." : "Translate to Malay"}
            </button>
            <button
              onClick={async () => {
                try {
                  setIsTranslating(true);
                  const text = await translatePost(post._id, "en");
                  setTranslatedText(text);
                  setTranslationTarget("en");
                } catch (e) {
                  toast.error("Failed to translate to English");
                } finally {
                  setIsTranslating(false);
                }
              }}
              disabled={isTranslating}
              className="text-sm px-3 py-1 rounded-md border border-surface-300 hover:bg-surface-50 disabled:opacity-50"
            >
              {isTranslating ? "Translating..." : "Translate to English"}
            </button>
          </>
        )}
      </div>

      {post.poll && post.poll.question && (
        <div className="mt-4 border border-indigo-200 rounded-lg p-4 bg-indigo-50">
          <h4 className="font-semibold text-indigo-900 mb-3">
            {post.poll.question}
          </h4>
          <div className="space-y-2">
            {post.poll.options.map((option, index) => {
              const totalVotes = post.poll!.totalVotes || 0;
              const percentage =
                totalVotes > 0
                  ? Math.round((option.votes / totalVotes) * 100)
                  : 0;
              const viewerId = authUser?._id || authUser?.id || "";
              const hasVotedThisOption = option.voters.includes(viewerId);
              const isPollEnded =
                post.poll!.endDate && new Date(post.poll!.endDate) < new Date();
              const isActive = post.poll!.isActive && !isPollEnded;

              const buttonText = votePollMutation.isPending
                ? "Voting..."
                : post.poll?.allowMultipleVotes && hasVotedThisOption
                  ? "Unvote"
                  : "Vote";

              return (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {option.text}
                      </span>
                      {hasVotedThisOption && (
                        <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                          Your vote
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {option.votes} {option.votes === 1 ? "vote" : "votes"} (
                        {percentage}%)
                      </span>
                      {isActive && (
                        <button
                          onClick={() => {
                            if (!authUser) {
                              toast.error("Please login to vote");
                              return;
                            }
                            votePollMutation.mutate({
                              postId: post._id,
                              optionIndexes: [index],
                            });
                          }}
                          disabled={votePollMutation.isPending}
                          className={`px-3 py-1 text-white text-sm rounded-md transition-colors ${
                            hasVotedThisOption && post.poll?.allowMultipleVotes
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {buttonText}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {post.poll.endDate && (
            <p className="text-xs text-gray-600 mt-3">
              {new Date(post.poll.endDate) > new Date()
                ? `Ends on ${new Date(post.poll.endDate).toLocaleDateString()}`
                : "Poll ended"}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Total votes: {post.poll.totalVotes || 0}
            {post.poll.allowMultipleVotes && " • Multiple votes allowed"}
          </p>
        </div>
      )}

      {post.media && post.media.length > 0 && (
        <div
          className={`mt-3 grid gap-3 ${
            post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {post.media.slice(0, 4).map((mediaUrl, index) => {
            const fullUrl = getImageUrl(mediaUrl);
            const isVideo = /\.mp4$/i.test(fullUrl);
            const isSingle = post.media?.length === 1;
            const remaining = (post.media?.length || 0) - 4;
            const isOverlay = remaining > 0 && index === 3;

            const aspectRatio = isSingle ? "4 / 3" : "4 / 3";
            const maxHeight = isSingle ? "420px" : "340px";

            return (
              <div
                key={index}
                className={`relative w-full overflow-hidden rounded-md bg-surface-100 ${
                  isOverlay ? "cursor-pointer" : ""
                }`}
                style={{ aspectRatio, maxHeight }}
                onClick={() => {
                  if (isOverlay) setMediaModalOpen(true);
                }}
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
                    alt={`Post media ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain bg-surface-100"
                    onError={(e) => {
                      console.error("Failed to load image:", mediaUrl);
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}

                {isOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm">
                    <span className="text-3xl font-semibold text-white">
                      +{remaining}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {post.calendarEvent && (
        <div className="mt-4 p-3 rounded-lg border border-indigo-200 bg-indigo-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-indigo-900">
                {post.calendarEvent.title}
              </h4>
              <p className="text-sm text-indigo-800">
                {formatDateTime(post.calendarEvent.date)}
              </p>
            </div>
            <a
              href={toGoogleCalendarLink(
                post.calendarEvent.title,
                new Date(post.calendarEvent.date),
                60,
                `Post by ${authorName || "UMPSA user"}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Add to Calendar
            </a>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-b border-surface-200 py-3">
        <ReactionButtons post={post} />
      </div>

      <div className="mt-4 border border-surface-200 rounded-lg p-4 bg-surface-50">
        <CommentList
          comments={[...post.comments]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 3)}
        />
        {post.comments.length > 3 && (
          <button
            onClick={() => setCommentsModalOpen(true)}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Show all {post.comments.length} comments
          </button>
        )}
        <CommentInput postId={post._id} postType={post.postType} />
      </div>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />

      {/* Media Gallery Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
              <h3 className="text-lg font-semibold text-surface-900">
                Media ({post.media?.length})
              </h3>
              <button
                onClick={() => setMediaModalOpen(false)}
                className="text-2xl leading-none text-surface-500 hover:text-surface-700"
                aria-label="Close media gallery"
              >
                x
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[75vh]">
              <div
                className={`grid gap-3 ${
                  post.media?.length === 1
                    ? "grid-cols-1"
                    : post.media?.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 md:grid-cols-3"
                }`}
              >
                {post.media?.map((mediaUrl, index) => {
                  const fullUrl = getImageUrl(mediaUrl);
                  const isVideo = /\.mp4$/i.test(fullUrl);

                  return (
                    <div
                      key={index}
                      className="relative w-full overflow-hidden rounded-md bg-surface-100"
                      style={{ aspectRatio: "4 / 3", maxHeight: "420px" }}
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
                          alt={`Post media ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-contain bg-surface-100"
                          onError={(e) => {
                            console.error("Failed to load image:", mediaUrl);
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Post Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Report Post</h2>
            <form onSubmit={handleSubmit(handleReportSubmit)}>
              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reason for reporting
                </label>
                <textarea
                  {...register("reason")}
                  id="reason"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Please describe why you are reporting this post"
                ></textarea>
                {errors.reason && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.reason.message}
                  </p>
                )}
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
                  {createReportMutation.isPending
                    ? "Reporting..."
                    : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Comments Modal */}
      {isCommentsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                All Comments ({post.comments.length})
              </h2>
              <button
                onClick={() => setCommentsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="mb-4 border-t pt-4">
              <CommentList
                comments={[...post.comments].sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )}
              />
            </div>
            <div className="border-t pt-4">
              <CommentInput postId={post._id} postType={post.postType} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
