import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Sidebar = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <aside className="w-64 bg-surface-50/50 backdrop-blur-sm border-r border-surface-200 p-6">
      <nav className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <div className="h-1 w-1 rounded-full bg-primary-500 animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Admin Menu
          </h3>
        </div>

        <div className="flex flex-col space-y-1">
          <Link
            to="/admin/pending-posts"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100 hover:text-primary-600 active:bg-surface-200 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-surface-400 group-hover:bg-primary-500 transition-colors" />
              <span>Pending Posts</span>
            </div>
          </Link>

          <Link
            to="/admin/clubs"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100 hover:text-primary-600 active:bg-surface-200 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-surface-400 group-hover:bg-primary-500 transition-colors" />
              <span>Manage Clubs</span>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100 hover:text-primary-600 active:bg-surface-200 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-surface-400 group-hover:bg-primary-500 transition-colors" />
              <span>Manage Users</span>
            </div>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
