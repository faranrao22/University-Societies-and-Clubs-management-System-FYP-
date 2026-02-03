import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { Users, LogOut, User, Home } from "lucide-react";
import { MdGroups2 } from "react-icons/md";
import { LuGitPullRequestArrow } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Managers", icon: Users, path: "allmembers" },
    { label: "Societies", icon: MdGroups2, path: "societies" },
    { label: "Members", icon: User, path: "managers" },
    { label: "Society Requests", icon: LuGitPullRequestArrow, path: "societyRequests" },
  ];

  const handleLogout = () => {
    logout(); // call your logout function
    navigate("/"); // redirect to home/login page
  };

  return (
    <div className="fixed w-60 min-h-screen bg-[#023017] text-white flex flex-col p-6">
      {/* Logo */}
      <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

      {/* Menu */}
      <nav className="flex flex-col gap-3 text-[15px]">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-600 transition"
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mt-auto pt-6 border-t border-gray-800" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-600 transition"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}

export default AdminSidebar;
