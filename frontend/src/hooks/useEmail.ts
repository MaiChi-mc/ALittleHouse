import { useEffect, useState, useCallback } from "react";

export interface EmailMessage { // mô tả một email
  from: string;
  subject: string;
  date: string;
  snippet: string;
}

export interface EmailThread { // mô tả một đoạn chat email (email thread)
  id: string;
  messages: EmailMessage[];
}

export function useEmail() {
  const [threads, setThreads] = useState<EmailThread[]>([]); // danh sách các đoạn hội thoại 
  const [loading, setLoading] = useState(false); // hiển thị trạng thái đang tải
  const [error, setError] = useState<string | null>(null);

  
  // Hàm lấy danh sách email (email thread)
  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/email/threads", { // gọi API tới backend tại /api/email/threads để lấy danh sách email
        credentials: "include",
      });

      if (!res.ok) { // Kiểm tra xem HTTP status có phải là thành công (2xx) không
        throw new Error("Failed to load Gmail threads");
      }

      const data = await res.json();
      setThreads(data);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm gửi email qua backend và cập nhật lại email thread bằng fetchThreads
  const sendEmail = async ({
    to,
    subject,
    body,
    threadId,
    inReplyTo,
  }: {
    to: string;
    subject: string; 
    body: string;
    threadId?: string;
    inReplyTo?: string;
  }) => {
  try {
    // kiểm tra lỗi trong Tab Console
    console.log("sendEmail() called with:");
    console.log("to:", to);
    console.log("subject:", subject);
    console.log("body:", body);

    const res = await fetch("http://localhost:8080/api/email/send", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json", // báo server data được gửi ở dạng json
      },
      body: JSON.stringify({
        to: to.replace(/[<>]/g, "").trim(),
        subject,
        body,
        threadId,
        inReplyTo,
    }),
 // dữ liệu được json.stringify thành chuỗi json
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Send email failed:", errText);
      throw new Error("Failed to send email");
    }

    await fetchThreads(); // đảm bảo cập nhật lại danh sách sau khi gửi

    return true;
  } catch (err) {
    console.error("sendEmail exception:", err);
    return false;
  }
};

  // Polling mỗi 10s
  useEffect(() => {
    fetchThreads();
    
    const interval = setInterval(() => {
      fetchThreads();
    }, 10000); // 10 giây

    return () => clearInterval(interval);
  }, [fetchThreads]);

  return {
    threads,
    loading,
    error,
    sendEmail,
  };
}

// Mục tiêu:
// Lấy API từ backend để kéo những đoạn hội thoại từ gmail về, sau đó hiển thị nó lên trên UI. 
// Và gửi email đi, cập nhật lại đoạn hội thoại đó