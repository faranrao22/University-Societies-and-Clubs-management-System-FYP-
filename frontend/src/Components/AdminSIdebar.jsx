import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  CalendarDays,
  Vote,
  LogOut,
  Home,
  Inbox,
  Newspaper,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AdminSidebar({ mobileOpen = false, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
      isActive
        ? "border border-indigo-400/40 bg-indigo-600 text-white shadow-md shadow-indigo-950/25"
        : "border border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white",
    ].join(" ");

  const mainNav = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Managers", icon: UserCog, path: "/admin/managers" },
    { label: "All users", icon: Users, path: "/admin/users" },
    { label: "Societies", icon: Building2, path: "/admin/societies" },
    { label: "Events", icon: CalendarDays, path: "/admin/events" },
    { label: "Elections", icon: Vote, path: "/admin/elections" },
    { label: "Society requests", icon: Inbox, path: "/admin/societyRequests" },
    { label: "Society posts", icon: Newspaper, path: "/admin/society-posts" },
    { label: "Contact messages", icon: MessageSquare, path: "/admin/contact-messages" },
  ];

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate("/");
  };

  const linkClose = () => onClose?.();

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(17rem,100vw-3rem)] max-w-[17rem] flex-col border-r border-slate-800/80 bg-[#121621] text-white transition-transform duration-200 ease-out lg:z-40 lg:w-60 lg:max-w-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-slate-800/80 px-5 py-5">
          <h2 className="text-base font-bold tracking-tight text-white">Admin Console</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Societies &amp; clubs</p>
        </div>

        <nav className="admin-sidebar-scroll flex flex-1 flex-col gap-1 overflow-y-auto overscroll-y-contain px-2.5 py-4">
          <NavLink to="/" className={navClass} end onClick={linkClose}>
            <Home size={18} strokeWidth={1.75} className="opacity-90" />
            Public home
          </NavLink>
          <div className="my-2 border-t border-slate-800/80" />
          {mainNav.map((item) => (
            <NavLink key={item.path} to={item.path} className={navClass} onClick={linkClose}>
              <item.icon size={18} strokeWidth={1.75} className="opacity-90" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800/80 p-2.5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
