
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, User, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Messages = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>("facebook");
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");

  // Mock data for channels
  const channels = [
    { id: "facebook", name: "Facebook", icon: "facebook", unread: 3 },
    { id: "email", name: "Email", icon: "mail", unread: 1 },
    { id: "airbnb", name: "Airbnb", icon: "airbnb", unread: 0 },
    { id: "agoda", name: "Agoda", icon: "agoda", unread: 2 },
  ];

  // Mock data for conversations with booking links
  const conversations = [
    { id: "1", name: "John Smith", lastMessage: "When is check-in time?", time: "10:45 AM", unread: 2, channel: "facebook", bookingId: "B-1001" },
    { id: "2", name: "Maria Garcia", lastMessage: "I need to change my reservation", time: "Yesterday", unread: 1, channel: "facebook", bookingId: "B-1002" },
    { id: "3", name: "David Wilson", lastMessage: "Booking confirmation #12345", time: "May 14", unread: 0, channel: "email", bookingId: "B-1003" },
    { id: "4", name: "Emma Johnson", lastMessage: "Do you have airport shuttle?", time: "May 13", unread: 1, channel: "airbnb", bookingId: "B-1004" },
    { id: "5", name: "Michael Brown", lastMessage: "Special request: early check-in", time: "May 10", unread: 0, channel: "agoda", bookingId: "B-1005" },
  ];

  // Mock data for messages in a conversation
  const messages = [
    { id: "1", sender: "user", text: "Hello! I'm interested in booking a room for next weekend.", time: "10:30 AM" },
    { id: "2", sender: "hotel", text: "Hi John, thank you for your interest! We'd be happy to help you book a room. Do you have specific dates in mind?", time: "10:35 AM" },
    { id: "3", sender: "user", text: "Yes, I'm looking at May 25-27. Do you have any standard rooms available?", time: "10:38 AM" },
    { id: "4", sender: "hotel", text: "Let me check our availability for those dates... Yes, we have standard rooms available! Would you like me to proceed with a booking?", time: "10:42 AM" },
    { id: "5", sender: "user", text: "That sounds great. When is the check-in time?", time: "10:45 AM" },
  ];

  const filteredConversations = selectedChannel
    ? conversations.filter(conversation => conversation.channel === selectedChannel)
    : conversations;

  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation);

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
    <MainLayout>
      <div className="h-[calc(100vh-130px)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unified inbox for all your communication channels
          </p>
        </div>
        
        <div className="flex h-full border rounded-lg overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 flex flex-col border-r">
            {/* Channel tabs */}
            <Tabs value={selectedChannel || "facebook"} onValueChange={(value) => setSelectedChannel(value)}>
              <TabsList className="flex justify-between p-1 m-2">
                {channels.map((channel) => (
                  <TabsTrigger 
                    key={channel.id}
                    value={channel.id}
                    className="relative flex-1"
                  >
                    {channel.name}
                    {channel.unread > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                        {channel.unread}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* We need to add TabsContent components for each tab value */}
              {channels.map((channel) => (
                <TabsContent key={channel.id} value={channel.id} className="m-0 flex-1 flex flex-col">
                  {/* Search */}
                  <div className="px-3 py-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search messages..."
                        className="w-full pl-8"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Conversation list */}
                  <ScrollArea className="flex-1">
                    <div className="space-y-1 p-2">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`flex items-start gap-3 p-3 rounded-md cursor-pointer ${
                            selectedConversation === conversation.id
                              ? "bg-secondary"
                              : "hover:bg-secondary/50"
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
              ))}
            </Tabs>
          </div>
          
          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-hotel-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-hotel-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">John Smith</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                          <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center">
                          {getChannelIcon("facebook")}
                          <span className="text-xs text-muted-foreground ml-1">Facebook</span>
                        </div>
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
                    <Button variant="ghost" size="sm">View Profile</Button>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === "hotel" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[70%] ${message.sender === "hotel" ? "bg-secondary" : "bg-hotel-500 text-white"} rounded-lg px-4 py-2`}>
                          <p>{message.text}</p>
                          <p className={`text-xs ${message.sender === "hotel" ? "text-muted-foreground" : "text-hotel-100"} text-right mt-1`}>
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Input area */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Type your message..." 
                      className="flex-1" 
                    />
                    <Button>
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
