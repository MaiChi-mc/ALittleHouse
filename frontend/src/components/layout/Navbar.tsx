
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent,  DropdownMenuItem,  DropdownMenuLabel,  DropdownMenuSeparator,  DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);

  const email = localStorage.getItem('email'); // Lấy email từ localStorage 
  const role = localStorage.getItem('role'); // Lấy role từ localStorage

  // Hàm đăng xuất
  const handleLogout = () => {
    // Xóa khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email'); 

    // Reset lại state
    setUserRole(null);

    // Điều hướng về trang Login
    navigate('/login');
  };

  // Đặt timer tự động đăng xuất sau 20 phút (20 giây * 30)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLogout();
    }, 20000 *30); // 20 giây = 20000 milliseconds, tính 30 phút

    // Dọn dẹp timer khi component unmount hoặc khi token/role thay đổi
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="border-b bg-white py-4 px-6 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Welcome to A Little House
        </h1>
        <p className="text-sm text-gray-500">Manage your hotel with ease</p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-hotel-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{role}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
