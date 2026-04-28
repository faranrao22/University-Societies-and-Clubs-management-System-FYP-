import React, { useState } from "react";
import ManagerSidebar from "../Components/ManagerSidebar";
import ManagerTopBar from "../Components/ManagerTopBar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ManagerLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="manager-panel flex min-h-screen bg-[#e9eef5] text-sm text-gray-900 antialiased">
      <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 lg:ml-64">
        <ManagerTopBar user={user} onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 w-full overflow-y-auto bg-[#e9eef5] px-4 py-6 pt-14 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ManagerLayout;
