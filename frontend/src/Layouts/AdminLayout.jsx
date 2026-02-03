import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../Components/AdminSidebar'; // your toggleable overlay sidebar

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (overlay on mobile, static on desktop) */}
      <AdminSidebar />

      {/* Main content: no left margin on mobile, only on lg+ */}
      <main className="flex-1 p-4 lg:ml-60 lg:p-6 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;