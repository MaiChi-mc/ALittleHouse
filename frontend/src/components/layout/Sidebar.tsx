// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageCircle, ChartBar, Bed, UserPlus, Notebook } from 'lucide-react';  
import { cn } from "@/lib/utils";

const Sidebar = ({ userRole }: { userRole: string | null }) => {
  const location = useLocation();
  console.log('userRole =', JSON.stringify(userRole));

const baseNav = [
  { name: "Bảng Điều Khiển", path: "/", icon: Home },
  { name: "Quản Lý Phòng", path: "/room-management", icon: Bed },
];

const receptionistNav = [
  { name: "Lịch", path: "/bookings", icon: Calendar },
  { name: "Tin Nhắn", path: "/messages", icon: MessageCircle },
  { name: "Nội Quy & Giá Phòng", path: "/about", icon: Notebook },
];

const adminNav = [
  { name: "Phân tích", path: "/analytics", icon: ChartBar },
  { name: "Tạo tài khoản", path: "/create-account", icon: UserPlus },
];

// chuẩn hóa role
const role = (userRole || '').toString().trim().toLowerCase();

// Nếu ở trong React, dùng useMemo; nếu không, xài trực tiếp như bên dưới
let navItems = [...baseNav];

if (['receptionist', 'admin'].includes(role)) {
  navItems.push(...receptionistNav);
}

if (role === 'admin') {
  navItems.push(...adminNav);
}


    
  return (
    <div className="bg-sidebar h-screen w-[250px] shadow-xl bg-[#6aa6e2]">  
      <div className="flex items-center p-4 mb-6">
        <Link to="/" className="text-[#fff1f5] font-bold text-3xl">
          A Little House
        </Link>
      </div>

      <nav className="px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 my-1 rounded-md transition-colors whitespace-nowrap relative",
                isActive ? "bg-[#c6e0f8]  text-[#af3c6a] font-bold" : "text-[#ffeef5] hover:bg-[#a0cdf8] hover:text-white hover:shadow-lg",
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
