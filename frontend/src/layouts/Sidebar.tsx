import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <aside className="w-64 bg-gray-50 border-r p-4">
      <nav className="flex flex-col space-y-2">
        <h3 className="text-xs font-semibold uppercase text-gray-500">Admin Menu</h3>
        <Link to="/admin/pending-posts" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Pending Posts</Link>
        <Link to="/admin/clubs" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Manage Clubs</Link>
        <Link to="/admin/users" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Manage Users</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
