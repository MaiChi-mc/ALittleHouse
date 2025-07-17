
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageCircle, ChartBar, Bed } from 'lucide-react';
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Bookings", path: "/bookings", icon: Calendar },
    { name: "Room Management", path: "/room-management", icon: Bed },
    { name: "Messages", path: "/messages", icon: MessageCircle, unread: 5 },
    { name: "Analytics", path: "/analytics", icon: ChartBar },
  ];
  
  return (
    <div className="bg-sidebar h-screen w-[250px]">
      <div className="flex items-center p-4 mb-6">
        <Link to="/" className="text-white font-bold text-xl">
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
                isActive ? "bg-sidebar-accent text-white" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
              {item.unread && item.unread > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
                  {item.unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
