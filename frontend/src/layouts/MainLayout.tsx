import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      {user?.status === 'restricted' && (
        <div className="bg-red-500 text-white text-center p-2">
          You are currently restricted. Some actions may be disabled.
        </div>
      )}
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
