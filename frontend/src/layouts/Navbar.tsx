import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-surface-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link
              to="/feed"
              className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              UMPSA Community
            </Link>
            <div className="hidden md:flex items-baseline space-x-2">
              <Link
                to="/feed"
                className="px-4 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100 hover:text-primary-600 transition-all duration-200"
              >
                Feed
              </Link>
              <Link
                to="/clubs"
                className="px-4 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100 hover:text-primary-600 transition-all duration-200"
              >
                Clubs
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100 hover:text-primary-600 transition-all duration-200"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full ring-2 ring-surface-200 hover:ring-primary-400 transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.profilePicture}
                        alt={user.nickname}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-surface-100">
                        <FaUser className="text-surface-500" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mt-1"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm font-medium leading-none text-surface-900">
                        {user.nickname}
                      </p>
                      <p className="text-xs leading-none text-surface-500">
                        {user.studentId}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-surface-100" />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer hover:bg-surface-100 focus:bg-surface-100 transition-colors"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-state-error hover:bg-state-error/10 focus:bg-state-error/10 transition-colors"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
