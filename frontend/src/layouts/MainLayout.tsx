import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";

const MainLayout = () => {
  const { user } = useAuth();

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
          <div className="w-full h-full rounded-xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
