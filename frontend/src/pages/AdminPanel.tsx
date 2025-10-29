import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminPanel = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Pending Posts', href: '/admin/pending-posts' },
    { name: 'Clubs', href: '/admin/clubs' },
    { name: 'Users', href: '/admin/users' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                location.pathname === item.href || 
                (item.href === '/admin/dashboard' && location.pathname === '/admin')
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPanel;