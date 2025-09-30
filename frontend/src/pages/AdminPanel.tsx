import { Link, Outlet } from 'react-router-dom';

const AdminPanel = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <div className="flex space-x-4 mb-4">
        <Link to="/admin/pending-posts" className="px-4 py-2 bg-gray-200 rounded-md">Pending Posts</Link>
        <Link to="/admin/clubs" className="px-4 py-2 bg-gray-200 rounded-md">Clubs</Link>
        <Link to="/admin/users" className="px-4 py-2 bg-gray-200 rounded-md">Users</Link>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPanel;