import React from "react";
import Loader from "./Loader";

export default function PageLoader({ fullScreen = false, className = "" }) {
  if (fullScreen) return <Loader />;

  return (
    <div className={`flex items-center justify-center py-14 ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1e3a8a] border-r-transparent" />
    </div>
  );
}
