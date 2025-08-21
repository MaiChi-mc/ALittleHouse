// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Booking";
import RoomManagement from "./pages/RoomManagement";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  // const [timerExpired, setTimerExpired] = useState(false); // Để theo dõi trạng thái hết hạn token
  const navigate = useNavigate(); // Để điều hướng người dùng

  // Kiểm tra token khi trang được tải
  useEffect(() => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role) {
    setUserRole(role);
  } else {
    navigate('/login');
  }
}, [navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <div className="app">
            <Routes>
              {/* Trang login */}
              <Route path="/login" element={<Login />} />
              
              {/* Các route không cần bảo vệ */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/room-management" element={<RoomManagement />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/email" element={<Messages />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/create-account" element={<CreateAccount />} />     

              {/* Route nếu không tìm thấy trang */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};


export default App;
