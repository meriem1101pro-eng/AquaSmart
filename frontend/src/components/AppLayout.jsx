import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLanguage } from '../context/LanguageContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <main className={`flex-1 ${isRtl ? 'lg:mr-64' : 'lg:ml-64'} p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
