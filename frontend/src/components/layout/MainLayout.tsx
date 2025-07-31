
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: string; // Thêm userRole vào props
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen flex">
      {/* Truyền userRole vào Sidebar */}
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
