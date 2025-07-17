import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChartBar, 
  ArrowUp, 
  ArrowDown, 
  Hotel, 
  Calendar, 
  Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [period, setPeriod] = useState("month");

  // Revenue data for the last 12 months
  const revenueData = [
    { month: "Jan", revenue: 12500, roomRevenue: 9500, fbRevenue: 2100, services: 900 },
    { month: "Feb", revenue: 14200, roomRevenue: 11000, fbRevenue: 2300, services: 900 },
    { month: "Mar", revenue: 16800, roomRevenue: 13200, fbRevenue: 2600, services: 1000 },
    { month: "Apr", revenue: 18500, roomRevenue: 14500, fbRevenue: 2800, services: 1200 },
    { month: "May", revenue: 20100, roomRevenue: 15800, fbRevenue: 3000, services: 1300 },
    { month: "Jun", revenue: 15942, roomRevenue: 12450, fbRevenue: 2380, services: 1112 },
    { month: "Jul", revenue: 22000, roomRevenue: 17200, fbRevenue: 3200, services: 1600 },
    { month: "Aug", revenue: 24500, roomRevenue: 19000, fbRevenue: 3800, services: 1700 },
    { month: "Sep", revenue: 21800, roomRevenue: 17000, fbRevenue: 3200, services: 1600 },
    { month: "Oct", revenue: 19200, roomRevenue: 15000, fbRevenue: 2900, services: 1300 },
    { month: "Nov", revenue: 17500, roomRevenue: 13500, fbRevenue: 2700, services: 1300 },
    { month: "Dec", revenue: 23000, roomRevenue: 18000, fbRevenue: 3500, services: 1500 },
  ];

  // Daily revenue trend for current month
  const dailyRevenueData = [
    { day: "1", revenue: 850 }, { day: "2", revenue: 920 }, { day: "3", revenue: 780 },
    { day: "4", revenue: 1200 }, { day: "5", revenue: 1350 }, { day: "6", revenue: 1180 },
    { day: "7", revenue: 1420 }, { day: "8", revenue: 980 }, { day: "9", revenue: 1100 },
    { day: "10", revenue: 1250 }, { day: "11", revenue: 1380 }, { day: "12", revenue: 1150 },
    { day: "13", revenue: 1320 }, { day: "14", revenue: 1450 }, { day: "15", revenue: 1280 },
    { day: "16", revenue: 1350 }, { day: "17", revenue: 1200 }, { day: "18", revenue: 1100 },
  ];

  // Occupancy data
  const occupancyData = [
    { month: "Jan", occupancy: 65 }, { month: "Feb", occupancy: 72 },
    { month: "Mar", occupancy: 78 }, { month: "Apr", occupancy: 85 },
    { month: "May", occupancy: 88 }, { month: "Jun", occupancy: 78 },
    { month: "Jul", occupancy: 92 }, { month: "Aug", occupancy: 95 },
    { month: "Sep", occupancy: 87 }, { month: "Oct", occupancy: 82 },
    { month: "Nov", occupancy: 75 }, { month: "Dec", occupancy: 89 },
  ];

  // Room type revenue distribution
  const roomTypeData = [
    { name: "Standard", value: 8500, color: "#3B82F6" },
    { name: "Deluxe", value: 2850, color: "#10B981" },
    { name: "Suite", value: 1100, color: "#F59E0B" },
  ];

  // Booking channels distribution
  const channelData = [
    { name: "Direct", value: 35, color: "#8B5CF6" },
    { name: "Booking.com", value: 32, color: "#3B82F6" },
    { name: "Airbnb", value: 18, color: "#10B981" },
    { name: "Agoda", value: 15, color: "#F59E0B" },
  ];

  const chartConfig = {
    revenue: { label: "Revenue", color: "#3B82F6" },
    roomRevenue: { label: "Room Revenue", color: "#3B82F6" },
    fbRevenue: { label: "F&B Revenue", color: "#10B981" },
    services: { label: "Services", color: "#F59E0B" },
    occupancy: { label: "Occupancy %", color: "#8B5CF6" },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your hotel performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select defaultValue="month">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$15,942</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">12.5%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Occupancy Rate
              </CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.3%</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">4.6%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Daily Rate
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$142.50</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-red-500">2.3%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue breakdown for your hotel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-96">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="roomRevenue" stackId="a" fill="#3B82F6" name="Room Revenue" />
                    <Bar dataKey="fbRevenue" stackId="a" fill="#10B981" name="F&B Revenue" />
                    <Bar dataKey="services" stackId="a" fill="#F59E0B" name="Services" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Revenue by Room Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-64">
                    <PieChart>
                      <Pie
                        data={roomTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roomTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Daily Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-64">
                    <LineChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="occupancy" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Occupancy Overview</CardTitle>
                <CardDescription>
                  Room occupancy statistics by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-96">
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="occupancy" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: "Standard Rooms", value: "82%" },
                    { label: "Deluxe Rooms", value: "76%" },
                    { label: "Suites", value: "65%" },
                    { label: "Overall", value: "78%" },
                  ].map((item, i) => (
                    <Card key={i} className="bg-muted/50">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-medium mt-1">{item.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="channels" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Booking Channels</CardTitle>
                <CardDescription>
                  Analysis of booking sources and channel performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-96">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {channelData.map((item, i) => (
                    <Card key={i} className="bg-muted/50">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground">{item.label}</p>  {/* name */}
                        <p className="text-lg font-medium mt-1">{item.value}%</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
