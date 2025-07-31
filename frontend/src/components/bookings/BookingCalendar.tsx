
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BookingCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Sample booking data with time slots
  const bookings = [
    { date: new Date(2025, 5, 17), room: "101", guest: "John Doe", time: "14:00 - 16:00", status: "checked-in" },
    { date: new Date(2025, 5, 17), room: "102", guest: "Sarah Johnson", time: "10:00 - 12:00", status: "confirmed" },
    { date: new Date(2025, 5, 17), room: "305", guest: "Michael Smith", time: "18:00 - 20:00", status: "pending" },
    { date: new Date(2025, 5, 18), room: "204", guest: "Emily Wong", time: "09:00 - 11:00", status: "confirmed" },
    { date: new Date(2025, 5, 18), room: "101", guest: "David Miller", time: "15:00 - 17:00", status: "checked-in" },
    { date: new Date(2025, 5, 19), room: "102", guest: "Lisa Brown", time: "11:00 - 13:00", status: "confirmed" },
    { date: new Date(2025, 5, 19), room: "203", guest: "Tom Wilson", time: "16:00 - 18:00", status: "pending" },
    { date: new Date(2025, 5, 20), room: "305", guest: "Anna Davis", time: "08:00 - 10:00", status: "confirmed" },
  ];

  // Determine if a date has bookings
  const hasBooking = (date: Date) => {
    return bookings.some(booking => 
      booking.date.getDate() === date.getDate() && 
      booking.date.getMonth() === date.getMonth() && 
      booking.date.getFullYear() === date.getFullYear()
    );
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      booking.date.getDate() === date.getDate() && 
      booking.date.getMonth() === date.getMonth() && 
      booking.date.getFullYear() === date.getFullYear()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "checked-in":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Custom day content to show booking blocks
  const renderDayContent = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    
    return (
      <div className="w-full h-full min-h-[120px] p-1">
        <div className="text-sm font-medium mb-1">{date.getDate()}</div>
        <div className="space-y-1">
          {dayBookings.slice(0, 3).map((booking, index) => (
            <div
              key={index}
              className={`text-xs p-1 rounded text-white truncate ${getStatusColor(booking.status)}`}
              title={`${booking.guest} - Room ${booking.room} (${booking.time})`}
            >
              <div className="font-medium">Room {booking.room}</div>
              <div className="truncate">{booking.guest}</div>
              <div className="text-xs opacity-90">{booking.time}</div>
            </div>
          ))}
          {dayBookings.length > 3 && (
            <div className="text-xs text-gray-500 p-1">
              +{dayBookings.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="w-full h-full border rounded-md p-4"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
          month: "space-y-4 w-full",
          table: "w-full border-collapse",
          head_row: "flex w-full",
          head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm flex-1",
          row: "flex w-full mt-2",
          cell: "relative p-0 text-center text-sm flex-1 h-32 border border-gray-200",
          day: "h-full w-full p-0 font-normal hover:bg-accent",
        }}
        components={{
          DayContent: ({ date }) => renderDayContent(date),
        }}
        modifiers={{
          booked: (date) => hasBooking(date)
        }}
        modifiersStyles={{
          booked: { 
            fontWeight: 'bold'
          }
        }}
      />
    </div>
  );
};

export default BookingCalendar;
