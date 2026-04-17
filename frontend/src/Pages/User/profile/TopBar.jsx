import React from "react";
import { Menu, Search } from "lucide-react";
import NotificationBell from "../../../Components/NotificationBell";
import { uploadFileUrl } from "../../../config/api.config";

export default function TopBar({ onMenuToggle, user }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[rgba(30,64,175,0.16)] px-4 py-3 lg:px-6 shadow-sm">
      <div className="flex items-center justify-between">
        
        {/* Left */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="p-2 hover:bg-[#eef2f7] rounded-lg lg:hidden"
          >
            <Menu size={24} className="text-gray-600" />
          </button>

          <h1 className="text-lg font-bold text-[#1e3a8a] hidden sm:block">
            Student Dashboard
          </h1>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-[#eef2f7] border border-[rgba(30,64,175,0.2)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#eef2f7] rounded-lg md:hidden">
            <Search size={20} className="text-gray-600" />
          </button>

          <NotificationBell buttonClassName="hover:bg-[#eef2f7]" />

          <img
            src={
              user.profileImage
                ? uploadFileUrl(user.profileImage)
                : `https://ui-avatars.com/api/?name=${user.fullname}`
            }
            alt="Profile"
            className="w-8 h-8 rounded-lg object-cover border"
          />
        </div>
      </div>
    </header>
  );
}