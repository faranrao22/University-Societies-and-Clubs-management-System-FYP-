import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Mail,
  GraduationCap,
  Hash,
  Calendar,
  MapPin,
  ShieldCheck,
  User as UserIcon,
  Pencil,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";

function formatSession(user) {
  if (!user) return "N/A";
  if (user.sessionStart && user.sessionEnd) return `${user.sessionStart} – ${user.sessionEnd}`;
  return user.session || "N/A";
}

export default function ProfileDetails({ user }) {
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    Department: "",
    rollNo: "",
    semester: "",
    sessionStart: "",
    sessionEnd: "",
  });

  useEffect(() => {
    setFormData({
      fullname: user?.fullname || "",
      Department: user?.Department || user?.department || "",
      rollNo: user?.rollNo || "",
      semester: user?.semester || "",
      sessionStart: user?.sessionStart || "",
      sessionEnd: user?.sessionEnd || "",
    });
  }, [user]);

  const getFileUrl = (fileName) => {
    if (!fileName) return null;
    return uploadFileUrl(fileName);
  };

  const dept = user?.Department || user?.department || "Not Set";
  const canEditStudentFields = useMemo(
    () => String(user?.role || "").toLowerCase() === "user",
    [user?.role]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onCancel = () => {
    setIsEditing(false);
    setFormData({
      fullname: user?.fullname || "",
      Department: user?.Department || user?.department || "",
      rollNo: user?.rollNo || "",
      semester: user?.semester || "",
      sessionStart: user?.sessionStart || "",
      sessionEnd: user?.sessionEnd || "",
    });
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!formData.fullname.trim()) {
      toast.error("Full name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        fullname: formData.fullname.trim(),
        Department: formData.Department.trim(),
      };
      if (canEditStudentFields) {
        payload.rollNo = formData.rollNo.trim();
        payload.semester = formData.semester.trim();
        payload.sessionStart = formData.sessionStart.trim();
        payload.sessionEnd = formData.sessionEnd.trim();
      }
      const res = await axios.patch(`${API_BASE_URL}/auth/me`, payload, {
        withCredentials: true,
      });
      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to update details");
        return;
      }
      await refreshUser();
      toast.success("Details updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update details");
    } finally {
      setIsSaving(false);
    }
  };

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
              Session: {formatSession(user)}
            </span>
          </div>
        </div>
      </div>

      {/* ===== DETAILS SECTION ===== */}
      <form onSubmit={onSave} className="mt-6 bg-white border border-[rgba(30,64,175,0.14)] rounded-lg shadow-sm">
        
        {/* Section Header */}
        <div className="border-b border-[rgba(30,64,175,0.12)] px-6 py-4 bg-[#eff6ff]/70 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1e3a8a]">Student Information</h2>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(30,64,175,0.2)] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e3a8a] hover:bg-[#eff6ff]"
            >
              <Pencil size={14} /> Edit Details
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                <X size={14} /> Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-60"
              >
                <Save size={14} /> {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {isEditing ? (
            <>
              <EditItem icon={<UserIcon />} label="Full Name" name="fullname" value={formData.fullname} onChange={onChange} required />
              <InfoItem icon={<Mail />} label="Email Address" value={user.email} />
              {canEditStudentFields ? (
                <EditItem icon={<Hash />} label="Roll Number" name="rollNo" value={formData.rollNo} onChange={onChange} />
              ) : (
                <InfoItem icon={<Hash />} label="Roll Number" value={user.rollNo} />
              )}
              <EditItem icon={<MapPin />} label="Department" name="Department" value={formData.Department} onChange={onChange} />
              {canEditStudentFields ? (
                <EditItem icon={<Calendar />} label="Session Start" name="sessionStart" value={formData.sessionStart} onChange={onChange} type="date" />
              ) : (
                <InfoItem icon={<Calendar />} label="Session" value={formatSession(user)} />
              )}
              {canEditStudentFields ? (
                <EditItem icon={<Calendar />} label="Session End" name="sessionEnd" value={formData.sessionEnd} onChange={onChange} type="date" />
              ) : null}
              {canEditStudentFields ? (
                <EditItem icon={<GraduationCap />} label="Semester" name="semester" value={formData.semester} onChange={onChange} />
              ) : (
                <InfoItem icon={<GraduationCap />} label="Semester" value={user.semester} />
              )}
            </>
          ) : (
            <>
              <InfoItem icon={<UserIcon />} label="Full Name" value={user.fullname} />
              <InfoItem icon={<Mail />} label="Email Address" value={user.email} />
              <InfoItem icon={<Hash />} label="Roll Number" value={user.rollNo} />
              <InfoItem icon={<MapPin />} label="Department" value={dept} />
              <InfoItem icon={<Calendar />} label="Session" value={formatSession(user)} />
              <InfoItem icon={<GraduationCap />} label="Semester" value={user.semester} />
            </>
          )}
        </div>
      </form>

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

function EditItem({ icon, label, name, value, onChange, required, type = "text" }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-[#1d4ed8]/80 mt-1">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="w-full">
        <label className="text-xs text-gray-500 uppercase tracking-wide">{label}</label>
        <input
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          required={required}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1e3a8a]"
        />
      </div>
    </div>
  );
}