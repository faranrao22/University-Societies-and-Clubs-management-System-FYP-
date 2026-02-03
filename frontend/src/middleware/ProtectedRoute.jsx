import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Loading...</p>; // Wait for user info

  // Not logged in, redirect to login
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // If user role is not allowed, stay on current page
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // Instead of returning null, redirect back to where they came from or default page
    return <Navigate to={location.state?.from || `/${user.role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
