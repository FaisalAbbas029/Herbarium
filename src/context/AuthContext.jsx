import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

// This React Context makes the currently logged-in admin (or `null` if
// nobody is logged in) available anywhere in the app via the useAuth()
// hook below, instead of passing it down through props on every page.
const AuthContext = createContext(void 0);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Called on first load, and whenever we need to re-check who is logged
  // in. If a token is saved from a previous session, we ask the server
  // whether it's still valid (GET /api/auth/me) and load that user's
  // details; if the token is missing, expired, or invalid, we clear it.
  const checkAuth = async () => {
    const token = localStorage.getItem("gb_herbarium_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.warn("Session check failed or expired:", err);
      localStorage.removeItem("gb_herbarium_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Run the session check once when the app first mounts, so a page
  // refresh doesn't log the admin out.
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
    }
  };
  const refreshUser = async () => {
    await checkAuth();
  };
  const isAuthenticated = !!user;
  const isAdmin = !!user && user.status === "active";
  const isSuperAdmin = !!user && user.role === "superadmin" && user.status === "active";
  return <AuthContext.Provider
    value={{
      user,
      isLoading,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      login,
      logout,
      refreshUser
    }}
  >
      {children}
    </AuthContext.Provider>;
};
// Small hook so any component can just call `const { user, login } = useAuth();`
// instead of importing AuthContext and useContext directly every time.
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export {
  AuthProvider,
  useAuth
};
