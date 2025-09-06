import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Search } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";

// ===== Kiểu dữ liệu gốc từ API (giữ nguyên tiếng Anh để không vướng lỗi union type) =====
type Room = {
  room_id: number;
  room_number: string;
  room_type: "A" | "B" | "C";
  floor: number;
  price: number;
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
  created_at: string;
  updated_at: string;
};

type Booking = {
  booking_id: number;
  guest_name: string;
  guest_id: string | null;
  phone_number: string | null;
  room_id: number;
  check_in: string;   // "YYYY-MM-DD"
  check_out: string;  // "YYYY-MM-DD"
  booking_source: "Facebook" | "Booking.com" | "Agoda" | "Airbnb" | "Walk-in" | "Zalo";
  booking_status: "Confirmed" | "Cancelled" | "Checked-in" | "Checked-out";
  amount_received: number | null;
  booking_date: string;
  created_at: string;
  updated_at: string;
};

// ===== Bảng dịch chỉ dùng cho HIỂN THỊ =====
const bookingSourceMap: Record<Booking["booking_source"], string> = {
  Facebook: "Facebook",
  "Booking.com": "Booking.com",
  Agoda: "Agoda",
  Airbnb: "Airbnb",
  "Walk-in": "Khách vãng lai",
  Zalo: "Zalo",
};

// Tháng hiển thị trên FE bằng tiếng Việt
const MONTHS = [
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"
] as const;

const toLocalDate = (s: string) => {
  // Chuyển "YYYY-MM-DD" -> Date local để tính ngày/đêm chính xác (an toàn với chuỗi có cả thời gian)
  const parts = s?.split(/[-T:\s]/).map(Number) ?? [];
  const y = parts[0] ?? new Date().getFullYear();
  const m = (parts[1] ?? 1) - 1;
  const d = parts[2] ?? 1;
  return new Date(y, m, d);
};

const startOfMonth = (y: number, mIndex: number) => new Date(y, mIndex, 1);
const endOfMonthExclusive = (y: number, mIndex: number) => new Date(y, mIndex + 1, 1);
const daysBetween = (a: Date, b: Date) => Math.max(0, Math.round((b.getTime() - a.getTime()) / (24 * 3600 * 1000)));
const clampRangeOverlapNights = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => {
  // Khoảng [aStart, aEnd) & [bStart, bEnd) theo số đêm
  const s = new Date(Math.max(aStart.getTime(), bStart.getTime()));
  const e = new Date(Math.min(aEnd.getTime(), bEnd.getTime()));
  return Math.max(0, daysBetween(s, e));
};

const Analytics = () => {
  const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [rRes, bRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/rooms`),
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/bookings/all_with_cancelled`),
        ]);

        const [rData, bData] = await Promise.all([rRes.json(), bRes.json()]);
        setRooms(Array.isArray(rData) ? rData : []);
        setBookings(Array.isArray(bData) ? bData : []);
        setFilteredBookings(Array.isArray(bData) ? bData : []); // gán ban đầu

      } catch (e) {
        console.error(e);
        setRooms([]);
        setBookings([]);
        setFilteredBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  useEffect(() => {
    if (!keyword) {
      setFilteredBookings(bookings);
      return;
    }

    const search = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/search?keyword=${encodeURIComponent(keyword)}`
        );
        if (!res.ok) {
          setFilteredBookings([]);
          return;
        }
        const data = await res.json();
        setFilteredBookings(Array.isArray(data) ? data : []);
      } catch {
        setFilteredBookings([]);
      }
    };

    const timeoutId = setTimeout(search, 300); // debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [keyword, bookings]);




  // Lọc khách theo tháng
  useEffect(() => {
    if (!bookings.length || keyword.trim()) return;
    // không lọc theo tháng nếu đang tìm kiếm

    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const filtered = bookings.filter((b) => {
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);
      return checkOut >= startOfMonth && checkIn <= endOfMonth;
    });

    setFilteredBookings(filtered);
  }, [selectedMonth, bookings, keyword]);
  // chạy lại khi đổi tháng


  // ---- Chuẩn hoá & giả định tính doanh thu ----
  // - amount_received null => fallback: đơn giá phòng * số đêm (theo rooms.price).
  // - Phân bổ doanh thu theo số đêm (prorate) để ra daily + monthly chính xác.
  const validBookings = useMemo(() => {
    const roomMap = new Map(rooms.map(r => [r.room_id, r]));
    return bookings
      .filter(b => b.booking_status !== "Cancelled")
      .map(b => {
        const r = roomMap.get(b.room_id);
        const nights = Math.max(0, daysBetween(toLocalDate(b.check_in), toLocalDate(b.check_out)));
        const fallback = r ? r.price * nights : 0;
        const amount = (b.amount_received ?? fallback) || 0;
        return { ...b, _nights: nights, _amount: amount, _room: r || null } as Booking & {
          _nights: number; _amount: number; _room: Room | null;
        };
      })
      .filter(b => b._nights > 0);
  }, [bookings, rooms]);

  // ---- Khoảng thời gian hiện tại ----
  const year = selectedMonth.getFullYear();
  const monthIndex = selectedMonth.getMonth();

  // ---- Doanh thu 12 tháng ----
  const revenueData = useMemo(() => {
    const base = Array.from({ length: 12 }, (_, i) => ({
      month: MONTHS[i],
      revenue: 0,
      roomRevenue: 0,
      fbRevenue: 0,
      services: 0,
    }));
    validBookings.forEach(b => {
      for (let m = 0; m < 12; m++) {
        const mStart = startOfMonth(selectedMonth.getFullYear(), m);
        const mEnd = endOfMonthExclusive(selectedMonth.getFullYear(), m);
        const nightsInMonth = clampRangeOverlapNights(
          toLocalDate(b.check_in),
          toLocalDate(b.check_out),
          mStart,
          mEnd
        );
        if (nightsInMonth > 0 && b._nights > 0) {
          const portion = (b._amount / b._nights) * nightsInMonth;
          base[m].roomRevenue += portion;
          base[m].revenue += portion;
        }
      }
    });
    return base.map(x => ({
      ...x,
      revenue: Math.round(x.revenue),
      roomRevenue: Math.round(x.roomRevenue),
      fbRevenue: Math.round(x.fbRevenue),
      services: Math.round(x.services),
    }));
  }, [validBookings, year]);

  // ---- Công suất 12 tháng ----
  const occupancyData = useMemo(() => {
    const totalRooms = rooms.length || 1;
    return Array.from({ length: 12 }, (_, m) => {
      const mStart = startOfMonth(selectedMonth.getFullYear(), m);
      const mEnd = endOfMonthExclusive(selectedMonth.getFullYear(), m);
      const dim = daysBetween(mStart, mEnd);
      let occupiedNights = 0;

      validBookings.forEach(b => {
        occupiedNights += clampRangeOverlapNights(
          toLocalDate(b.check_in),
          toLocalDate(b.check_out),
          mStart,
          mEnd
        );
      });

      const denominator = totalRooms * dim || 1;
      const occupancy = (occupiedNights / denominator) * 100;
      return { month: MONTHS[m], occupancy: Math.round(occupancy * 10) / 10 };
    });
  }, [validBookings, rooms, selectedMonth.getFullYear()]);

  // ---- Doanh thu theo loại phòng (tháng hiện tại) ----
  const roomTypeData = useMemo(() => {
    const typeSum = { A: 0, B: 0, C: 0 } as Record<"A" | "B" | "C", number>;
    const mStart = startOfMonth(selectedMonth.getFullYear(), monthIndex);
    const mEnd = endOfMonthExclusive(selectedMonth.getFullYear(), monthIndex);

    validBookings.forEach(b => {
      const r = (b as any)._room as Room | null;
      if (!r) return;
      const nightsInMonth = clampRangeOverlapNights(
        toLocalDate(b.check_in),
        toLocalDate(b.check_out),
        mStart, mEnd
      );
      if (nightsInMonth === 0) return;
      const portion = ((b as any)._amount * nightsInMonth) / (b as any)._nights;
      typeSum[r.room_type] += portion;
    });

    const items = [
      { name: "A", value: Math.round(typeSum.A) },
      { name: "B", value: Math.round(typeSum.B) },
      { name: "C", value: Math.round(typeSum.C) },
    ];
    const colorMap: Record<string, string> = { A: "#bc627c", B: "#fec2b8", C: "#a0c9c3" };
    return items.map(x => ({ ...x, color: colorMap[x.name] }));
  }, [validBookings, selectedMonth.getFullYear(), monthIndex]);

  // ---- Tỷ trọng kênh đặt (tháng hiện tại) ----
  const channelData = useMemo(() => {
    const mStart = startOfMonth(selectedMonth.getFullYear(), monthIndex);
    const mEnd = endOfMonthExclusive(selectedMonth.getFullYear(), monthIndex);
    const counts = new Map<string, number>();

    validBookings.forEach(b => {
      const nightsInMonth = clampRangeOverlapNights(
        toLocalDate(b.check_in),
        toLocalDate(b.check_out),
        mStart, mEnd
      );
      if (nightsInMonth === 0) return;
      counts.set(b.booking_source, (counts.get(b.booking_source) || 0) + nightsInMonth);
    });

    const total = Array.from(counts.values()).reduce((a, c) => a + c, 0) || 1;
    const colorMap: Record<string, string> = {
      "Walk-in": "#8B5CF6",
      "Booking.com": "#3B82F6",
      "Airbnb": "#ff5a5f",
      "Agoda": "#F59E0B",
      "Facebook": "#10B981",
      "Zalo": "#06B6D4",
    };

    return Array.from(counts.entries()).map(([rawName, v]) => ({
      name: bookingSourceMap[rawName as Booking["booking_source"]] || rawName,
      value: Math.round((v / total) * 100), // %
      color: colorMap[rawName] || "#999999",
    }));
  }, [validBookings, selectedMonth.getFullYear(), monthIndex]);

  // ---- Chỉ số tổng quan tháng hiện tại ----
  const topStats = useMemo(() => {
    const mStart = startOfMonth(selectedMonth.getFullYear(), monthIndex);
    const mEnd = endOfMonthExclusive(selectedMonth.getFullYear(), monthIndex);
    const totalRooms = rooms.length || 1;
    const dim = daysBetween(mStart, mEnd);

    let revenue = 0;
    let occNights = 0;

    validBookings.forEach(b => {
      const nightsInMonth = clampRangeOverlapNights(
        toLocalDate(b.check_in),
        toLocalDate(b.check_out),
        mStart, mEnd
      );
      if (nightsInMonth === 0) return;
      occNights += nightsInMonth;
      const portion = ((b as any)._amount * nightsInMonth) / (b as any)._nights;
      revenue += portion;
    });

    const occupancyRate = (occNights / (totalRooms * dim || 1)) * 100;
    const adr = occNights > 0 ? revenue / occNights : 0;

    // So sánh % với tháng trước đó
    const prevMonthIndex = (monthIndex - 1 + 12) % 12;
    const prevMonthStart = startOfMonth(selectedMonth.getFullYear(), prevMonthIndex);
    const prevMonthEnd = endOfMonthExclusive(selectedMonth.getFullYear(), prevMonthIndex);

    let prevRevenue = 0;
    let prevOccNights = 0;

    validBookings.forEach(b => {
      const nightsInPrev = clampRangeOverlapNights(
        toLocalDate(b.check_in),
        toLocalDate(b.check_out),
        prevMonthStart,
        prevMonthEnd
      );
      if (nightsInPrev > 0 && b._nights > 0) {
        const portion = (b._amount * nightsInPrev) / b._nights;
        prevRevenue += portion;
        prevOccNights += nightsInPrev;
      }
    });

    const prevDim = daysBetween(prevMonthStart, prevMonthEnd);
    const prevOccupancyRate =
      prevOccNights > 0 ? (prevOccNights / (totalRooms * prevDim)) * 100 : 0;
    const prevAdr = prevOccNights > 0 ? prevRevenue / prevOccNights : 0;

    // Tính % thay đổi
    const revenueChange =
      prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null;
    const occupancyChange =
      prevOccupancyRate > 0
        ? ((occupancyRate - prevOccupancyRate) / prevOccupancyRate) * 100
        : null;
    const adrChange =
      prevAdr > 0 ? ((adr - prevAdr) / prevAdr) * 100 : null;

    return {
      totalRevenue: Math.round(revenue),
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      adr: Math.round(adr),
      revenueChange,
      occupancyChange,
      adrChange,
    };
  }, [validBookings, rooms, selectedMonth.getFullYear(), monthIndex]);

  // Nhãn tooltip của ChartContainer -> TV
  const chartConfig = {
    revenue: { label: "Doanh thu", color: "#3B82F6" },
    roomRevenue: { label: "Doanh thu phòng", color: "#3B82F6" },
    // fbRevenue: { label: "F&B", color: "#10B981" },
    // services: { label: "Dịch vụ", color: "#F59E0B" },
    occupancy: { label: "Công suất %", color: "#8B5CF6" },
  } as const;

  if (loading) {
    return (
      <MainLayout userRole={userRole || undefined}>
        <div className="p-6">Đang tải dữ liệu…</div>
      </MainLayout>
    );
  }

  // Hàm export tất cả sheet vào 1 file Excel
  const exportAll = (
    revenueData: any[],
    occupancyData: any[],
    roomTypeData: any[],
    channelData: any[],
    validBookings: any[],
    selectedMonth: Date
  ) => {
    const year = selectedMonth.getFullYear();
    const monthIndex = selectedMonth.getMonth();

    // 1. Tổng quan KPI (Revenue, Occupancy, ADR, RevPAR theo tháng)
    const kpiSheet = XLSX.utils.json_to_sheet(
      revenueData.map((r, i) => ({
        Năm: year,
        Tháng: r.month,
        DoanhThu: r.revenue,
        DoanhThuPhòng: r.roomRevenue,
        Occupancy: occupancyData[i]?.occupancy ?? 0,
        ADR: occupancyData[i]
          ? r.roomRevenue / Math.max(1, occupancyData[i].occupancy)
          : 0,
        // Có thể bổ sung RevPAR nếu bạn có tính
      }))
    );

    // 2. Doanh thu theo loại phòng (tháng được chọn)
    const roomTypeSheet = XLSX.utils.json_to_sheet(
      roomTypeData.map(r => ({
        Năm: year,
        Tháng: monthIndex + 1,
        LoạiPhòng: r.name,
        DoanhThu: r.value,
      }))
    );

    // 3. Doanh thu theo kênh đặt phòng (tháng được chọn)
    const channelSheet = XLSX.utils.json_to_sheet(
      channelData.map(c => ({
        Năm: year,
        Tháng: monthIndex + 1,
        Kênh: c.name,
        TỷTrọng: c.value + "%",
      }))
    );

    // 4. Booking chi tiết (lọc theo tháng được chọn)
    const mStart = new Date(year, monthIndex, 1);
    const mEnd = new Date(year, monthIndex + 1, 1);

    const bookingsSheet = XLSX.utils.json_to_sheet(
      validBookings
        .filter(b => {
          const ci = new Date(b.check_in);
          return ci >= mStart && ci < mEnd;
        })
        .map(b => ({
          BookingID: b.booking_id,
          Khách: b.guest_name,
          Phòng: b._room?.room_number,
          LoạiPhòng: b._room?.room_type,
          CheckIn: b.check_in,
          CheckOut: b.check_out,
          SốĐêm: b._nights,
          SốTiền: b._amount,
          Kênh: b.booking_source,
        }))
    );

    // Gom vào workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, kpiSheet, "KPI Tổng quan");
    XLSX.utils.book_append_sheet(wb, roomTypeSheet, "Theo loại phòng");
    XLSX.utils.book_append_sheet(wb, channelSheet, "Theo kênh");
    XLSX.utils.book_append_sheet(wb, bookingsSheet, "Booking chi tiết");

    // Xuất file
    XLSX.writeFile(wb, `Analytics_${year}_Thang${monthIndex + 1}.xlsx`);
  };

  return (
    <MainLayout userRole={userRole || undefined}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#af3c6a]">Bảng điều khiển phân tích</h1>
            <p className="text-sm text-muted-foreground mt-1 ">
              Theo dõi các chỉ số vận hành khách sạn
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div>
              <label className="mr-2 font-medium text-[#af3c6a]">Năm:</label>
              <select
                className="border px-2 py-1 rounded-3xl "
                value={selectedMonth.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(selectedMonth);
                  newDate.setFullYear(Number(e.target.value));
                  setSelectedMonth(newDate);
                }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const year = new Date().getFullYear() -1 + i;
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
              <label className="mr-2 font-medium text-[#af3c6a]">Tháng:</label>
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
        </div>

        <Button
          variant="outline"
          className="text-white bg-blue-500 hover:text-blue-500 hover:bg-white hover:border-blue-500"
          onClick={() => exportAll(
            revenueData,
            occupancyData,
            roomTypeData,
            channelData,
            validBookings,
            selectedMonth
          )}
        >
          Xuất File tháng này
        </Button>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#af3c6a]">Tổng doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topStats.totalRevenue.toLocaleString("vn-VI", { style: "currency", currency: "VND" })}
              </div>
              {topStats.revenueChange !== null && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {topStats.revenueChange >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      topStats.revenueChange >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {Math.abs(topStats.revenueChange).toFixed(1)}%
                  </span>
                  <span className="ml-1">so với tháng trước</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#af3c6a]">
                Tỷ lệ lấp đầy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topStats.occupancyRate}%</div>
              {topStats.occupancyChange !== null && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {topStats.occupancyChange >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      topStats.occupancyChange >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {Math.abs(topStats.occupancyChange).toFixed(1)}%
                  </span>
                  <span className="ml-1">so với tháng trước</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#af3c6a]">
                Giá bình quân/ngày (ADR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topStats.adr.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </div>
              {topStats.adrChange !== null && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {topStats.adrChange >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      topStats.adrChange >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {Math.abs(topStats.adrChange).toFixed(1)}%
                  </span>
                  <span className="ml-1">so với tháng trước</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger
              value="revenue"
              className="data-[state=active]:bg-[#4b9ae9] data-[state=active]:text-white hover:bg-[#4b9ae9] hover:text-white rounded-lg px-4 py-2 transition"
            >
              Doanh thu
            </TabsTrigger>

            <TabsTrigger
              value="occupancy"
              className="data-[state=active]:bg-[#4b9ae9] data-[state=active]:text-white hover:bg-[#4b9ae9] hover:text-white rounded-lg px-4 py-2 transition"
            >
              Công suất
            </TabsTrigger>

            <TabsTrigger
              value="channels"
              className="data-[state=active]:bg-[#4b9ae9] data-[state=active]:text-white hover:bg-[#4b9ae9] hover:text-white rounded-lg px-4 py-2 transition"
            >
              Kênh đặt phòng
            </TabsTrigger>

            <TabsTrigger
              value="room-type"
              className="data-[state=active]:bg-[#4b9ae9] data-[state=active]:text-white hover:bg-[#4b9ae9] hover:text-white rounded-lg px-4 py-2 transition"
            >
              Theo loại phòng
            </TabsTrigger>

            <TabsTrigger
              value="guest"
              className="data-[state=active]:bg-[#4b9ae9] data-[state=active]:text-white hover:bg-[#4b9ae9] hover:text-white rounded-lg px-4 py-2 transition"
            >
              Tổng hợp KH
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Tổng quan doanh thu</CardTitle>
                <CardDescription>Doanh thu phòng theo tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-96">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      width={100} // tăng khoảng trống bên trái
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("vi-VN").format(value)
                      }
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="roomRevenue" stackId="a" fill="#ca3e7f" name="Doanh thu phòng" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="occupancy" className="space-y-4">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Tổng quan công suất</CardTitle>
                <CardDescription>Công suất phòng theo tháng</CardDescription>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Kênh đặt phòng</CardTitle>
                <CardDescription>Tỷ trọng (%) theo kênh trong tháng</CardDescription>
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
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                        <p className="text-lg font-medium mt-1">{item.value}%</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="room-type" className="space-y-4">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Doanh thu theo loại phòng</CardTitle>
                <CardDescription>Tỷ trọng (%) theo loại phòng trong tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-96">
                  <PieChart>
                    <Pie
                      data={roomTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {roomTypeData.map((item, i) => (
                    <Card key={i} className="bg-muted/50">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                        <p className="text-lg font-medium mt-1">{new Intl.NumberFormat("vi-VN").format(item.value)} VND</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phần Danh sách KH */}
          <TabsContent value="guest" className="">
            <Card className="shadow-lg border-l-4 border-[#da4c8e]">
              <CardHeader className="pb-4">
                <CardTitle>Danh sách khách hàng theo tháng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <form onSubmit={(e) => e.preventDefault()}>
                    <Input
                      type="search"
                      placeholder="Tìm kiếm khách hàng..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="w-full pl-8"
                    />

                  </form>

                </div>
                <ResponsiveContainer width="80%" height="100%">
                  <div>
                    <table className="table-fixed w-full border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-2 w-12">STT</th>
                          <th className="border px-2 py-2 w-16">Phòng</th>
                          <th className="border px-3 py-2 w-40">Tên KH</th>
                          <th className="border px-3 py-2 w-40">SĐT</th>
                          <th className="border px-3 py-2 w-32">Ngày check-in</th>
                          <th className="border px-3 py-2 w-32">Ngày check-out</th>
                          <th className="border px-3 py-2 w-32">Nguồn đặt</th>
                          <th className="border px-3 py-2 w-32">Trạng thái booking</th>
                          <th className="border px-3 py-2 w-28">Ngày đặt</th>
                          <th className="border px-3 py-2 w-28">Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={10} className="text-center py-4">Đang tải...</td>
                          </tr>
                        ) : filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="text-center py-4">Không có dữ liệu</td>
                          </tr>
                        ) : (
                          filteredBookings
                            .sort((a, b) => a.room_id - b.room_id) // sắp xếp theo ngày check-in từ nhỏ đến lớn
                            .map((b, index) => {
                              const room = rooms.find(r => r.room_id === b.room_id); // tìm room tương ứng
                              return (
                                <tr key={b.booking_id} className="text-center hover:bg-blue-100">
                                  <td className="border px-3 py-2">{index + 1}</td>
                                  <td className="border px-3 py-2">{room?.room_number ?? "-"}</td>
                                  <td className="border px-3 py-2">{b.guest_name}</td>
                                  <td className="border px-3 py-2">{b.phone_number ?? "-"}</td>
                                  <td className="border px-3 py-2">
                                    {new Date(b.check_in).toLocaleDateString("vi-VN")}
                                  </td>
                                  <td className="border px-3 py-2">
                                    {new Date(b.check_out).toLocaleDateString("vi-VN")}
                                  </td>
                                  <td className="border px-3 py-2">{b.booking_source ?? "-"}</td>
                                  <td className="border px-3 py-2">{b.booking_status ?? "-"}</td>
                                  <td className="border px-3 py-2">
                                    {new Date(b.booking_date).toLocaleDateString("vi-VN")}
                                  </td>
                                  <td className="border px-3 py-2">
                                    {b.amount_received != null
                                      ? Number(b.amount_received).toLocaleString("vi-VN")
                                      : "-"}
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;