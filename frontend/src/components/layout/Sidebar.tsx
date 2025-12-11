import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// import { Button, Badge } from "../ui";
import CreatePostModal from "../CreatePostModal";
import {
  PlusIcon,
  UserGroupIcon,
  FlagIcon,
  ChartBarIcon,
  UsersIcon,
  // HomeIcon,
  // CalendarIcon,
} from "@heroicons/react/24/outline";

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = user?.role === "admin";

  const quickActions = [
    {
      name: "Create Post",
      href: "/feed/create",
      icon: PlusIcon,
      current: location.pathname === "/feed/create",
    },
    {
      name: "Join Club",
      href: "/clubs",
      icon: UserGroupIcon,
      current: location.pathname === "/clubs",
    },
    {
      name: "Report Issue",
      href: "/reports",
      icon: FlagIcon,
      current: location.pathname === "/reports",
    },
  ];

  const adminActions = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: ChartBarIcon,
      current: location.pathname.startsWith("/admin/dashboard"),
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: UsersIcon,
      current: location.pathname.startsWith("/admin/users"),
    },
  ];

  // const recentActivity = [
  //   { name: "New post in Tech Club", time: "2m ago", type: "post" },
  //   { name: "Poll: Best programming language?", time: "1h ago", type: "poll" },
  //   { name: "Event: Coding Workshop", time: "3h ago", type: "event" },
  // ];

  // const popularClubs = [
  //   { name: "Tech Club", members: 156, joined: false },
  //   { name: "Sports Club", members: 89, joined: true },
  //   { name: "Art Club", members: 67, joined: false },
  // ];

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
          )}
          <div className="space-y-2">
            {quickActions.map((action) => {
              if (action.name === "Create Post") {
                return (
                  <div key={action.name}>
                    <CreatePostModal
                      renderTrigger={(open) => (
                        <button
                          onClick={open}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            action.current
                              ? "bg-primary-50 text-primary-600"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <action.icon className="w-5 h-5 mr-3" />
                          {!isCollapsed && action.name}
                        </button>
                      )}
                    />
                  </div>
                );
              }

              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    action.current
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <action.icon className="w-5 h-5 mr-3" />
                  {!isCollapsed && action.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="p-4 border-b border-gray-200">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Admin Panel
              </h3>
            )}
            <div className="space-y-2">
              {adminActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    action.current
                      ? "bg-secondary-50 text-secondary-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <action.icon className="w-5 h-5 mr-3" />
                  {!isCollapsed && action.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity
        <div className="p-4 border-b border-gray-200 flex-1">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recent Activity
            </h3>
          )}
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {activity.type === 'post' && <HomeIcon className="w-4 h-4 text-gray-400" />}
                  {activity.type === 'poll' && <ChartBarIcon className="w-4 h-4 text-gray-400" />}
                  {activity.type === 'event' && <CalendarIcon className="w-4 h-4 text-gray-400" />}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.name}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>


        //         {!isCollapsed && (
        //           <>
        //             <div className="flex-1 min-w-0">
        //               <p className="text-sm font-medium text-gray-900 truncate">
        //                 {club.name}
        //               </p>
        //               <p className="text-xs text-gray-500">{club.members} members</p>
        //             </div>
        //             {club.joined ? (
        //               <Badge variant="success" size="sm">
        //                 Joined
        //               </Badge>
        //             ) : (
        //               <Button size="sm" variant="outline">
        //                 Join
        //               </Button>
        //             )}
        //           </>
        //         )}
        //         {isCollapsed && (
        //           <UserGroupIcon className="w-5 h-5 text-gray-400" />
        //         )}
        //       </div>
        //     ))}
        //   </div>
        // </div> */}
      </div>
    </div>
  );
};

export default Sidebar;
