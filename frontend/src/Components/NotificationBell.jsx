import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

function hrefForNotification(n) {
  const m = n.meta || {};
  switch (n.type) {
    case "JOIN_REQUEST_RECEIVED":
      return "/manager/requests";
    case "JOIN_REQUEST_UPDATED":
      return "/student/profile/societies";
    case "ELECTION_APPLICATION_SUBMITTED":
      return "/manager/applications";
    case "ELECTION_APPLICATION_STATUS":
      return "/student/profile/election-status";
    case "VOLUNTEER_REQUEST_RECEIVED":
      return "/manager/volunteers";
    case "VOLUNTEER_STATUS":
      return "/student/profile/volunteers";
    case "ADMIN_NEW_SOCIETY_PENDING":
      return "/admin/societyRequests";
    case "ADMIN_NEW_STUDENT_REGISTERED":
      return m.userId ? `/admin/users/${m.userId}` : "/admin/users";
    case "SOCIETY_STATUS_BY_ADMIN":
      return m.societyId ? `/manager/societyDetails/${m.societyId}` : "/manager/society-status";
    default:
      return m.eventId ? `/eventdetails/${m.eventId}` : null;
  }
}

/**
 * @param {{ className?: string; buttonClassName?: string }} props
 */
export default function NotificationBell({ className = "", buttonClassName = "" }) {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative rounded-lg p-2 transition hover:bg-black/5 ${buttonClassName}`}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs font-medium text-indigo-700 hover:underline"
                onClick={() => markAllRead()}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-gray-500">No notifications yet</p>
            ) : (
              items.map((n) => {
                const href = hrefForNotification(n);
                const inner = (
                  <div
                    className={`border-b border-gray-50 px-3 py-2.5 text-left last:border-0 ${
                      n.read ? "bg-white" : "bg-emerald-50/40"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{n.message}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                );
                return (
                  <div key={n._id}>
                    {href ? (
                      <Link
                        to={href}
                        onClick={() => {
                          if (!n.read) markRead(n._id);
                          setOpen(false);
                        }}
                        className="block hover:bg-gray-50"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="block w-full hover:bg-gray-50"
                        onClick={() => {
                          if (!n.read) markRead(n._id);
                        }}
                      >
                        {inner}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
