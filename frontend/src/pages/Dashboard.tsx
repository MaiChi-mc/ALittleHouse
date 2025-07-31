
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Hotel, ChartBar, ArrowUp, ArrowDown } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const userRole = localStorage.getItem('role');
  // Mock Data - removed Total Bookings and Unread Messages
  const stats = [
    { title: "Occupied Rooms", value: "24", icon: Hotel, trend: "up", percent: "4%" },
    { title: "Today's Guests", value: "18", icon: Users, trend: "down", percent: "2%" },
  ];

  return (
    <MainLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((stat, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-hotel-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {stat.trend === "up" ? (
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                    {stat.percent}
                  </span>
                  <span className="ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1 lg:col-span-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Room Occupancy Overview</CardTitle>
              <Tabs defaultValue="week">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="w-full h-full flex flex-col justify-center">
                  <div className="text-center text-muted-foreground mb-8">
                    <ChartBar className="mx-auto h-16 w-16 opacity-30" />
                    <p className="mt-2">Room Occupancy Chart</p>
                    <p className="text-sm">(Sample data displayed)</p>
                  </div>
                  <div className="space-y-5">
                    {["Standard Rooms", "Premium Rooms", "Suites"].map((room, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{room}</span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {[74, 82, 65][i]}%
                          </span>
                        </div>
                        <Progress value={[74, 82, 65][i]} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "09:15 AM", text: "New booking received for Room 203", user: "Online" },
                  { time: "08:42 AM", text: "Guest John checked-in to Room 104", user: "Front Desk" },
                  { time: "Yesterday", text: "Room 305 maintenance completed", user: "Maintenance" },
                  { time: "Yesterday", text: "New message from Airbnb", user: "Channel Manager" },
                  { time: "2 days ago", text: "Monthly revenue report generated", user: "System" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-2 w-2 mt-2 rounded-full bg-hotel-500"></div>
                    <div>
                      <p className="text-sm">{item.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                        <p className="text-xs text-muted-foreground">{item.user}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link to="/activities" className="text-sm text-hotel-500 hover:underline">
                  View all activities
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                Today's Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "John Doe", room: "101", time: "14:00", status: "Confirmed" },
                { name: "Emily Wong", room: "204", time: "15:30", status: "Pending" },
                { name: "Michael Smith", room: "305", time: "12:00", status: "Confirmed" },
              ].map((guest, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-muted-foreground">Room {guest.room} • {guest.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      guest.status === "Confirmed" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {guest.status}
                    </span>
                    <Button size="sm" variant="outline" className="ml-2">
                      Process
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Link to="/bookings" className="text-hotel-500 hover:underline font-medium">
                  View all bookings →
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-l-4 border-l-orange-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                Today's Check-outs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Jane Williams", room: "203", time: "11:00", status: "Processing" },
                { name: "Robert Chen", room: "105", time: "10:00", status: "Completed" },
                { name: "Sarah Adams", room: "402", time: "12:00", status: "Processing" },
              ].map((guest, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-muted-foreground">Room {guest.room} • {guest.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      guest.status === "Completed" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {guest.status}
                    </span>
                    <Button size="sm" variant="outline" className="ml-2">
                      Process
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Link to="/bookings" className="text-hotel-500 hover:underline font-medium">
                  View all bookings →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
