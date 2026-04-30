// src/pages/student/profile/ProfileSidebar.jsx
import React from "react";
import {
  LogOut,
  User,
  ClipboardList,
  Users,
  Vote,
  FileText,
  BadgeCheck,
  X,
  Newspaper,
  Home,
} from "lucide-react";
import { uploadFileUrl } from "../../../config/api.config";

const NAV_ITEMS = [
  { id: "Home", label: "Home", icon: Home, path: "/" },
  { id: "details", label: "My Details", icon: User, path: "/student/profile" },
  { id: "volunteers", label: "My Volunteer Events", icon: ClipboardList, path: "/student/profile/volunteers" },
  { id: "volunteer-status", label: "Volunteer Card", icon: BadgeCheck, path: "/student/profile/volunteer-status" },
  { id: "societies", label: "My Societies", icon: Users, path: "/student/profile/societies" },
  { id: "society-posts", label: "Society updates", icon: Newspaper, path: "/student/profile/society-posts" },
  { id: "applications", label: "Societies Application", icon: Users, path: "/student/profile/applications" },
  { id: "elections", label: "Elections Participated", icon: Vote, path: "/student/profile/elections" },
  { id: "election-status", label: "Election Application", icon: FileText, path: "/student/profile/election-status" },
];

export default function ProfileSidebar({ 
  activeSection, 
  onNavigate, 
  user, 
  onLogout,
  isOpen,
  onClose 
}) {
  return (
    <>
      {/* Overlay (Mobile only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-white border-r border-[rgba(30,64,175,0.16)]
          flex flex-col
          transform transition-transform duration-300 ease-in-out

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Mobile Header */}
        <div className="p-4 border-b border-[rgba(30,64,175,0.14)] flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <img 
              src={user.profileImage 
                ? uploadFileUrl(user.profileImage) 
                : `https://ui-avatars.com/api/?name=${user.fullname}`
              }
              alt="Profile" 
              className="w-10 h-10 rounded-xl object-cover border"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{user.fullname}</p>
              <p className="text-xs text-[#4B5563]">{user.role}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-[#eef2f7] rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Desktop Profile */}
        <div className="p-4 border-b border-[rgba(30,64,175,0.14)] hidden lg:block">
          <div className="flex items-center gap-3">
            <img 
              src={user.profileImage 
                ? uploadFileUrl(user.profileImage) 
                : `https://ui-avatars.com/api/?name=${user.fullname}`
              }
              alt="Profile" 
              className="w-12 h-12 rounded-xl object-cover border"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{user.fullname}</p>
              <p className="text-xs text-[#4B5563]">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation (Scrollable) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const showDivider = index === 1 || index === 3;

            return (
              <React.Fragment key={item.id}>
                {showDivider && <div className="my-2 border-t border-[rgba(30,64,175,0.1)]" />}

                <button
                  onClick={() => {
                    onNavigate(item.path);
                    onClose?.();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                    ${isActive 
                      ? "bg-[#eff6ff] text-[#1e3a8a] border border-[rgba(30,64,175,0.2)]" 
                      : "text-[#4B5563] hover:bg-[#eff6ff]"
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? "text-[#1e3a8a]" : "text-gray-400"} />
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[rgba(30,64,175,0.14)]">
          <button 
            onClick={() => {
              onLogout();
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}