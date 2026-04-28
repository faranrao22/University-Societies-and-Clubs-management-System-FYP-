import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { uploadFileUrl } from "../../../config/api.config";

function sessionLabel(user) {
  if (user?.sessionStart && user?.sessionEnd) return `${user.sessionStart} - ${user.sessionEnd}`;
  return user?.session || "";
}

export default function AdminProfile() {
  const { user } = useAuth();
  const fields = [
    { label: "Full Name", value: user?.fullname },
    { label: "Email", value: user?.email },
    { label: "Role", value: user?.role },
    { label: "Department", value: user?.Department || user?.department },
    { label: "Phone", value: user?.phone },
    { label: "Session", value: sessionLabel(user) },
  ].filter((item) => item.value);

  const imgSrc =
    uploadFileUrl(user?.profileImage) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || "Admin")}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-sm text-gray-500">Your account information</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <img
            src={imgSrc}
            alt="Admin profile"
            className="h-20 w-20 rounded-full border border-gray-200 object-cover"
          />
          <div>
            <p className="text-xl font-semibold text-gray-900">{user?.fullname || "Admin"}</p>
            {user?.email ? <p className="text-sm text-gray-500">{user.email}</p> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
