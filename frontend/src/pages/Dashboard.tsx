import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Room = {
  room_id: number;
  room_number: string;
  floor: number;
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
};

// màu & icon cho trạng thái
const statusConfig: Record<
  Room["status"],
  { color: string; text: string }
> = {
  Available: { color: "bg-[#6dabe8]", text: "Còn trống" },
  Occupied: { color: "bg-[#d19ab4]", text: "Đang ở" },
  Cleaning: { color: "bg-[#9167e1]", text: "Đang dọn" },
  Maintenance: { color: "bg-[#DA3748]", text: "Bảo trì" },
};

// Helper lấy màu status
const getStatusColor = (status: string) => {
  switch (status) {
    case "Available": return "#6dabe8";
    case "Occupied": return "#d19ab4";
    case "Cleaning": return "#9167e1";
    case "Maintenance": return "#DA3748";
    default: return "#999";
  }
};

// ô hiển thị phòng
const RoomBox = ({ room }: { room: Room }) => {
  const cfg = statusConfig[room.status];
  return (
    <div
      className={`w-20 h-20 flex flex-col items-center justify-center rounded-lg text-white shadow-md ${cfg.color}`}
    >
      <span className="font-bold">{room.room_number}</span>
      <span className="text-xs">{cfg.text}</span>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const [bookings, setBookings] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [checkOuts, setCheckOuts] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Giữ full danh sách hoạt động
  const [allActivities, setAllActivities] = useState<any[]>([]);

  // Vẫn dùng để render phần đang thấy
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  // Số lượng hiển thị cho từng loại hành động
  const [visibleByType, setVisibleByType] = useState<{[key: string]: number}>({
    "Tạo đặt phòng": 2,
    "Cập nhật đặt phòng": 2,
    "Hủy đặt phòng": 2,
    "Cập nhật trạng thái phòng": 2,
  });
 
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const [roomsRes, bookingsRes, activityLogsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/rooms`),
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/rooms_bookings/current`),
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/activity-logs`),
        ]);

        if (!roomsRes.ok || !bookingsRes.ok || !activityLogsRes.ok) {
          throw new Error(`HTTP error: ${roomsRes.status}, ${bookingsRes.status}, ${activityLogsRes.status}`);
        }

        // Parse JSON
        const [roomsData, bookingsData, activityLogsData] = await Promise.all([
          roomsRes.json(),
          bookingsRes.json(),
          activityLogsRes.json(),
        ]);

        const pad = (n: number) => String(n).padStart(2, "0");
        const today = new Date();
        const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD

        const toYMD = (v: any) => {
          if (!v) return null;
          if (typeof v === "string") return v.slice(0, 10);
          if (v instanceof Date) {
            return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
          }
          return null;
        };

        // Chuyển đổi về Date và ép về giờ Việt Nam (UTC+7)
        const toDateTime = (v: any) => {
          if (!v) return null;
          if (v instanceof Date) return v;
          if (typeof v === "string") {
            // Nếu có Z hoặc +00:00 thì là UTC, còn lại là local hoặc không timezone
            let d = v.includes("T") ? new Date(v) : new Date(v.replace(" ", "T"));
            // Nếu không có timezone, ép cộng thêm 7 tiếng (giả sử backend trả về giờ UTC)
            if (!/([zZ]|[+-]\d{2}:?\d{2})$/.test(v)) {
              d = new Date(d.getTime() + 7 * 60 * 60 * 1000);
            }
            return d;
          }
          return null;
        };

        // Hoạt động gần đây
        const activitiesFull = (activityLogsData as any[])
          .filter((log) => log.log_id)
          .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime())
          .map((log) => {
            const timeValue = toDateTime(log.performed_at);
            const text = (log?.description ?? "").trim() || "—";
            const user = log.user_name
              ? log.booking_source
                ? `${log.booking_source} + ${log.user_name} `
                : log.user_name
              : log.performed_by || "System";
            return {
              time: timeValue
                ? timeValue.toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A",
              text,
              description: text,
              user,
              action_type: log.action_type, // Thêm dòng này để lọc đúng loại hành động
            };
          });

        setAllActivities(activitiesFull);

        // CHUẨN HÓA DỮ LIỆU BOOKING
        const data = (bookingsData as any[]).map((b) => ({
          ...b,
          check_in_str: toYMD(b.check_in),
          check_out_str: toYMD(b.check_out),
        }));

        setBookings(data);

        // Hôm nay check-in
        setCheckIns(
          data.filter(
            (b) =>
              b.check_in_str === todayStr &&
              ["Confirmed", "Checked-in"].includes(b.booking_status)
          )
        );

        // Hôm nay check-out
        setCheckOuts(
          data.filter(
            (b) =>
              b.check_out_str === todayStr &&
              ["Confirmed", "Checked-in", "Checked-out"].includes(b.booking_status)
          )
        );

        // MERGE BOOKINGS -> ROOM STATUS
        const mergedRooms = roomsData.map((room: any) => {
          const activeBooking = data.find((b: any) => (
            b.room_id === room.room_id &&
            ["Confirmed", "Checked-in"].includes(b.booking_status) &&
            b.check_in_str && b.check_out_str &&
            b.check_in_str <= todayStr && todayStr <= b.check_out_str // so sánh theo ngày, bao gồm ngày checkout
          ));

          let status: Room["status"] = room.status;
          if (activeBooking) status = "Occupied";

          return { ...room, status };
        });

        setRooms(mergedRooms);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  // Khi visibleCount hoặc allActivities thay đổi
  useEffect(() => {
    setRecentActivities(allActivities);
  }, [allActivities]);

  // group theo floor
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort();


  return (
    <MainLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Tiêu đề cho 4 card hoạt động */}
        <div className="mb-2">
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#c92974] to-[#6dabe8] bg-clip-text text-transparent tracking-wide flex items-center gap-2">
            Hoạt động gần đây
          </h3>
        </div>
        {/* Recent Activities - 4 card chia theo loại hành động */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Tạo đặt phòng",
            "Cập nhật đặt phòng",
            "Hủy đặt phòng",
            "Cập nhật trạng thái phòng",
          ].map((type) => {
            const filtered = recentActivities.filter(a => a.action_type === type);
            return (
              <Card key={type} className="shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-center font-bold text-[#750338]">{type}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filtered.length > 0 ? (
                    filtered.slice(0, visibleByType[type] || 5).map((item, i) => {
                      // Nếu là card cập nhật trạng thái phòng, highlight status
                                    if (type === "Cập nhật trạng thái phòng") {
                                      // Chuyển đổi trạng thái tiếng Anh sang tiếng Việt trong mô tả
                                      const statusEnToVi: Record<string, string> = {
                                        "Available": "Còn trống",
                                        "Occupied": "Đang ở",
                                        "Cleaning": "Đang dọn",
                                        "Maintenance": "Bảo trì"
                                      };
                                      let desc = item.description || item.text;
                                      desc = desc.replace(/(Available|Occupied|Cleaning|Maintenance)/g, (m) => statusEnToVi[m] || m);
                                      // Tìm màu cho trạng thái mới
                                      const statusMatch = /(Còn trống|Đang ở|Đang dọn|Bảo trì)/.exec(desc);
                                      let statusColor = "#999";
                                      if (statusMatch) {
                                        switch (statusMatch[1]) {
                                          case "Còn trống": statusColor = "#6dabe8"; break;
                                          case "Đang ở": statusColor = "#d19ab4"; break;
                                          case "Đang dọn": statusColor = "#9167e1"; break;
                                          case "Bảo trì": statusColor = "#DA3748"; break;
                                          default: statusColor = "#999";
                                        }
                                      }
                                      return (
                                        <div key={i} className="rounded-lg border bg-white p-3 flex items-center gap-2">
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: statusColor }}
                                          ></div>
                                          <div className="flex-1">
                                            <div className="font-medium">{desc}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{item.time}</div>
                                          </div>
                                        </div>
                                      );
                                    }
                      // Các card khác giữ nguyên
                      return (
                        <div key={i} className="rounded-lg border bg-white p-3">
                          <div className="font-medium">{item.description || item.text}</div>
                          <div className="text-xs text-muted-foreground mt-1">{item.time}</div>
                        </div>
                      );
                    })
                  ) : <div className="text-s text-muted-foreground text-center">Không có hoạt động gần đây</div>}
                  {filtered.length > (visibleByType[type] || 2) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full bg-[#c92974] text-white hover:bg-white hover:text-[#da4c8e]"
                      onClick={() => setVisibleByType(v => ({ ...v, [type]: v[type] + 2 }))}
                    >
                      Xem thêm hoạt động
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today's Check-ins & Check-outs */}
        <div className="grid gap-6 md:grid-cols-2 ">
          {/* Check-ins */}
          <Card className="shadow-lg border-l-4 border-l-[#da4c8e]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#da4c8e]"></div>
                Check-ins hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkIns.length > 0 ? (
                checkIns.map((guest, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/room-management?room_id=${guest.room_id}`)}
                    className="flex items-center justify-between p-3 bg-[#ffeff6] hover:bg-[#f1c9db] hover:text-[#e31676] rounded-lg border cursor-pointer hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#e08ab2] flex items-center justify-center">
                        <Users className="h-5 w-5 text-white " />
                      </div>
                      <div>
                        <p className="font-medium">{guest.guest_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Phòng {guest.room_number}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-sm rounded-full font-medium bg-[#da4c8e] text-white">
                      {guest.booking_status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Không có check-in hôm nay</p>
              )}
            </CardContent>
          </Card>

          {/* Check-outs */}
          <Card className="shadow-xl border-l-4 border-l-[#529ae3]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#6dabe8]"></div>
                Check-outs hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkOuts.length > 0 ? (
                checkOuts.map((guest, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/room-management?room_id=${guest.room_id}`)}
                    className="flex items-center justify-between p-3 bg-[#e9f2fc] hover:bg-[#cbe5ff] hover:text-[#2a8ef2] rounded-lg border cursor-pointer hover:scale-105 transition-transform duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#6dabe8] flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{guest.guest_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Phòng {guest.room_number}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-sm rounded-full font-medium bg-[#2a8ef2] text-white">
                      {guest.booking_status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Không có check-outs hôm nay</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Corridor View */}
        <Card className="shadow-xl">
          <CardHeader className="text-[#af3c6a]">
            <CardTitle>Sơ đồ trạng thái phòng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5">
              {floors.map((floor) => {
                const floorRooms = rooms.filter((r) => r.floor === floor);
                return (
                  <div key={floor} className="flex flex-col items-center">
                    <h2 className="text-base font-semibold mb-4">Tầng {floor}</h2>
                    <div className="flex flex-col items-center gap-4">
                      {floorRooms.map((room) => (
                        <div
                          key={room.room_id}
                          onClick={() => navigate(`/room-management?room_id=${room.room_id}`)}
                          className="cursor-pointer hover:scale-125 transition-transform duration-200"
                        >
                          <RoomBox room={room} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
};

export default Dashboard;
