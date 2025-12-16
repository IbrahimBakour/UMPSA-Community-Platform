import { useState, useRef, useEffect } from "react";
import {
  useNotifications,
  useNotificationStats,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "../services/notifications";
import { BellIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Notification } from "../types";
import { Link } from "react-router-dom";

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

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: stats } = useNotificationStats();
  const { data: notificationsData, isLoading } = useNotifications({
    limit: 10,
    page: 1,
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = stats?.unreadNotifications || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    // Prevent navigation when delete is clicked inside a Link
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "post_approved":
        return "✅";
      case "post_rejected":
        return "❌";
      case "post_liked":
        return "❤️";
      case "post_commented":
        return "💬";
      case "club_joined":
        return "👥";
      case "report_resolved":
        return "✅";
      case "user_restricted":
        return "⚠️";
      default:
        return "📬";
    }
  };

  const getNotificationLink = (notification: Notification): string | null => {
    if (notification.relatedPost) {
      return "/feed";
    }
    if (notification.relatedClub) {
      return `/clubs/${notification.relatedClub}`;
    }
    if (notification.relatedReport) {
      return "/reports";
    }
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const link = getNotificationLink(notification);
                    const content = (
                      <div
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {getRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDelete(e, notification._id)}
                            className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );

                    return link ? (
                      <Link key={notification._id} to={link}>
                        {content}
                      </Link>
                    ) : (
                      <div key={notification._id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
