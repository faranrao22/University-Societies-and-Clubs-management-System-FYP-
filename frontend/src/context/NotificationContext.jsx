import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import API_BASE_URL, { getUploadsBaseUrl } from "../config/api.config";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications`, { withCredentials: true });
      if (res.data?.success) {
        setItems(res.data.data || []);
        setUnreadCount(typeof res.data.unreadCount === "number" ? res.data.unreadCount : 0);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    refresh();

    const base = getUploadsBaseUrl();
    const socket = io(base, { withCredentials: true });
    socketRef.current = socket;

    socket.on("notification:new", (payload) => {
      const n = payload?.notification;
      if (n?.title) toast(n.title);
      refresh();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, refresh]);

  const markRead = useCallback(async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {}, { withCredentials: true });
      let wasUnread = false;
      setItems((prev) => {
        const target = prev.find((x) => x._id === id);
        wasUnread = !!(target && !target.read);
        return prev.map((x) => (x._id === id ? { ...x, read: true } : x));
      });
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-all-read`, {}, { withCredentials: true });
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ items, unreadCount, loading, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
