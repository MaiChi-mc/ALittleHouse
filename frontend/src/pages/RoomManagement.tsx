
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bed, 
  Clock, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users
} from "lucide-react";

const RoomManagement = () => {
    const userRole = localStorage.getItem('role');
  // Sample room data with real-time status
  const rooms = [
    {
      id: "101",
      type: "Standard",
      floor: 1,
      status: "occupied",
      guest: "John Doe",
      checkIn: "2025-06-16 14:00",
      checkOut: "2025-06-18 11:00",
      maintenance: "none",
      lastCleaned: "2025-06-16 10:00"
    },
    {
      id: "102",
      type: "Standard",
      floor: 1,
      status: "available",
      guest: null,
      checkIn: null,
      checkOut: null,
      maintenance: "none",
      lastCleaned: "2025-06-16 12:00"
    },
    {
      id: "203",
      type: "Deluxe",
      floor: 2,
      status: "checkout-pending",
      guest: "Sarah Johnson",
      checkIn: "2025-06-15 15:00",
      checkOut: "2025-06-17 11:00",
      maintenance: "none",
      lastCleaned: "2025-06-15 13:00"
    },
    {
      id: "204",
      type: "Deluxe",
      floor: 2,
      status: "maintenance",
      guest: null,
      checkIn: null,
      checkOut: null,
      maintenance: "plumbing",
      lastCleaned: "2025-06-15 09:00"
    },
    {
      id: "305",
      type: "Suite",
      floor: 3,
      status: "checkin-ready",
      guest: "Emily Wong",
      checkIn: "2025-06-17 15:00",
      checkOut: "2025-06-20 11:00",
      maintenance: "none",
      lastCleaned: "2025-06-17 11:00"
    },
    {
      id: "306",
      type: "Suite",
      floor: 3,
      status: "cleaning",
      guest: null,
      checkIn: null,
      checkOut: null,
      maintenance: "none",
      lastCleaned: "in-progress"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>;
      case "occupied":
        return <Badge className="bg-blue-500"><Users className="h-3 w-3 mr-1" />Occupied</Badge>;
      case "checkout-pending":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Check-out Pending</Badge>;
      case "checkin-ready":
        return <Badge className="bg-purple-500"><CheckCircle className="h-3 w-3 mr-1" />Check-in Ready</Badge>;
      case "maintenance":
        return <Badge className="bg-red-500"><AlertTriangle className="h-3 w-3 mr-1" />Maintenance</Badge>;
      case "cleaning":
        return <Badge className="bg-orange-500"><Settings className="h-3 w-3 mr-1" />Cleaning</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getMaintenanceBadge = (maintenance: string) => {
    if (maintenance === "none") return null;
    return <Badge variant="outline" className="text-red-600 border-red-300">{maintenance}</Badge>;
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return "N/A";
    return new Date(dateTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getActionButtons = (room: any) => {
    switch (room.status) {
      case "checkout-pending":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Process Check-out</Button>
            <Button size="sm">Mark for Cleaning</Button>
          </div>
        );
      case "checkin-ready":
        return (
          <div className="flex gap-2">
            <Button size="sm">Process Check-in</Button>
            <Button size="sm" variant="outline">View Details</Button>
          </div>
        );
      case "cleaning":
        return (
          <div className="flex gap-2">
            <Button size="sm">Mark Clean</Button>
            <Button size="sm" variant="outline">Cleaning Status</Button>
          </div>
        );
      case "maintenance":
        return (
          <div className="flex gap-2">
            <Button size="sm">Complete Maintenance</Button>
            <Button size="sm" variant="outline">Update Status</Button>
          </div>
        );
      case "available":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Schedule Maintenance</Button>
            <Button size="sm" variant="outline">Room Details</Button>
          </div>
        );
      default:
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline">View Details</Button>
          </div>
        );
    }
  };

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, typeof rooms>);

  return (
    <MainLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Room Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time room status dashboard with occupancy tracking and maintenance management
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              Bulk Actions
            </Button>
            <Button>
              <AlertTriangle className="h-4 w-4 mr-1" />
              Schedule Maintenance
            </Button>
          </div>
        </div>

        {/* Real-time Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-muted-foreground">Occupied</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-muted-foreground">Check-out</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">1</div>
                <div className="text-sm text-muted-foreground">Check-in</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">1</div>
                <div className="text-sm text-muted-foreground">Cleaning</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Status by Floor */}
        {Object.keys(roomsByFloor).sort().map(floor => (
          <Card key={floor}>
            <CardHeader>
              <CardTitle>Floor {floor}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {roomsByFloor[parseInt(floor)].map((room) => (
                  <div key={room.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Bed className="h-5 w-5" />
                          <span className="font-medium text-lg">Room {room.id}</span>
                        </div>
                        <Badge variant="outline">{room.type}</Badge>
                        {getStatusBadge(room.status)}
                        {getMaintenanceBadge(room.maintenance)}
                      </div>
                      <div className="text-right">
                        {getActionButtons(room)}
                      </div>
                    </div>
                    
                    {room.guest && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Guest:</span>
                          <div className="font-medium">{room.guest}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check-in:</span>
                          <div className="font-medium">{formatDateTime(room.checkIn)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check-out:</span>
                          <div className="font-medium">{formatDateTime(room.checkOut)}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      Last cleaned: {room.lastCleaned === "in-progress" ? "Currently being cleaned" : formatDateTime(room.lastCleaned)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default RoomManagement;
