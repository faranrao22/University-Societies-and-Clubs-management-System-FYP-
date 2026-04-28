import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Profile from "./Profile";

export default function ProfileEntry() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();

  if (role === "manager") {
    return <Navigate to="/manager/profile" replace />;
  }
  if (role === "admin") {
    return <Navigate to="/admin/profile" replace />;
  }
  return <Profile />;
}
