import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar as CalendarIcon, 
  Hotel,
  MoreHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import BookingCalendar from "@/components/bookings/BookingCalendar";

const Bookings = () => {
  const bookings = [
    {
      id: "B-1001",
      guest: "John Doe",
      room: "101",
      checkIn: "2025-05-18",
      checkOut: "2025-05-20",
      status: "confirmed",
      source: "Direct",
    },
    {
      id: "B-1002",
      guest: "Emily Wong",
      room: "204",
      checkIn: "2025-05-20",
      checkOut: "2025-05-25",
      status: "pending",
      source: "Airbnb",
    },
    {
      id: "B-1003",
      guest: "Michael Smith",
      room: "305",
      checkIn: "2025-05-16",
      checkOut: "2025-05-18",
      status: "checked-in",
      source: "Agoda",
    },
    {
      id: "B-1004",
      guest: "Sarah Johnson",
      room: "102",
      checkIn: "2025-05-22",
      checkOut: "2025-05-24",
      status: "confirmed",
      source: "Booking.com",
    },
    {
      id: "B-1005",
      guest: "David Miller",
      room: "203",
      checkIn: "2025-05-19",
      checkOut: "2025-05-21",
      status: "cancelled",
      source: "Direct",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "checked-in":
        return <Badge className="bg-blue-500">Checked In</Badge>;
      case "checked-out":
        return <Badge className="bg-gray-500">Checked Out</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Room Bookings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all your room bookings in one place
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Date Range
            </Button>
          </div>
        </div>

        {/* Calendar Section - Takes up first half of the page */}
        <Card className="flex-1 min-h-[50vh]">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <BookingCalendar />
          </CardContent>
        </Card>

        {/* List Section - Takes up second half */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Booking List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>{booking.guest}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Hotel className="h-3 w-3" />
                          {booking.room}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(booking.checkIn)}</TableCell>
                      <TableCell>{formatDate(booking.checkOut)}</TableCell>
                      <TableCell>{booking.source}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                            <DropdownMenuItem>Check In</DropdownMenuItem>
                            <DropdownMenuItem>Check Out</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Bookings;
