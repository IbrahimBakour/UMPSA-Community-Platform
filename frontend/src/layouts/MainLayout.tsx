import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      {user?.status === "restricted" && (
        <div className="bg-gradient-to-r from-state-error to-state-warning/90 text-white text-center p-2 shadow-soft animate-fade-in">
          <p className="text-sm font-medium">
            You are currently restricted. Some actions may be disabled.
          </p>
        </div>
      )}
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full rounded-xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
