import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Nội dung tiếng Việt
const NOI_QUY_VN: string[] = [
  "Giờ nhận phòng (Check-in): 14:00 — Giờ trả phòng (Check-out): 12:00.",
  "Vui lòng xuất trình giấy tờ tùy thân hợp lệ khi nhận phòng.",
  "Cơ sở lưu trú chỉ chịu trách nhiệm với những tài sản/tiền gửi tại quầy Lễ tân.",
  "Để đảm bảo an toàn cho mọi người, bạn không được mang súng đạn, chất cháy nổ, chất độc hại, các chất gây nghiện và mọi hình thức cờ bạc, sử dụng ma túy, mại dâm.",
  "Không thay đổi, di chuyển đồ đạc trong phòng. Nếu làm mất hay hư hỏng do chủ quan bạn phải bồi thường 100% giá trị.",
  "Không đưa thêm người vào phòng khi chưa đăng ký trước với Lễ tân.",
  "Để an toàn và tiết kiệm điện, bạn hãy rút thẻ chìa khóa ra khỏi ổ điện và gửi tại quầy lễ tân khi ra khỏi phòng. Khi ra vào, nhớ đóng và khóa cổng cẩn thận.",
  "Hãy giữ vệ sinh, bỏ rác đúng nơi quy định và thực hiện đúng quy tắc phòng chống cháy nổ; hãy cùng chăm sóc cây xanh trong nhà.",
  "Nếu bạn chỉ lưu trú theo ngày, bạn vui lòng trả phòng, chìa khóa và làm thủ tục trước 14h00. Trong trường hợp cần thiết, Lễ tân sẽ giúp đỡ bạn.",
  "Nếu cần dịch vụ ăn sáng hoặc phương tiện di chuyển. Vui lòng liên hệ với Lễ tân hoặc viết giấy và cho vào hòm thư tại bàn Lễ tân trước 19 giờ hàng ngày.",
  "Không hút thuốc trong phòng. Khu vực hút thuốc ở ngoài trời.",
  "Giờ yên tĩnh: 22:00 – 06:00. Hạn chế gây ồn ảnh hưởng phòng khác.",
  "Không mang thú cưng (trừ khi đã có thỏa thuận trước).",
];

const GIA_PHONG_VN = [
  { loaiPhong: "A", ngayUSD: 26, ngayVND: 680000, thangUSD: 295, thangVND: 7700000 },
  { loaiPhong: "3B", ngayUSD: 24, ngayVND: 630000, thangUSD: 283, thangVND: 7400000 },
  { loaiPhong: "B,C", ngayUSD: 18, ngayVND: 470000, thangUSD: 210, thangVND: 5500000 },
  { loaiPhong: "6AB", ngayUSD: 36, ngayVND: 950000, thangUSD: 352, thangVND: 9200000 },
  { loaiPhong: "6ABC", ngayUSD: 52, ngayVND: 1370000, thangUSD: 545, thangVND: 14300000 },
  { loaiPhong: "Tầng 7", ngayUSD: 28, ngayVND: 740000, thangUSD: 335, thangVND: 8800000 },
];

const DICH_VU_VN = [
  { loaiDichVu: "Sấy khô quần áo", usd: "$1/1kg", vnd: "20.000đ/kg" },
  { loaiDichVu: "Thuê xe đạp", usd: "$1,5/1 ngày", vnd: "40.000đ/ngày" },
  { loaiDichVu: "Ăn sáng", usd: "$1,5/suất", vnd: "40.000đ/suất" },
  { loaiDichVu: "Dọn phòng", usd: "$4/lần", vnd: "100.000đ/lần" },

  {
    loaiDichVu: "Phụ thu thêm người",
    options: [
      { doiTuong: "Trẻ em (6–13 tuổi)", usd: "$4/trẻ", vnd: "100.000đ/trẻ" },
      { doiTuong: "Trẻ em (>13 tuổi)", usd: "$6/trẻ", vnd: "150.000đ/trẻ" },
      { doiTuong: "Người lớn", usd: "$8/người", vnd: "200.000đ/người" },
    ]
  },

  {
    loaiDichVu: "Phụ thu quá giờ",
    options: [
      { dieuKien: "Trước 18h", usd: "50%/phòng", vnd: "50% giá phòng" },
      { dieuKien: "Sau 18h", usd: "100%/phòng", vnd: "100% giá phòng" },
    ]
  },
];

const UU_DAI_VN = [
  { tieuDe: "Khi đặt trước 1 tháng", moTa: "Giảm 5% trên giá phòng" },
  { tieuDe: "Khách hàng đặt từ lần thứ 2", moTa: "Giảm 5% trên giá phòng" },
  { tieuDe: "Ở từ 7 ngày tới dưới 1 tháng", moTa: "Giảm 5% trên giá phòng" },
];

// Nội dung tiếng Anh
const NOI_QUY_EN: string[] = [
  "Check-in time: 14:00 — Check-out time: 12:00.",
  "Please present your passport or identity card when checking in at the Reception table.",
  "The hotel is only responsible for the money or items deposited at the Reception table.",
  "To ensure safety, it is strictly forbidden to bring weapons, explosives, inflammables, noxious substances, narcotics (drugs) into the hotel. All forms of gambling, drug usage, and prostitution are prohibited in the hotel.",
  "Please, don't change or move the furniture and equipment in the room or between rooms. Put things in the right place. Guests are responsible to pay 100% of the value of furniture, equipment for any loss or damage.",
  "Please don't bring extra guests in the room without informing the Receptionist.",
  "For safety and energy saving, please remove the key card from the power slot and return it to the front desk when leaving the room. Remember to close and lock the gate carefully when entering or leaving.",
  "Please, keep the hygiene and comply with fire safety regulations and instructions; Take care of the plants in your room/balconies.",
  "If you stay for a short-term only, please check-out before 2 p.m daily. Please return the key when checking-out and contact the receptionist for help.",
  "If you need breakfast or transportation, please contact the Front Desk or write a note and put it in the mailbox at the Front Desk before 7pm every day.",
  "No smoking inside the room. Smoking area is outside.",
  "Quiet hours: 22:00 – 06:00. Please respect other guests.",
  "No pets allowed unless pre-arranged.",
];

const GIA_PHONG_EN = [
  { loaiPhong: "A", ngayUSD: 26, ngayVND: 680000, thangUSD: 295, thangVND: 7700000 },
  { loaiPhong: "3B", ngayUSD: 24, ngayVND: 630000, thangUSD: 283, thangVND: 7400000 },
  { loaiPhong: "B,C", ngayUSD: 18, ngayVND: 470000, thangUSD: 210, thangVND: 5500000 },
  { loaiPhong: "6AB", ngayUSD: 36, ngayVND: 950000, thangUSD: 352, thangVND: 9200000 },
  { loaiPhong: "6ABC", ngayUSD: 52, ngayVND: 1370000, thangUSD: 545, thangVND: 14300000 },
  { loaiPhong: "Tầng 7", ngayUSD: 28, ngayVND: 740000, thangUSD: 335, thangVND: 8800000 },
];

const DICH_VU_EN = [
  { loaiDichVu: "Laundry", usd: "$1/1kg", vnd: "20.000đ/kg" },
  { loaiDichVu: "Bicycle rental", usd: "$1,5/1 day", vnd: "40.000đ/day" },
  { loaiDichVu: "Breakfast", usd: "$1,5/person", vnd: "40.000đ/person" },
  { loaiDichVu: "Cleaning room", usd: "$4/times", vnd: "100.000đ/times" },

  {
    loaiDichVu: "Extra guest(s)",
    options: [
      { doiTuong: "Children (6-13 years old)", usd: "$4/child", vnd: "100.000đ/child" },
      { doiTuong: "Children (older than 13)", usd: "$6/child", vnd: "150.000đ/child" },
      { doiTuong: "Aldult", usd: "$8/person", vnd: "200.000đ/person" },
    ]
  },

  {
    loaiDichVu: "Overtime charge",
    options: [
      { dieuKien: "Before 18h", usd: "50%/room", vnd: "50% per room" },
      { dieuKien: "After 18h", usd: "100%/room", vnd: "100% per room" },
    ]
  },
];

const UU_DAI_EN = [
  { tieuDe: "When booking 1 month in advance", moTa: "Discount 5% on room’s price" },
  { tieuDe: "Customers order from the 2nd time", moTa: "Discount 5% on room’s price" },
  { tieuDe: "Stay from 7 days to less than 1 month", moTa: "Discount 5% on room’s price" },
];

const formatVND = (n: number) => n.toLocaleString("vi-VN", { minimumFractionDigits: 0 }) + " VND";

export default function AboutUs() {
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('role') : undefined;
  const [language, setLanguage] = useState<'VN' | 'EN'>('VN');
  const [copied, setCopied] = useState<string>("");

  const toggleLang = () => setLanguage(language === 'VN' ? 'EN' : 'VN');

  const NOI_QUY = language === 'VN' ? NOI_QUY_VN : NOI_QUY_EN;
  const GIA_PHONG = language === 'VN' ? GIA_PHONG_VN : GIA_PHONG_EN;
  const DICH_VU = language === 'VN' ? DICH_VU_VN : DICH_VU_EN;
  const UU_DAI = language === 'VN' ? UU_DAI_VN : UU_DAI_EN;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Hàm copy nội dung
  const handleCopy = async (type: string) => {
    let text = "";
    if (type === "rules") {
      text = NOI_QUY.join("\n");
    } else if (type === "room") {
      text = GIA_PHONG.map(r => `${r.loaiPhong}: ${language === 'VN' ? `Ngày: ${formatVND(r.ngayVND)}, Tháng: ${formatVND(r.thangVND)}` : `Per Night: $${r.ngayUSD}, Per Month: $${r.thangUSD}`}`).join("\n");
    } else if (type === "service") {
      text = DICH_VU.map(row => {
        if (row.options) {
          return `${row.loaiDichVu}:\n` + row.options.map(opt => `${opt.doiTuong || opt.dieuKien}: ${opt.usd} | ${opt.vnd}`).join("\n");
        } else {
          return `${row.loaiDichVu}: ${row.usd} | ${row.vnd}`;
        }
      }).join("\n");
    } else if (type === "promo") {
      text = UU_DAI.map(ud => `${ud.tieuDe}: ${ud.moTa}`).join("\n");
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  return (
    <MainLayout userRole={userRole}>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-[#af3c6a]">
            {language === 'VN' ? 'Nội Quy • Giá Phòng • Dịch Vụ • Ưu Đãi' : 'House Rules • Room Rates • Services • Promotions'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'VN' ? 'Trang thông tin để nhân viên tư vấn khách nhanh chóng và chính xác' : 'Information page for staff to consult guests quickly and accurately'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              className="text-[#af3c6a] bg-white border-[#af3c6a] hover:text-white hover:bg-[#d19ab4] hover:border-[#d19ab4]"
              onClick={() => scrollTo('noi-quy')}>
              {language === 'VN' ? 'Nội quy' : 'House Rules'}
            </Button>
            <Button
              variant="outline"
              className="text-[#af3c6a] bg-white border-[#af3c6a] hover:text-white hover:bg-[#d19ab4] hover:border-[#d19ab4]"
              onClick={() => scrollTo('gia-phong')}>
              {language === 'VN' ? 'Giá phòng' : 'Room Rates'}
            </Button>
            <Button
              variant="outline"
              className="text-[#af3c6a] bg-white border-[#af3c6a] hover:text-white hover:bg-[#d19ab4] hover:border-[#d19ab4]"
              onClick={() => scrollTo('dich-vu')}>
              {language === 'VN' ? 'Dịch Vụ' : 'Services'}
            </Button>
            <Button
              variant="outline"
              className="text-[#af3c6a] bg-white border-[#af3c6a] hover:text-white hover:bg-[#d19ab4] hover:border-[#d19ab4]"
              onClick={() => scrollTo('uu-dai')}>
              {language === 'VN' ? 'Ưu đãi' : 'Promotions'}
            </Button>
            <Button
              variant="outline"
              className="text-white bg-blue-500 hover:text-blue-500 hover:bg-white hover:border-blue-500"
              onClick={toggleLang} >
              {language === 'VN' ? 'English' : 'Tiếng Việt'}
            </Button>
          </div>
        </div>

        {/* Nội quy */}
        <Card id="noi-quy" className="shadow-xl border-l-4 border-[#af3c6a]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-[#af3c6a]">
              {language === 'VN' ? 'Nội quy' : 'House Rules'}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleCopy("rules")}>{copied === "rules" ? "Đã copy" : "Copy"}</Button>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              {NOI_QUY.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Giá phòng */}
        <Card id="gia-phong" className="shadow-xl border-l-4 border-blue-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-blue-600">
              {language === 'VN' ? 'Giá phòng' : 'Room Rates'}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleCopy("room")}>{copied === "room" ? "Đã copy" : "Copy"}</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-center">{language === 'VN' ? 'Loại phòng' : 'Room Type'}</th>
                    <th className="px-4 py-3 text-center">{language === 'VN' ? 'Thuê theo ngày (USD)' : 'Per Night (USD)'}</th>
                    <th className="px-4 py-3 text-center">{language === 'VN' ? 'Thuê theo ngày (VND)' : 'Per Night (VND)'}</th>
                    <th className="px-4 py-3 text-center">{language === 'VN' ? 'Thuê theo tháng (USD)' : 'Per Month (USD)'}</th>
                    <th className="px-4 py-3 text-center">{language === 'VN' ? 'Thuê theo tháng (VND)' : 'Per Month (VND)'}</th>
                  </tr>
                </thead>
                <tbody>
                  {GIA_PHONG.map((row) => (
                    <tr key={row.loaiPhong} className="border-t text-center">
                      <td className="px-4 py-3 font-medium text-center">{row.loaiPhong}</td>
                      <td className="px-4 py-3 text-center">${row.ngayUSD}</td>
                      <td className="px-4 py-3 text-center">{formatVND(row.ngayVND)}</td>
                      <td className="px-4 py-3 text-center">${row.thangUSD}</td>
                      <td className="px-4 py-3 text-center">{formatVND(row.thangVND)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dịch vụ */}
        <Card id="dich-vu" className="shadow-xl border-l-4 border-purple-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-purple-600">
              {language === 'VN' ? 'Dịch vụ có thu phí' : 'Extra Services'}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleCopy("service")}>{copied === "service" ? "Đã copy" : "Copy"}</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">{language === 'VN' ? 'Dịch vụ' : 'Service'}</th>
                    <th className="px-4 py-3 text-left">USD</th>
                    <th className="px-4 py-3 text-left">VND</th>
                  </tr>
                </thead>
                <tbody>
                  {DICH_VU.map((row, idx) => (
                    row.options ? (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3 font-medium" colSpan={3}>
                          {row.loaiDichVu}
                          <ul className="list-disc pl-6 mt-2 space-y-1">
                            {row.options.map((opt, i) => (
                              <li key={i}>
                                {opt.doiTuong || opt.dieuKien}: {opt.usd} | {opt.vnd}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ) : (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3 font-medium">{row.loaiDichVu}</td>
                        <td className="px-4 py-3">{row.usd}</td>
                        <td className="px-4 py-3">{row.vnd}</td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Ưu đãi */}
        <Card id="uu-dai" className="shadow-xl border-l-4 border-green-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-green-600">
              {language === 'VN' ? 'Ưu đãi' : 'Promotions'}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleCopy("promo")}>{copied === "promo" ? "Đã copy" : "Copy"}</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UU_DAI.map((ud, idx) => (
                <div key={idx} className="rounded-lg border p-4">
                  <div className="font-semibold text-lg">{ud.tieuDe}</div>
                  <div className="text-gray-700 mt-1">{ud.moTa}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
