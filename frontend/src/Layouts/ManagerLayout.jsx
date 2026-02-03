import React from 'react';
import ManagerSidebar from '../Components/ManagerSidebar';
import { Outlet } from 'react-router-dom';

function ManagerLayout() {
  return (
    <div className='flex min-h-screen bg-gray-100'>
      
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main content */}
      <main className='flex-1 w-full lg:ml-64 pt-16 md:pt-20 lg:pt-0 p-4 sm:p-6 overflow-y-auto'>
        <Outlet />
      </main>

    </div>
  );
}

export default ManagerLayout;