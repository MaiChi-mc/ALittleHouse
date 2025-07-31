import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, User, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { useEmail } from "@/hooks/useEmail";


const Messages = () => {
    const userRole = localStorage.getItem('role');
  const [selectedChannel, setSelectedChannel] = useState<string | null>("email");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [emailBody, setEmailBody] = useState("");

  // const { threads, sendEmail } = useEmail();
  const { threads: initialThreads, sendEmail } = useEmail();
const [threads, setThreads] = useState([]);

// Đồng bộ lại threads khi initialThreads thay đổi
useEffect(() => {
  if (initialThreads && initialThreads.length > 0) {
    setThreads(initialThreads);
  }
}, [initialThreads]);

  const emailConversations = threads.map((thread) => {
    const first = thread.messages[0];
    const last = thread.messages[thread.messages.length - 1];
    return {
      id: thread.id,
      name: first.from?.split("<")[0]?.trim() || first.from,
      lastMessage: last.snippet,
      time: new Date(last.date).toLocaleString(),
      unread: 0,
      channel: "email",
      bookingId: undefined,
    };
  });

  console.log("Email conversations:", emailConversations.length);

  // Danh sách hội thoại giả lập
  const allConversations = [
    ...emailConversations,
    { id: "f1", name: "John Smith", lastMessage: "When is check-in time?", time: "10:45 AM", unread: 2, channel: "facebook", bookingId: "B-1001" },
    { id: "f2", name: "Maria Garcia", lastMessage: "Change my reservation", time: "Yesterday", unread: 1, channel: "facebook", bookingId: "B-1002" },
    { id: "a1", name: "Emma Johnson", lastMessage: "Do you have airport shuttle?", time: "May 13", unread: 1, channel: "airbnb", bookingId: "B-1004" },
    { id: "g1", name: "Michael Brown", lastMessage: "Early check-in", time: "May 10", unread: 0, channel: "agoda", bookingId: "B-1005" },
  ];

  // Lọc theo kênh
  // const filteredConversations = selectedChannel
  //   ? allConversations.filter((conversation) => conversation.channel === selectedChannel)
  //   : allConversations;

  // Tìm thông tin hội thoại được chọn
  const selectedThread = threads.find((thread) => thread.id === selectedConversation);
  const selectedMessages = selectedThread?.messages || [];
  const selectedConversationData = allConversations.find((conv) => conv.id === selectedConversation);

  // Icon của từng kênh
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "facebook":
        return <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">FB</div>;
      case "email":
        return <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white">GM</div>;
      case "airbnb":
        return <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center text-white">AB</div>;
      case "agoda":
        return <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center text-white">AG</div>;
      default:
        return <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white">?</div>;
    }
  };

  return (
    <MainLayout userRole={userRole}>
      <div className="h-[calc(100vh-130px)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Unified inbox for all your communication channels</p>
        </div>

        <div className="flex h-full border rounded-lg overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 flex flex-col border-r">
            {/* lựa chọn kênh tin nhắn */}
            <Tabs value={selectedChannel || "facebook"} onValueChange={(value) => setSelectedChannel(value)}>
              <TabsList className="flex justify-between p-1 m-2">
                {["facebook", "email", "airbnb", "agoda"].map((channel) => (
                  <TabsTrigger key={channel} value={channel} className="relative flex-1">
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {["facebook", "email", "airbnb", "agoda"].map((channel) => {
                const channelConversations = allConversations.filter( // lọc theo từng kênh
                  (conversation) => conversation.channel === channel
                );

                return (
                  <TabsContent key={channel} value={channel} className="m-0 flex-1 flex flex-col">
                    <div className="px-3 py-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search messages..." className="w-full pl-8" />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex-1 overflow-hidden"></div>
                    <ScrollArea className="flex-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                      <div className="space-y-1 p-2">
                        {channelConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer ${
                          selectedConversation === conversation.id ? "bg-secondary" : "hover:bg-secondary/50"
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="shrink-0">
                          <div className="h-10 w-10 rounded-full bg-hotel-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-hotel-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.name}</p>
                            <span className="text-xs text-muted-foreground">{conversation.time}</span>
                          </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.bookingId && (
                              <p className="text-xs text-blue-600 truncate">
                                  Booking: {conversation.bookingId}
                              </p>
                            )}
                          </div>
                          {conversation.unread > 0 && (
                            <div className="shrink-0">
                              <span className="h-5 w-5 rounded-full bg-hotel-500 flex items-center justify-center text-white text-xs">
                                {conversation.unread}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              );
              })}
            </Tabs>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-hotel-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-hotel-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedConversationData?.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {selectedConversationData?.channel.charAt(0).toUpperCase() + selectedConversationData?.channel.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedConversationData?.bookingId && (
                      <Link to="/bookings">
                        <Button variant="outline" size="sm">
                          View Booking ({selectedConversationData.bookingId})
                        </Button>
                      </Link>
                    )}
                    {/* <Button variant="ghost" size="sm">View Profile</Button> Xem profile của người dùng (khách) */}
                  </div>
                </div>

                {/* Message area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedMessages.map((message, index) => {
                      const isHotel = message.from.includes("alittlehouse85@gmail.com");
                      return (
                        <div key={index} className={`flex ${isHotel ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] ${isHotel ? "bg-hotel-500 text-white" : "bg-secondary"} rounded-lg px-4 py-2`}>
                            <p
                              dangerouslySetInnerHTML={{
                                __html:
                                  (message.snippet?.replace(/Vào.*?đã viết:.*/is, '').trim()) ||
                                  message.subject,
                              }}
                            />
                            <p className={`text-xs ${isHotel ? "text-hotel-100" : "text-muted-foreground"} text-right mt-1`}>
                              {new Date(message.date).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={async () => {
                        const firstMessage = selectedMessages[0]; // Lấy message đầu tiên trong thread đang chọn

                        console.log(" messageId:", selectedMessages[0]?.messageId);

                        const rawRecipient = firstMessage?.replyTo || firstMessage?.from; // Lấy người nhận

                        const recipient =
                          rawRecipient.includes("<") && rawRecipient.includes(">")
                            ? rawRecipient.split("<")[1].split(">")[0].trim()
                            : rawRecipient.trim();

                        const subject = firstMessage?.subject || "No Subject"; // Tạo subject trả lời
                        const inReplyTo = firstMessage?.messageId; // lấy messageId từ message đầu tiên

                        console.log("recipient", recipient);
                        console.log("subject", subject);
                        console.log("body", emailBody);

                        if (recipient && emailBody.trim()) {
                          const success = await sendEmail({ to: recipient, subject, body: emailBody, threadId: selectedThread?.id, inReplyTo: firstMessage?.messageId, });

                          console.log("Send success:", success);

                          if (success) {
                            const newMessage = {
                              from: "alittlehouse85@gmail.com",
                              replyTo: recipient,
                              subject,
                              date: new Date().toISOString(),
                              snippet: emailBody,
                            };
                            
                            if (selectedThread) {
                              const updateThread = {
                                ...selectedThread,
                                messages: [...selectedThread.messages, newMessage],
                              };
                              setThreads((prevThreads) =>
                                prevThreads.map((thread) =>
                                  thread.id === selectedConversation
                                    ? {
                                       ...thread,
                                      messages: [...thread.messages, newMessage],
                                    }
                                    : thread
                                  )
                                );
                            }
                            setEmailBody(""); // Xóa nội dung đã gửi
                          }
                        }
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium">No conversation selected</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  Select a conversation from the list to start chatting or respond to guest inquiries.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
