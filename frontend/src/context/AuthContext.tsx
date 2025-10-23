import { createContext, useState, ReactNode, useEffect } from "react";
import { User } from "../types";
import { USER_ROLES } from "../utils/constants";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClubMember: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  useEffect(() => {
    // On initial load, if a token exists, fetch the user profile
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          // Clear invalid data
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setToken(null);
        }
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newUser: User, newToken: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isClubMember = user?.role === USER_ROLES.CLUB_MEMBER;

  const authContextValue = {
    isAuthenticated,
    isAdmin,
    isClubMember,
    user,
    token,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
