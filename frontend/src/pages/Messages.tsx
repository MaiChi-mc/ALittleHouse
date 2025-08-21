import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MessageCircle,
  User,
  Send,
  Facebook,
  Mail,
  Home,
  Globe,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmail } from "@/hooks/useEmail";

// Các nền tảng ngoài: chỉ hiển thị thẻ (card) dẫn link
const EXTERNAL_LINKS = [
  {
    value: "facebook",
    label: "Facebook",
    url: "https://business.facebook.com/latest/inbox/all/?asset_id=494341691067161",
    icon: <Facebook className="h-5 w-5" />,
    description: "Mở Facebook Messenger",
  },
  {
    value: "airbnb",
    label: "Airbnb",
    url: "https://www.airbnb.com/hosting/messages/2259919156",
    icon: <Home className="h-5 w-5" />,
    description: "Quản lý đặt phòng Airbnb",
  },
  {
    value: "agoda",
    label: "Agoda",
    url: "https://ycs.agoda.com/mldc/en-us/app/reporting/booking/multiproperty",
    icon: <Globe className="h-5 w-5" />,
    description: "Đăng nhập Agoda Partner",
  },
  {
    value: "booking",
    label: "Booking.com",
    url: "https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/home.html?ses=ce81629067920ec73b778144fb3b9e76&f_gc_header=1&hotel_id=14341961",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Truy cập Booking.com Extranet",
  },
] as const;

type ExternalValue = (typeof EXTERNAL_LINKS)[number]["value"];

const CHANNELS: ReadonlyArray<ExternalValue | "email"> = [
  "facebook",
  "email",
  "airbnb",
  "agoda",
  "booking",
];

const Messages = () => {
  const userRole = localStorage.getItem("role");

  const [selectedChannel, setSelectedChannel] = useState<string>("email");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [emailBody, setEmailBody] = useState("");

  // Email threads từ hook (không còn mockdata)
  const { threads: initialThreads, sendEmail } = useEmail();
  const [threads, setThreads] = useState<any[]>([]);

  // Đồng bộ lại threads khi initialThreads thay đổi
  useEffect(() => {
    if (initialThreads && initialThreads.length > 0) {
      setThreads(initialThreads);
    }
  }, [initialThreads]);

  // Chuẩn hóa danh sách hội thoại email
  const emailConversations = threads.map((thread: any) => {
    const first = thread.messages?.[0] ?? {};
    const last = thread.messages?.[thread.messages.length - 1] ?? {};
    return {
      id: thread.id,
      name: first.from?.split("<")[0]?.trim() || first.from || "(No name)",
      lastMessage: last?.snippet || "",
      time: last?.date ? new Date(last.date).toLocaleString() : "",
    };
  });

  const selectedThread = threads.find((t: any) => t.id === selectedConversation);
  const selectedMessages = selectedThread?.messages || [];

  // UI card link cho các nền tảng ngoài
  const ExternalLinkCard = ({ value }: { value: ExternalValue }) => {
    const link = EXTERNAL_LINKS.find((l) => l.value === value)!;
    return (
      <div className="flex items-center justify-center flex-1 p-4">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mx-4 border rounded-lg p-4 shadow-sm flex items-start gap-3 hover:bg-secondary/50 transition"
        >
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
            {link.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{link.label}</p>
            <p className="text-sm text-muted-foreground truncate">{link.description}</p>
          </div>
        </a>
      </div>
    );
  };

  return (
    <MainLayout userRole={userRole}>
      <div className="h-[calc(100vh-130px)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-[#af3c6a]">Tin Nhắn</h1>
          <p className="text-sm text-muted-foreground mt-1">Hộp thư kết nối các trang mạng xã hội</p>
        </div>

        <div className="flex h-full border rounded-lg overflow-hidden shadow-xl">
          {/* Sidebar */}
          <div className="w-[440px] shrink-0 flex flex-col border-r overflow-hidden">
            <Tabs value={selectedChannel} onValueChange={(value) => setSelectedChannel(value)} className="flex h-full flex-col">
              <TabsList className="flex w-full p-1 m-2">
                {CHANNELS.map((channel) => (
                  <TabsTrigger
                    key={channel}
                    value={channel}
                    className="data-[state=active]:bg-[#4b9ae9] data-[state=active]:text-white hover:bg-[#4b9ae9] hover:text-white rounded-lg px-4 py-2 transition whitespace-nowrap"
                  >
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Email: danh sách hội thoại thật từ Gmail */}
              <TabsContent value="email" className="m-0 flex-1 min-h-0 min-w-0 flex flex-col">
                <div className="px-3 py-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search messages..." className="w-full pl-8" />
                  </div>
                </div>
                <Separator />

                <ScrollArea className="flex-1 min-h-0 w-full">
                  <div className="space-y-1 p-2">
                    {emailConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer ${selectedConversation === conversation.id ? "bg-secondary" : "hover:bg-secondary/50"
                          }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="shrink-0">
                          <div className="h-10 w-10 rounded-full bg-hotel-100 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-hotel-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">{conversation.name}</p>
                            <span className="text-xs text-muted-foreground shrink-0">{conversation.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    ))}

                    {emailConversations.length === 0 && (
                      <div className="text-sm text-muted-foreground p-3">Chưa có hội thoại email.</div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Các tab nền tảng ngoài: card link */}
              {EXTERNAL_LINKS.map((l) => (
                <TabsContent key={l.value} value={l.value} className="min-w-0">
                  <ExternalLinkCard value={l.value} />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Khu vực chat chỉ dùng cho Email */}
          <div className="flex-1 min-w-0 flex flex-col">
            {selectedChannel === "email" ? (
              selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="px-4 py-3 border-b flex items-center gap-3 bg-white">
                    <div className="h-10 w-10 rounded-full bg-hotel-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-hotel-600" />
                    </div>
                    <h3 className="font-medium">Email conversation</h3>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 min-h-0 p-4">
                    <div className="space-y-4">
                      {selectedMessages.map((message: any, index: number) => {
                        const isHotel = (message.from || "").includes("alittlehouse85@gmail.com");
                        return (
                          <div key={index} className={`flex ${isHotel ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[70%] ${isHotel ? "bg-hotel-500 text-white" : "bg-secondary"} rounded-lg px-4 py-2 break-words`}
                            >
                              <p
                                dangerouslySetInnerHTML={{
                                  __html:
                                    (message.snippet?.replace(/Vào.*?đã viết:.*/is, "").trim()) ||
                                    message.subject || "(no content)",
                                }}
                              />
                              <p
                                className={`text-xs ${isHotel ? "text-hotel-100" : "text-muted-foreground"} text-right mt-1`}
                              >
                                {message.date ? new Date(message.date).toLocaleTimeString() : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  {/* Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Nhập tin nhắn..."
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                      variant="outline"
                      className="text-white bg-blue-500 hover:text-blue-500 hover:bg-white hover:border-blue-500"
                        onClick={async () => {
                          const firstMessage = selectedMessages[0];
                          if (!firstMessage) return;

                          const rawRecipient = firstMessage?.replyTo || firstMessage?.from || "";
                          const recipient = rawRecipient.includes("<") && rawRecipient.includes(">")
                            ? rawRecipient.split("<")[1].split(">")[0].trim()
                            : rawRecipient.trim();

                          const subject = firstMessage?.subject || "No Subject";
                          const inReplyTo = firstMessage?.messageId;

                          if (recipient && emailBody.trim()) {
                            const success = await sendEmail({
                              to: recipient,
                              subject,
                              body: emailBody,
                              threadId: selectedThread?.id,
                              inReplyTo,
                            });

                            if (success) {
                              const newMessage = {
                                from: "alittlehouse85@gmail.com",
                                replyTo: recipient,
                                subject,
                                date: new Date().toISOString(),
                                snippet: emailBody,
                              };
                              if (selectedThread) {
                                setThreads((prev) =>
                                  prev.map((t: any) =>
                                    t.id === selectedThread.id
                                      ? { ...t, messages: [...t.messages, newMessage] }
                                      : t
                                  )
                                );
                              }
                              setEmailBody("");
                            }
                          }
                        }}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Gửi
                      </Button>
                    </div>
                  </div>

                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium">Không có đoạn hội thoại nào</h3>
                  <p className="text-muted-foreground max-w-md mt-2">Hãy chọn một đoạn hội thoại email.</p>
                </div>
              )
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Chọn nền tảng ở thanh bên trái để mở liên kết.
              </div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default Messages;
