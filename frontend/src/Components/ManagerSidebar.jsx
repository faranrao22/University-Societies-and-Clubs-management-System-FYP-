import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  LogOut,
  X,
  FileText,
  Users2
} from "lucide-react";

import { 
  MdGroups2, 
  MdOutlineVolunteerActivism 
} from "react-icons/md";
import { LuGitPullRequestArrow } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

// Updated menu items with meaningful icons
const menuItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Election", icon: LayoutDashboard, path: "election" },
  { label: "Schedule Applications", icon: FileText, path: "my-drafts" },
  { label: "Applications", icon: FileText, path: "applications" },
  { label: "Schedule Voting", icon: FileText, path: "schedule-voting" },
  { label: "Societies", icon: MdGroups2, path: "society" },
  { label: "Events", icon: Calendar, path: "events" },
  { label: "Members", icon: Users, path: "members" },
  { label: "Requests", icon: LuGitPullRequestArrow, path: "requests" },
  { label: "Volunteers", icon: MdOutlineVolunteerActivism, path: "volunteers" },
];

function ManagerSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between bg-[#111827] text-white p-4 z-40 shadow-lg">
        <h2 className="text-xl font-bold">Manager Panel</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-700 transition"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-white mb-1.5"></div>
          <div className="w-6 h-0.5 bg-white mb-1.5"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 h-full bg-[#111827] text-white flex flex-col transition-transform duration-300 ease-in-out z-50 w-68 shadow-2xl
          lg:left-0 lg:translate-x-0
          ${isOpen ? "right-0 translate-x-0" : "right-0 translate-x-full"} lg:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-md hover:bg-gray-700 transition"
          aria-label="Close menu"
        >
          <X size={22} className="mt-1" />
        </button>

        {/* Scrollable container */}
        <div className="scrollbar-custom flex flex-col h-full overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="p-6 pb-4 shrink-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-50">
              Manager Panel
            </h2>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {menuItems.map((item, idx) => {
              const isActive = location.pathname.endsWith(item.path);
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition truncate
                    ${isActive
                      ? "bg-gray-800 text-white font-semibold shadow-inner"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "text-gray-300"} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="shrink-0 px-4 pb-6">
            <div className="pt-4 border-t border-gray-700" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition text-red-400 hover:text-white font-semibold mt-4"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default ManagerSidebar;
