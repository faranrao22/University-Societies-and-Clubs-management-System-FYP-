import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

import ProfileSidebar from "./ProfileSidebar";
import TopBar from "./TopBar";

import ProfileDetails from "./ProfileDetails";
import ProfileVolunteers from "./ProfileVolunteers";
import ProfileSocieties from "./ProfileSocieties";
import ProfileElections from "./ProfileElections";
import ProfileElectionStatus from "./ProfileElectionStatus";
import ProfileVolunteerStatus from "./ProfileVolunteerStatus";
import ProfileApplications from "./ProfileApplications";
import ProfileSocietyPosts from "./ProfileSocietyPosts";

// Section Mapping
// src/pages/student/profile/Profile.jsx

// ✅ SECTION_COMPONENTS - Must include ProfileApplications
const SECTION_COMPONENTS = {
  details: ProfileDetails,
  volunteers: ProfileVolunteers,
  societies: ProfileSocieties,
  "society-posts": ProfileSocietyPosts,
  elections: ProfileElections,
  "election-status": ProfileElectionStatus,
  "volunteer-status": ProfileVolunteerStatus,
  applications: ProfileApplications, // ✅ This line is critical
};

// ✅ PATH_TO_SECTION - Must map URL to section key
const PATH_TO_SECTION = {
  "/student/profile": "details",
  "/student/profile/volunteers": "volunteers",
  "/student/profile/societies": "societies",
  "/student/profile/society-posts": "society-posts",
  "/student/profile/elections": "elections",
  "/student/profile/election-status": "election-status",
  "/student/profile/volunteer-status": "volunteer-status",
  "/student/profile/applications": "applications", // ✅ This line is critical
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState("details");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync URL → Section
  useEffect(() => {
    const section = PATH_TO_SECTION[location.pathname] || "details";
    setActiveSection(section);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false); // close on mobile
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Loading
  if (user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-[#4B5563]">
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e2e8f0]">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-[rgba(30,64,175,0.14)]">
          <p className="mb-4 text-[#4B5563]">Please login</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 bg-[#1e3a8a] text-white rounded-lg font-semibold shadow-md hover:brightness-110 transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const ActiveComponent = SECTION_COMPONENTS[activeSection] || ProfileDetails;

  return (
    <div className="profile-theme min-h-screen flex bg-[#eef2f7]">

      {/* Sidebar */}
      <ProfileSidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}
     <div className="flex-1 flex flex-col lg:ml-64">

        {/* Top Bar */}
        <TopBar 
          onMenuToggle={() => setSidebarOpen(true)} 
          user={user} 
        />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <ActiveComponent user={user} />
        </main>

      </div>
    </div>
  );
}