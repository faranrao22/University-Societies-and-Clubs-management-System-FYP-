import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api.config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // start as true

  const refreshUser = async () => {
    const res = await axios.get(`${API_BASE_URL}/auth/me`, { withCredentials: true });
    setUser(res.data.user || null);
    return res.data.user || null;
  };

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await refreshUser();
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false); // done fetching
      }
    };
    fetchUser();
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, { withCredentials: true });
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Signup
 // AuthContext.js
const signup = async (formData) => { // 1. Change to accept a single object
  setLoading(true);
  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/signup`, // Make sure this URL is correct
      formData, 
      { 
        withCredentials: true,
        // No need to manually set headers; 
        // Axios automatically detects FormData and sets 'multipart/form-data'
      }
    );
    setUser(res.data.user);
    return res.data;
  } catch (err) {
    throw err;
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
