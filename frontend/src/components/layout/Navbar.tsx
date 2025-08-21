
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent,  DropdownMenuItem,  DropdownMenuLabel,  DropdownMenuSeparator,  DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);

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
    }, 20000 *300); // 20 giây = 20000 milliseconds, tính 30 phút

    // Dọn dẹp timer khi component unmount hoặc khi token/role thay đổi
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="border-b bg-white py-4 px-6 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-[#3a80c6]">
          Chào mừng đến A Little House
        </h1>
        <p className="text-sm text-[#6e9bc7]">Quản lý khách sạn dễ dàng</p>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 ">
              <div className="h-8 w-8 rounded-full bg-[#5aa5f0] flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-[#4786c5]">{localStorage.getItem('role')}</p>
                <p className="text-xs text-[#4786c5]">{localStorage.getItem('email')}</p>
              </div>
            </Button>
          </DropdownMenuTrigger >
          <DropdownMenuContent align="end" className="shadow-lg text-[#4786c5]">
            <DropdownMenuLabel>
              Tài khoản của tôi
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 " onClick={handleLogout}>
                Đăng xuất
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
