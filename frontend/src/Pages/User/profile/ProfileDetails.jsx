// src/pages/student/profile/sections/ProfileDetails.jsx
import React from "react";
import {
  Mail,
  GraduationCap,
  Hash,
  Calendar,
  MapPin,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { uploadFileUrl } from "../../../config/api.config";

export default function ProfileDetails({ user }) {
  const getFileUrl = (fileName) => {
    if (!fileName) return null;
    return uploadFileUrl(fileName);
  };

  const dept = user?.Department || user?.department || "Not Set";

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* ===== HEADER ===== */}
      <div className="bg-white border border-[rgba(30,64,175,0.14)] rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img
            src={getFileUrl(user.profileImage)}
            alt="Profile"
            className="w-28 h-28 rounded-md object-cover border border-[rgba(30,64,175,0.18)]"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${user.fullname}`;
            }}
          />
        </div>

        {/* Basic Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.fullname}
          </h1>

          <p className="text-[#4B5563] text-sm mt-1">
            {user.role} • {dept}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-sm">
            <span className="flex items-center gap-1 text-[#1d4ed8] font-medium">
              <ShieldCheck size={16} /> Verified
            </span>

            <span className="bg-[#eff6ff] px-3 py-1 rounded text-[#1e3a8a] border border-[rgba(30,64,175,0.12)]">
              Semester: {user.semester || "N/A"}
            </span>

            <span className="bg-[#eff6ff] px-3 py-1 rounded text-[#1e3a8a] border border-[rgba(30,64,175,0.12)]">
              Session: {user.session || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* ===== DETAILS SECTION ===== */}
      <div className="mt-6 bg-white border border-[rgba(30,64,175,0.14)] rounded-lg shadow-sm">
        
        {/* Section Header */}
        <div className="border-b border-[rgba(30,64,175,0.12)] px-6 py-4 bg-[#eff6ff]/70">
          <h2 className="text-lg font-semibold text-[#1e3a8a]">
            Student Information
          </h2>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          
          <InfoItem icon={<UserIcon />} label="Full Name" value={user.fullname} />
          <InfoItem icon={<Mail />} label="Email Address" value={user.email} />
          <InfoItem icon={<Hash />} label="Roll Number" value={user.rollNo} />
          <InfoItem icon={<MapPin />} label="Department" value={dept} />
          <InfoItem icon={<Calendar />} label="Session" value={user.session} />
          <InfoItem icon={<GraduationCap />} label="Semester" value={user.semester} />

        </div>
      </div>

      {/* ===== STATUS BAR ===== */}
      <div className="mt-6 bg-[#eff6ff] border border-[rgba(30,64,175,0.14)] rounded-lg px-6 py-4 flex justify-between items-center">
        <p className="text-sm text-[#4B5563]">
          Portal Status
        </p>

        <span className="text-sm font-semibold text-[#1d4ed8]">
          Active
        </span>
      </div>

    </div>
  );
}

// ===== Reusable Info Row =====
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-[#1d4ed8]/80 mt-1">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900">
          {value || "Not Available"}
        </p>
      </div>
    </div>
  );
}