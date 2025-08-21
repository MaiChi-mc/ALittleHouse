// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageCircle, ChartBar, Bed, UserPlus, Notebook } from 'lucide-react';  
import { cn } from "@/lib/utils";

const Sidebar = ({ userRole }: { userRole: string | null }) => {
  const location = useLocation();

  const navItems = [
    { name: "Bảng Điều Khiển", path: "/", icon: Home },
    { name: "Lịch", path: "/bookings", icon: Calendar },
    { name: "Quản Lý Phòng", path: "/room-management", icon: Bed },
    { name: "Tin Nhắn", path: "/messages", icon: MessageCircle },
    { name: "Nội Quy & Giá", path: "/about", icon: Notebook },
  ];

  // Nếu người dùng là admin, thêm mục "Tạo tài khoản"
  if (userRole === 'Admin') {
    navItems.push({
      name: "Phân tích",
      path: "/analytics",
      icon: ChartBar,
    });
    navItems.push({
      name: "Tạo tài khoản",
      path: "/create-account",
      icon: UserPlus,
    });
  }

  return (
    <div className="bg-sidebar h-screen w-[250px] shadow-xl bg-gradient-to-r from-[#f0bfd3] to-[#a0c8ef]">  
      <div className="flex items-center p-4 mb-6">
        <Link to="/" className="text-[#af3c6a] font-bold text-3xl">
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
                isActive ? "bg-[#80b6ec]  text-[#af3c6a] font-bold" : "text-[#cb5f8a] hover:bg-[#6dabe8] hover:text-white hover:shadow-lg",
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
