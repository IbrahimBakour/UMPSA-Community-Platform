import { createContext, useState, ReactNode, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClubMember: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
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
    // On initial load, if a token exists, you might want to fetch the user profile
    // For now, we'll just decode the token or assume the user is logged in if token is present
    if (token) {
      // In a real app, you would fetch the user from the server here
      // For now, we'll just set a placeholder user if a token is found
      // You would replace this with a call to your API: GET /users/me
      // For demonstration, we'll extract user from a dummy token or localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
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

  const isAuthenticated = !!token;
  const isAdmin = user?.role === "admin";
  const isClubMember = user?.role === "club_member";

  const authContextValue = {
    isAuthenticated,
    isAdmin,
    isClubMember,
    user,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
