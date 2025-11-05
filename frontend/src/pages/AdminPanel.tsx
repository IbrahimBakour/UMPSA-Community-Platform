import { Link, Outlet, useLocation } from "react-router-dom";
import TopNavigation from "../components/layout/TopNavigation";
import Sidebar from "../components/layout/Sidebar";
import { motion } from "framer-motion";

const AdminPanel = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Pending Posts", href: "/admin/pending-posts" },
    { name: "Clubs", href: "/admin/clubs" },
    { name: "Users", href: "/admin/users" },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top Navigation */}
      <TopNavigation />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-sm text-gray-500">
                  Manage site content and users
                </p>
              </div>
            </div>

            {/* Navigation Tabs (pill style) */}
            <div className="mb-6">
              <nav className="flex items-center gap-3 overflow-x-auto pb-2">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href === "/admin/dashboard" &&
                      location.pathname === "/admin");
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`px-3 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
