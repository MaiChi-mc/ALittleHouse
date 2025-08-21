import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { startOfMonth, endOfMonth, addDays, format, isBefore, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const groupBookingsByRoom = (rows: any[]) => {
  const map: Record<string, any> = {};

  rows.forEach((row) => {
    const key = row.room_id ?? row.room_number ?? `${row.room_name ?? 'room'}_${Math.random()}`;
    if (!map[key]) {
      map[key] = {
        room_id: row.room_id ?? null,
        room_number: row.room_number ?? row.room_name ?? `Phòng ${key}`,
        price: row.price ?? row.room_price ?? row.amount_received ?? 0,
        bookings: [] as any[],
      };
    }
    if (row.booking_id) {
      map[key].bookings.push({
        booking_id: row.booking_id,
        guest_name: row.guest_name,
        phone_number: row.phone_number,
        booking_status: row.booking_status,
        check_in: row.check_in,
        check_out: row.check_out, booking_date: row.booking_date ?? null,
        booking_source: row.booking_source ?? null,
        amount_received: row.amount_received ?? row.price ?? null,
      });
    }
  });
  return Object.values(map);
};

const Bookings = () => {
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [editBookingId, setEditBookingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);
  const today = new Date();

  const dateRange: Date[] = [];
  for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
    dateRange.push(new Date(d));
  }

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/bookings/all");
      const data = await response.json();

      if (Array.isArray(data)) {
        const grouped = groupBookingsByRoom(data);
        setRooms(grouped);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-200 text-gray-800";
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-[#6dabe8] text-white";
      case "pending":
        return "bg-yellow-400 text-white";
      case "checked-in":
      case "checkedin":
        return "bg-[#d19ab4] text-white";
      case "checked-out":
      case "checkedout":
        return "bg-gray-500 text-white";
      case "cancelled":
      case "canceled":
        return "bg-red-500 text-white";
      default:
        return "bg-blue-500 text-white"; // mặc định giống giao diện bạn đang dùng
    }
  };

  const formatPrice = (p: any) => {
    if (p === null || p === undefined) return "";
    const n = Number(p) || 0;
    return n.toLocaleString("vi-VN", { minimumFractionDigits: 0 }) + " VND";
  };

  // Hàm xóa booking
  const handleDeleteBooking = async (booking_id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa booking này?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/auth/bookings/${booking_id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }

      alert("Xóa booking thành công");
      fetchRooms(); // Cập nhật lại danh sách phòng sau khi xóa
    } catch (err: any) {
      alert("Xóa thất bại: " + err.message);
      console.error("Lỗi khi xóa booking:", err);
    }
  };


  // Hàm update booking (gọi khi Save form Edit)
  const handleUpdateBooking = async () => {
    if (!editBookingId) return;
    const fieldsToUpdate = Object.keys(editData);
    for (const field of fieldsToUpdate) {
      let value = editData[field];
      if (["check_in", "check_out", "booking_date"].includes(field)) {
        value = convertDDMMYYYYtoISO(value);
      }
      await fetch(`http://localhost:8080/api/auth/bookings/${editBookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value })
      });
    }
    setEditBookingId(null);
    setEditData({});
    fetchRooms();
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

  // Mapping EN - VN
  const statusMap: Record<string, string> = {
    "Confirmed": "Xác Nhận",
    "Cancelled": "Hủy Đơn",
    "Checked-in": "Check-in",
    "Checked-out": "Check-out"
  };

  return (
    <MainLayout userRole={userRole}>
      <div className="fixed border top-[90px] left-[270px] right-5 z-0  bg-white shadow-xl rounded-xl">
        {/* Chọn tháng và năm */}
        <div className="sticky top-0 z-30 bg-transparent p-4 flex gap-4 border-b border-gray-200">
          {/* Dropdown Năm */}
          <div>
            <label className="mr-2 font-medium text-[#3a80c6]">Năm:</label>
            <select
              className="border px-2 py-1 rounded-3xl "
              value={selectedMonth.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(selectedMonth);
                newDate.setFullYear(Number(e.target.value));
                setSelectedMonth(newDate);
              }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Dropdown Tháng */}
          <div>
            <label className="mr-2 font-medium text-[#3a80c6]">Tháng:</label>
            <select
              className="border px-2 py-1 rounded-3xl"
              value={selectedMonth.getMonth()}
              onChange={(e) => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(Number(e.target.value));
                setSelectedMonth(newDate);
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Table - sử dụng maxHeight dựa trên viewport để sửa lỗi scroll */}
        <div id="calendar-scroll" className="overflow-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          <table className="table-auto border-collapse border border-gray-300 min-w-max">
            <thead className="bg-white-200">
              <tr className="sticky top-0 z-10">
                <th className="sticky left-0 z-40 bg-white border px-2 py-2 text-centers w-32 text-[#af3c6a]">
                  Phòng
                </th>
                {dateRange.map((date, index) => {
                  const isPast = isBefore(date, today);
                  const isToday = isSameDay(date, today);
                  return (
                    <th
                      key={index}
                      className={`border px-2 py-2 text-center whitespace-nowrap ${isToday ? "bg-[#af3c6a] text-white" : isPast ? "bg-gray-300" : ""
                        }`}
                    >
                      {format(date, "dd/MM")}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {rooms.map((room, roomIndex) => {
                // Chuẩn bị các booking chỉ nằm trong range hiện tại và tính vị trí + span
                const visible = (room.bookings || [])
                  .map((b: any) => {
                    const s = new Date(b.check_in);
                    const e = new Date(b.check_out);
                    const overlapStart = s < startDate ? startDate : s;
                    const overlapEnd = e > endDate ? endDate : e;
                    if (overlapEnd < startDate || overlapStart > endDate) return null;
                    const startIndex = Math.round((overlapStart.getTime() - startDate.getTime()) / (24 * 3600 * 1000));
                    const span = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (24 * 3600 * 1000)) + 1;
                    return { ...b, overlapStart, overlapEnd, startIndex, span, originalStart: s };
                  })
                  .filter(Boolean)
                  // nếu có nhiều booking bắt đầu cùng index, ưu tiên booking có check_in gần nhất (thường không xảy ra)
                  .sort((a: any, b: any) => a.startIndex - b.startIndex);

                return (
                  <tr key={roomIndex}>
                    <td 
                    onClick={() => navigate(`/room-management?room_id=${room.room_id}`)}
                    className="sticky left-0 z-30 px-2 py-2 font-medium text-center text-m w-32 bg-white text-[#af3c6a] hover:bg-[#f1c9db] hover:text-[#af3c6a] border">
                      {room.room_number}
                    </td>

                    {
                      // render cells với colspan cho bookings
                      (() => {
                        const cells: any[] = [];
                        for (let i = 0; i < dateRange.length; i++) {
                          // tìm booking có startIndex === i
                          const b = visible.find((vb: any) => vb.startIndex === i);
                          if (b) {
                            // kiểm tra xem ngày hiển thị là đúng ngày check-in thật sự hay chỉ là overlap do cắt tháng
                            const showAmountOnThisCell = isSameDay(new Date(b.originalStart), dateRange[i]);

                            cells.push(
                              <td key={i} colSpan={b.span} className="border px-1 py-1 align-top">
                                <div
                                  id={`booking-${b.booking_id}`}
                                  className={`${getStatusColor(b.booking_status)} rounded-md text-xs p-2 flex items-center hover:bg-[#dfcd2a] cursor-pointer`}
                                  onClick={() => {
                                    setEditBookingId(b.booking_id);
                                    setEditData({
                                      guest_name: b.guest_name,
                                      phone_number: b.phone_number,
                                      check_in: formatDateToDDMMYYYY(b.check_in),
                                      check_out: formatDateToDDMMYYYY(b.check_out),
                                      booking_date: formatDateToDDMMYYYY(b.booking_date),
                                      booking_source: b.booking_source,
                                      booking_status: b.booking_status,
                                      amount_received: b.amount_received
                                    });
                                  }}>
                                  {/* Bên trái: Tên + số tiền */}
                                  <div className="flex items-center">
                                    <span className="font-semibold">{b.guest_name}</span>
                                    {showAmountOnThisCell && (
                                      <span className="text-[12px] ml-2">
                                        {formatPrice(b.amount_received ?? room.price)}
                                      </span>
                                    )}
                                  </div>
                                  {/* Spacer đẩy nút Xóa sang phải */}
                                  <div className="flex-1"></div>
                                  {/* Nút Xóa */}
                                  {showAmountOnThisCell && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBooking(b.booking_id);
                                      }}
                                      className="text-[12px] underline"
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>
                              </td>
                            );

                            i += b.span - 1; // nhảy qua các ô bị colspan
                          } else {
                            // không có booking bắt đầu ở ô này => ô trống (show price của phòng như ban đầu)
                            cells.push(
                              <td key={i} className={`border px-7 py-1 text-xs text-center align-top`}>
                                <div className="text-xs text-gray-600">{formatPrice(room.price)}</div>
                              </td>
                            );
                          }
                        }
                        return cells;
                      })()
                    }
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Booking */}
      {editBookingId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
          <div
            className="fixed inset-0 bg-black opacity-40"
            onClick={() => { setEditBookingId(null); setEditData({}); }}
          />
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl z-10">
            <h2 className="text-xl font-bold mb-4 text-center text-[#af3c6a]">Chỉnh sửa thông tin Booking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
              <div className="text-[#af3c6a]">Họ & tên KH
                <input
                  type="text"
                  placeholder="Tên KH"
                  className="border p-2 w-full rounded-xl"
                  value={editData.guest_name || ''}
                  onChange={e => setEditData({ ...editData, guest_name: e.target.value })}
                />
              </div>
              <div className="text-[#af3c6a]">Số Diện Thoại
                <input
                  type="text"
                  placeholder="SĐT"
                  className="border p-2 w-full rounded-xl"
                  value={editData.phone_number || ''}
                  onChange={e => setEditData({ ...editData, phone_number: e.target.value })}
                />
              </div>
              <div className="text-[#af3c6a]">Tổng Thu được
                <input
                  type="text"
                  placeholder="Số Tiền"
                  className="border p-2 w-full rounded-xl"
                  value={editData.amount_received ?? ''}
                  onChange={e => setEditData({ ...editData, amount_received: e.target.value })}
                />
              </div>
              <div className="text-[#af3c6a]">Ngày Check-in
                <input
                  type="text"
                  placeholder="Check-in dd/mm/yyyy"
                  className="border p-2 w-full rounded-xl"
                  value={editData.check_in || ''}
                  onChange={e => setEditData({ ...editData, check_in: e.target.value })}
                />
              </div>
              <div className="text-[#af3c6a]">Ngày Check-out
                <input
                  type="text"
                  placeholder="Check-out dd/mm/yyyy"
                  className="border p-2 w-full rounded-xl"
                  value={editData.check_out || ''}
                  onChange={e => setEditData({ ...editData, check_out: e.target.value })}
                />
              </div>
              <div className="text-[#af3c6a]">Ngày Đặt
                <input
                  type="text"
                  placeholder="Ngày đặt dd/mm/yyyy"
                  className="border p-2 w-full rounded-xl"
                  value={editData.booking_date || ''}
                  onChange={e => setEditData({ ...editData, booking_date: e.target.value })}
                />
              </div>
              <div className="text-[#af3c6a]">Nguồn đặt
                <select
                  className="border p-2 w-full rounded-xl"
                  value={editData.booking_source || 'Airbnb'}
                  onChange={e => setEditData({ ...editData, booking_source: e.target.value })}
                >
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
                className="bg-gray-500 border-gray-500 text-white rounded-xl hover:bg-white hover:text-gray-500 hover:border-gray-500 hover:border focus:outline-none focus:ring-2 shadow-gray-500/50 shadow-lg">
                Hủy
              </Button>
              <Button
                onClick={handleUpdateBooking}
                variant="outline"
                className=" bg-[#4b9ae9] border-blue-[#4b9ae9] text-white rounded-xl hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border focus:outline-none focus:ring-2 focus:ring-blue-500  shadow-blue-500/50 shadow-lg"
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Bookings;
