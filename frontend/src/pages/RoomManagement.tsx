import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Settings, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const RoomManagement = () => {
  const userRole = localStorage.getItem('role');
  const [rooms, setRooms] = useState<any[]>([]); 
  const [editBookingId, setEditBookingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const location = useLocation();

  // Hàm fetchRoom
  const fetchRooms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/rooms_bookings/current`);
      const data = await response.json();
      setRooms(Array.isArray(data) ? data : []);

      // Lấy room_id từ query string
      const params = new URLSearchParams(location.search);
      const roomId = params.get("room_id");

      if (roomId) {
        // Đợi React render xong DOM mới scroll
        setTimeout(() => {
          const element = document.getElementById(`room-${roomId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Highlight tạm thời
            // Gán màu nềg với opacity 100% ban đầu
            element.style.transition = "background-color 1s ease-out";
            element.style.backgroundColor = "#6dabe8";
            // Sau 1 tick event loop thì giảm opacity xuống
            setTimeout(() => {
              element.style.backgroundColor = "transparent";
            }, 300);

            // Xóa hẳn style sau khi animation xong
            setTimeout(() => {
              element.style.transition = "";
              element.style.backgroundColor = "";
            }, 1050);
          }
        }, 300); // delay 300ms để DOM render xong
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };
  useEffect(() => {
    fetchRooms();
  }, [location]);

  // Hàm update thông tin đặt phòng
  const handleUpdate = async (booking_id: number, field: string, value: string) => {
    try {
      let newEditData = { ...editData, [field]: value };

      // Validation check-in / check-out
      if (field === "check_in" || field === "check_out") {
        const checkIn = new Date(convertDDMMYYYYtoISO(newEditData.check_in));
        const checkOut = new Date(convertDDMMYYYYtoISO(newEditData.check_out));
        const booking_date = new Date(convertDDMMYYYYtoISO(newEditData.booking_date));

        if (checkIn && checkOut && checkOut < checkIn) {
          alert("Ngày check-out phải sau ngày check-in");
          return; // Không cho gọi API update
        }

        if ((checkIn && booking_date && checkIn < booking_date) || (checkOut && booking_date && checkOut < booking_date)) {
          alert("Ngày check-in phải sau ngày đặt");
          return; // Không cho gọi API update
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/bookings/${booking_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value })
      });

      if (!response.ok) throw new Error("Update failed");
      const updated = await response.json();
      setEditBookingId(null); // Close edit mode after update
    } catch (error) {
      console.error("Lỗi update booking FE:", error);
    }
  };

  //Hàm thêm mới đặt phòng
  const handleAddBooking = async (newBooking: any) => {
    try {
      const checkIn = new Date(newBooking.check_in);
      const checkOut = new Date(newBooking.check_out);
      const booking_date = new Date(newBooking.booking_date);
      if (checkOut < checkIn) {
        alert("Ngày check-out phải sau ngày check-in");
        return;
      }
      if ((checkIn < booking_date) || (checkOut < booking_date)) {
        alert("Ngày check-in và check-out phải sau ngày đặt");
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking)
      });

      if (!response.ok) {
        const errorData = await response.json(); // lấy message từ BE
        throw new Error(errorData.message || "Failed to add booking");
      }

      const addedBooking = await response.json();
      setRooms(prev => [...prev, addedBooking]);
      alert("Booking tạo thành công");
    } catch (error: any) {
      alert(error.message); // hiển thị lỗi cho user thay vì chỉ console.log
      console.error("Error adding booking:", error);
    }
  };

  // Hàm thay đổi trạng thái phòng (room_status)
  const handleStatusChange = async (roomId: number, newStatus: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${roomId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      // Sau khi cập nhật, fetch lại danh sách phòng từ backend để đồng bộ FE/BE
      await fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };


  // Hàm lưu tất cả các thay đổi
  const handleSaveAll = async () => {
    if (!editBookingId) return;
    const fieldsToUpdate = Object.keys(editData);

    // Validation check-in / check-out trước khi update
    const checkIn = new Date(convertDDMMYYYYtoISO(editData.check_in));
    const checkOut = new Date(convertDDMMYYYYtoISO(editData.check_out));
    const booking_date = new Date(convertDDMMYYYYtoISO(editData.booking_date));
    if (checkOut < checkIn) {
      alert("Ngày check-out phải sau ngày check-in");
      return;
    }
    if ((checkIn < booking_date) || (checkOut < booking_date)) {
      alert("Ngày check-in và check-out phải sau ngày đặt");
      return;
    }

    for (const field of fieldsToUpdate) {
      let value = editData[field];

      // Chuyển đổi định dạng ngày (nếu là ngày)
      if (['check_in', 'check_out', 'booking_date'].includes(field)) {
        value = convertDDMMYYYYtoISO(value);
      }

      await handleUpdate(editBookingId, field, value);
    }

    // Cập nhật trực tiếp dữ liệu trong state rooms
    setRooms(prev =>
      prev.map(room =>
        room.booking_id === editBookingId
          ? {
            ...room,
            ...editData,
            check_in: convertDDMMYYYYtoISO(editData.check_in),
            check_out: convertDDMMYYYYtoISO(editData.check_out),
            booking_date: convertDDMMYYYYtoISO(editData.booking_date)
          }
          : room
      )
    );
    setEditBookingId(null);
    setEditData({});
  };

  // Hàm lấy màu sắc trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-[#6dabe8] hover:text-[#6dabe8] hover:bg-white hover:border-[#6dabe8]"><CheckCircle className="h-3 w-3 mr-1" />Còn Trống</Badge>;
      case "Occupied":
        return <Badge className="bg-[#d19ab4] hover:text-[#d19ab4] hover:bg-white hover:border-[#d19ab4]"><Users className="h-3 w-3 mr-1" />Đang Ở</Badge>;
      case "Maintenance":
        return <Badge className="bg-[#DA3748]"><AlertTriangle className="h-3 w-3 mr-1" />Bảo Trì</Badge>;
      case "Cleaning":
        return <Badge className="bg-[#9167e1]"><Settings className="h-3 w-3 mr-1" />Đang Dọn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Hàm định dạng ngày giờ
  const formatDateToDDMMYYYY = (dateStr: string) => {
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Hàm chuyển đổi định dạng DD/MM/YYYY sang ISO
  const convertDDMMYYYYtoISO = (ddmmyyyy: string) => {
    const [dd, mm, yyyy] = ddmmyyyy.split('/');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Nhóm các phòng theo tầng
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, typeof rooms>);

  // Mapping EN - VN
  const statusMap: Record<string, string> = {
    "Confirmed": "Xác Nhận",
    "Cancelled": "Hủy Đơn",
    "Checked-in": "Check-in",
    "Checked-out": "Check-out"
  };

  return (
    <MainLayout userRole={userRole}>
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          <div>
            <div>
              <h1 className="text-2xl font-semibold text-[#af3c6a]">Quản Lý Phòng</h1>
              <p className="text-sm text-muted-foreground mt-1 ">
                Hiển thị trạng thái của các phòng và thông tin khách ở thời điểm hiện tại
              </p>
            </div>
          </div>

          {/* Add New Booking button: Ẩn nếu userRole là 'Cleaner' */}
          {userRole !== "Cleaner" && (
            <div className=" bg-[#4b9ae9] text-white rounded-full hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border focus:outline-none focus:ring-2 focus:ring-blue-500  shadow-blue-500/50 shadow-lg">
              <Button
                onClick={() => {
                  // -1 = "tạo booking mới" (editBookingId là number | null nên dùng -1)
                  setEditBookingId(-1);
                  setEditData({
                    room_number: '',
                    guest_name: '',
                    phone_number: '',
                    check_in: formatDateToDDMMYYYY(new Date().toISOString()),
                    check_out: formatDateToDDMMYYYY(new Date().toISOString()),
                    booking_date: formatDateToDDMMYYYY(new Date().toISOString()),
                    booking_source: 'Airbnb',
                    booking_status: 'Confirmed',
                    amount_received: 0
                  });
                }}
                variant="outline"
                className="bg-blue-500 border-blue-500 text-white rounded-full hover:bg-white
                                hover:text-blue-500 hover:border-blue-500 shadow-blue-500/50 shadow-lg
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                ">
                Tạo Mới Booking
              </Button>
            </div>
          )}
        </div>


        {/* Modal dùng lại editData, hiện khi editBookingId === -1 */}
        {editBookingId === -1 && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            {/* overlay mờ, click vào đóng modal */}
            <div
              className="fixed inset-0 bg-black opacity-40"
              onClick={() => { setEditBookingId(null); setEditData({}); }} />

            <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl z-10">
              <h2 className="text-xl font-bold mb-4 text-center text-[#af3c6a]">Tạo Mới Booking</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
                <div className="text-[#af3c6a]">Tên Phòng
                  <input
                    type="text"
                    placeholder="Tên Phòng"
                    className="border p-2 w-full rounded-xl text-blue"
                    value={editData.room_number || ''}
                    onChange={(e) => setEditData({ ...editData, room_number: e.target.value })}
                  />
                </div>

                <div className="text-[#af3c6a]">Họ & Tên KH
                  <input
                    type="text"
                    placeholder="Tên KH"
                    className="border p-2 w-full rounded-xl"
                    value={editData.guest_name || ''}
                    onChange={(e) => setEditData({ ...editData, guest_name: e.target.value })}
                  />
                </div>

                <div className="text-[#af3c6a]">Số Điện Thoại
                  <input
                    type="text"
                    placeholder="SĐT"
                    className="border p-2 w-full rounded-xl"
                    value={editData.phone_number || ''}
                    onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })} />
                </div>

                <div className="text-[#af3c6a]">Tổng Thu Được
                  <input
                    type="text"
                    placeholder="Số Tiền"
                    className="border p-2 w-full rounded-xl"
                    value={editData.amount_received ?? ''}
                    onChange={(e) => setEditData({ ...editData, amount_received: e.target.value })} />
                </div>

                <div className="text-[#af3c6a]">Ngày check-in
                  <input
                    type="text"
                    placeholder="Check-in dd/mm/yyyy"
                    className="border p-2 w-full rounded-xl"
                    value={editData.check_in || ''}
                    onChange={(e) => setEditData({ ...editData, check_in: e.target.value })} />
                </div>

                <div className="text-[#af3c6a]">Ngày check-out
                  <input
                    type="text"
                    placeholder="Check-out dd/mm/yyyy "
                    className="border p-2 w-full rounded-xl"
                    value={editData.check_out || ''}
                    onChange={(e) => setEditData({ ...editData, check_out: e.target.value })} />
                </div>

                <div className="text-[#af3c6a]">Ngày Đặt
                  <input
                    type="text"
                    placeholder="Booking date dd/mm/yyyy"
                    className="border p-2 w-full rounded-xl"
                    value={editData.booking_date || ''}
                    onChange={(e) => setEditData({ ...editData, booking_date: e.target.value })} />
                </div>

                <div className="text-[#af3c6a]">Nguồn Đặt
                  <select
                    className="border p-2 w-full rounded-xl"
                    value={editData.booking_source || 'Airbnb'}
                    onChange={(e) => setEditData({ ...editData, booking_source: e.target.value })}>
                    {["Facebook", "Booking.com", "Agoda", "Airbnb", "Walk-in", "Zalo"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="text-[#af3c6a]">Trạng thái booking
                  <select
                    className="border p-2 w-full rounded-xl"
                    value={editData.booking_status || 'Confirmed'}   // luôn lưu EN
                    onChange={(e) => setEditData({ ...editData, booking_status: e.target.value })}
                  >
                    {Object.entries(statusMap).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  onClick={() => { setEditBookingId(null); setEditData({}); }}
                  variant="outline"
                  className="bg-grey-500 text-grey-500 rounded-xl hover:bg-gray-500 hover:text-white hover:border-grey-500 hover:border focus:outline-none focus:ring-2 shadow-grey-500/50 shadow-lg">
                  Hủy
                </Button>

                <Button
                  variant="outline"
                  className="bg-[#4b9ae9] text-white border-2 rounded-xl hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-blue-500/50 shadow-lg transition-all duration-200"
                  onClick={async () => {
                    // basic validation
                    if (!editData.room_number || !editData.guest_name) {
                      alert('Room number và Guest name là bắt buộc');
                      return;
                    }

                    const payload = {
                      room_number: editData.room_number,
                      guest_name: editData.guest_name,
                      phone_number: editData.phone_number || null,
                      check_in: convertDDMMYYYYtoISO(editData.check_in || formatDateToDDMMYYYY(new Date().toISOString())),
                      check_out: convertDDMMYYYYtoISO(editData.check_out || formatDateToDDMMYYYY(new Date().toISOString())),
                      booking_source: editData.booking_source,
                      booking_status: editData.booking_status,
                      amount_received: Number(String(editData.amount_received || 0).replace(/,/g, '')),
                      booking_date: convertDDMMYYYYtoISO(editData.booking_date || formatDateToDDMMYYYY(new Date().toISOString()))
                    };

                    await handleAddBooking(payload); // hàm bạn đã có sẽ push booking vào state nếu BE trả về booking mới
                    setEditBookingId(null);
                    setEditData({});
                  }}
                >
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        )}


        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
          {["Available", "Occupied", "Cleaning", "Maintenance"].map((status) => {
            const statusVN: Record<string, string> = {
              "Available": "Còn trống",
              "Occupied": "Đang ở",
              "Cleaning": "Đang dọn",
              "Maintenance": "Bảo trì"
            };
            return (
              <Card key={status}>
                <CardContent className="p-4 shadow-xl">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${status === "Available" ? "text-blue-500" :
                      status === "Occupied" ? "text-[#af3c6a]" :
                        status === "Cleaning" ? "text-[#854af4]" : "text-[#DA3748]"
                      }`}>
                      {rooms.filter(room => room.status === status).length}
                    </div>
                    <div className="text-sm text-muted-foreground">{statusVN[status]}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {Object.keys(roomsByFloor).sort().map(floor => (
          <Card key={floor} className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#af3c6a]">Tầng {floor}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {(roomsByFloor[parseInt(floor)] ?? []).map((room) => (
                  <div id={`room-${room.room_id}`} key={room.room_id} className="border rounded-lg p-4 space-y-4 ">
                    <div className="flex items-center justify-between text-[#af3c6a]">
                      <div className="flex items-center gap-3 ">
                        <div className="flex items-center gap-2">
                          <Bed className="h-5 w-5" />
                          <span className="font-medium text-lg">Phòng {room.room_number}</span>
                        </div>
                        <Badge variant="outline">Tầng {room.floor}</Badge>
                        {["Available", "Cleaning", "Maintenance"].includes(room.status) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`h-6 px-2 py-0 rounded-full border transition-colors inline-flex items-center font-normal text-xs
                                            ${room.status === "Available" ? "bg-[#6dabe8] text-white hover:bg-white hover:text-[#6dabe8] hover:border-[#6dabe8]" : ""}
                                            ${room.status === "Cleaning" ? "bg-[#bc99fe] text-white hover:bg-white hover:text-[#bc99fe] hover:border-[#bc99fe]" : ""}
                                            ${room.status === "Maintenance" ? "bg-[#DA3748] text-white hover:bg-white hover:text-[#DA3748] hover:border-[#DA3748]" : ""}
                                          `}
                              >
                                {room.status === "Available" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {room.status === "Cleaning" && <Settings className="h-3 w-3 mr-1" />}
                                {room.status === "Maintenance" && <AlertTriangle className="h-3 w-3 mr-1" />}

                                {room.status === "Available" ? "Trống" :
                                  room.status === "Cleaning" ? "Đang Dọn" : "Bảo Trì"}

                                <MoreVertical className="h-4 w-4 ml-1" />
                              </Button>

                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" sideOffset={6} className="w-44">
                              {room.status !== "Available" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(room.room_id, "Available")}>
                                  Trống
                                </DropdownMenuItem>
                              )}
                              {room.status !== "Cleaning" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(room.room_id, "Cleaning")}>
                                  Đang Dọn
                                </DropdownMenuItem>
                              )}
                              {room.status !== "Maintenance" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(room.room_id, "Maintenance")}>
                                  Bảo Trì
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          getStatusBadge(room.status)
                        )}

                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-700">
                          {Number(room.price).toLocaleString("vi-VN", { minimumFractionDigits: 0 })} VND
                        </div>
                      </div>
                    </div>

                    {userRole !== "Cleaner" && room.guest_name && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {/* Guest name */}
                        <div>
                          <span className="text-muted-foreground">Họ & Tên Khách Hàng:</span>
                          {editBookingId === room.booking_id ? (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={editData.guest_name || ''}
                              onChange={(e) => setEditData({ ...editData, guest_name: e.target.value })}
                            />
                          ) : (
                            <div className="font-medium">{room.guest_name}</div>
                          )}
                        </div>
                        {/* Phone number */}
                        <div>
                          <span className="text-muted-foreground">Số Điện Thoại:</span>
                          {editBookingId === room.booking_id ? (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={editData.phone_number || ''}
                              onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                            />
                          ) : (
                            <div className="font-medium">{room.phone_number}</div>
                          )}
                        </div>
                        {/* Booking date */}
                        <div>
                          <span className="text-muted-foreground">Ngày Đặt:</span>
                          {editBookingId === room.booking_id ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full"
                              value={editData.booking_date || ''}
                              onChange={(e) =>
                                setEditData({ ...editData, booking_date: e.target.value })
                              }
                              placeholder="dd/mm/yyyy"
                            />
                          ) : (
                            <div className="font-medium">{formatDateToDDMMYYYY(room.booking_date)}</div>
                          )}
                        </div>
                        {/* Check-in */}
                        <div>
                          <span className="text-muted-foreground">Ngày Check-in:</span>
                          {editBookingId === room.booking_id ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full"
                              value={editData.check_in || ''}
                              onChange={(e) =>
                                setEditData({ ...editData, check_in: e.target.value })
                              }
                              placeholder="dd/mm/yyyy"
                            />
                          ) : (
                            <div className="font-medium">{formatDateToDDMMYYYY(room.check_in)}</div>
                          )}
                        </div>
                        {/* Check-out */}
                        <div>
                          <span className="text-muted-foreground">Ngày Check-out:</span>
                          {editBookingId === room.booking_id ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full"
                              value={editData.check_out || ''}
                              onChange={(e) =>
                                setEditData({ ...editData, check_out: e.target.value })
                              }
                              placeholder="dd/mm/yyyy"
                            />
                          ) : (
                            <div className="font-medium">{formatDateToDDMMYYYY(room.check_out)}</div>
                          )}
                        </div>
                        {/* Booking Source */}
                        <div>
                          <span className="text-muted-foreground">Nguồn Đặt:</span>
                          {editBookingId === room.booking_id ? (
                            <select
                              className="border rounded px-2 py-1 w-full"
                              value={editData.booking_source || ''}
                              onChange={(e) => setEditData({ ...editData, booking_source: e.target.value })}
                            >
                              {["Facebook", "Booking.com", "Agoda", "Airbnb", "TWalk-in", "Zalo"].map((src) => (
                                <option key={src} value={src}>{src}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="font-medium">{room.booking_source}</div>
                          )}
                        </div>
                        {/* Booking Status */}
                        <div>
                          <span className="text-muted-foreground">Trạng Thái Booking:</span>
                          {editBookingId === room.booking_id ? (
                            <select
                              className="border p-2 w-full rounded-xl"
                              value={editData.booking_status || 'Confirmed'}   // luôn lưu EN
                              onChange={(e) => setEditData({ ...editData, booking_status: e.target.value })}
                            >
                              {Object.entries(statusMap).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="font-medium">{room.booking_status}</div>
                          )}
                        </div>
                        {/* Amount received */}
                        <div>
                          <span className="text-muted-foreground">Tổng Thu Được:</span>
                          {editBookingId === room.booking_id ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full"
                              value={editData.amount_received || ''}
                              onChange={(e) =>
                                setEditData({ ...editData, amount_received: e.target.value })
                              }
                            />
                          ) : (
                            <div className="font-medium">{Number(room.amount_received ?? 0).toLocaleString("vi-VN", { minimumFractionDigits: 0 })} VND</div>
                          )}
                        </div>
                        {/* Nút Edit / Done */}
                        <div className="col-span-3 text-right">
                          {editBookingId === room.booking_id ? (
                            <Button
                              variant="outline"
                              onClick={handleSaveAll}
                              className="px-2 py-2 bg-green-500 text-white border-green-500 rounded-xl hover:bg-white hover:text-green-500 hover:border-green-500 hover:border focus:ring-green-500 shadow-green-500/50 shadow-lg"
                            >
                              Lưu
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                setEditBookingId(room.booking_id);
                                setEditData({
                                  guest_name: room.guest_name,
                                  phone_number: room.phone_number,
                                  check_in: formatDateToDDMMYYYY(room.check_in),
                                  check_out: formatDateToDDMMYYYY(room.check_out),
                                  booking_date: formatDateToDDMMYYYY(room.booking_date),
                                  booking_source: room.booking_source,
                                  booking_status: room.booking_status,
                                  amount_received: room.amount_received
                                });
                              }}
                              variant="outline"
                              className="px-2 py-2 bg-blue-500 text-white border-blue-500 rounded-xl hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border shadow-blue-500/50 shadow-lg focus:ring-blue-500"
                            >
                              Sửa
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
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
