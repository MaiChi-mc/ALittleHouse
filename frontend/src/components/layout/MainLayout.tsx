
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Profile from '@/pages/Profile';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: string; // Thêm userRole vào props
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen flex">
      {/* Truyền userRole vào Sidebar */}
      <div className="fixed top-0 left-0 h-full z-10 w-[250px]">
        <Sidebar userRole={userRole} />
      </div>

      <div className="flex-1 ml-[250px]">
        {/* Navbar cố định trên cùng */}
        <div className="fixed top-0 left-[250px] right-0 h-[70px] z-20 bg-white shadow-lg">
          <Navbar />
        </div>

        {/* Main content cần padding-top để tránh bị Navbar che */}
        <main className="pt-[100px] p-6 overflow-y-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
