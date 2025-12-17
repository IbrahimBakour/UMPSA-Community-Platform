import { Club } from "../types";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/constants";

interface ClubCardProps {
  club: Club;
  currentUserId?: string;
}

// Helper function to get full image URL with cache busting
const getImageUrl = (path?: string): string => {
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

  // Combine with API_BASE_URL and add cache-busting query parameter
  // Extract timestamp from filename (format: fieldName-timestamp-random.ext)
  const timestampMatch = cleanPath.match(/-(\d+)-\d+\./);
  const timestamp = timestampMatch ? timestampMatch[1] : Date.now();

  return `${API_BASE_URL}${cleanPath}?t=${timestamp}`;
};

const truncateText = (text?: string, length = 140) => {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
};

const ClubCard = ({ club, currentUserId }: ClubCardProps) => {
  const isMember = !!currentUserId && club.members?.includes(currentUserId);
  const isLeader = !!currentUserId && club.clubLeader === currentUserId;
  const memberCount = club.memberCount ?? club.members?.length;
  const profileUrl = club.profilePicture
    ? getImageUrl(club.profilePicture)
    : "";
  const bannerUrl = club.banner ? getImageUrl(club.banner) : "";
  const badge = isLeader ? "Leader" : isMember ? "Member" : undefined;
  const created = club.createdAt ? new Date(club.createdAt) : null;

  // Debug logging for image fetching
  console.log(`Club: ${club.name}`, {
    rawProfilePicture: club.profilePicture,
    resolvedProfileUrl: profileUrl,
    rawBanner: club.banner,
    resolvedBannerUrl: bannerUrl,
  });

  return (
    <Link to={`/clubs/${club._id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="relative h-32 bg-gray-100">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={`${club.name} banner`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log(`Banner load error for ${club.name}:`, bannerUrl);
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
          )}
          {badge && (
            <span className="absolute top-3 left-3 bg-white/90 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full shadow">
              {badge}
            </span>
          )}
          <div
            className={`absolute -bottom-8 left-4 w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-md ${
              !club.profilePicture
                ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                : ""
            }`}
          >
            <img
              src={profileUrl || "/default-club-avatar.svg"}
              alt={`${club.name} profile`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log(
                  `Profile picture load error for ${club.name}:`,
                  profileUrl
                );
                (e.target as HTMLImageElement).src = "/default-club-avatar.svg";
              }}
            />
          </div>
        </div>

        <div className="p-4 pt-10 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {club.name}
            </h3>
            {memberCount !== undefined && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            )}
          </div>
          {club.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {truncateText(club.description)}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
            {created && <span>Founded {created.toLocaleDateString()}</span>}
            {club.clubLeader && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Leader assigned
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClubCard;
